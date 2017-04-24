import * as Types from "../../io/dofus/types"
import * as Messages from "../../io/dofus/messages"
import ProtocolTypeManager from "../../io/dofus/protocol_type_manager"
import CharacterManager from "../../managers/character_manager.js"
import ChatRestrictionManager from "../../managers/chat_restriction_manager.js"
import WorldManager from "../../managers/world_manager.js"
import ItemManager from "../../game/item/item_manager"
import WorldServer from "../../network/world"
import Logger from "../../io/logger"
import ConfigManager from "../../utils/configmanager.js"
import DBManager from "../../database/dbmanager"
import StatsManager from "../../game/stats/stats_manager"
import ItemBag from "./item_bag"
import Basic from "../../utils/basic"
import DataCenter from "../../database/datacenter"
import CharacterItem from "../../database/models/character_item";

export default class Character {

    lastSalesMessage = 0;
    lastSeekMessage = 0;
    lastMessage = 0;
    isTemporaryMuted = false;
    firstContext = true;
    client = null;
    ignoredForSession = [];
    ignoredsList = [];
    friends = [];
    party = null;
    dialog = null;
    exchange = null;

    constructor(raw, creation) {
        var self = this;
        this._id = raw._id;
        this.accountId = raw.accountId;
        this.name = raw.name;
        this.breed = raw.breed;
        this.sex = raw.sex;
        this.colors = raw.colors;
        this.cosmeticId = raw.cosmeticId;
        this.level = raw.level;
        this.experience = raw.experience;
        this.mapid = raw.mapid;
        this.cellid = raw.cellid;
        this.scale = raw.scale;
        this.dirId = raw.dirId;
        this.statsPoints = raw.statsPoints;
        this.spellPoints = raw.spellPoints;
        this.emotes = raw.emotes;
        this.bagId = raw.bagId ? raw.bagId : -1;
        this.skins = [];
        this.skinsLook = [];
        this.zaapSave = raw.zaapSave;
        this.zaapKnows = raw.zaapKnows;
        this.regenTimestamp = Math.floor(Date.now() / 1000);
        this.spells = raw.spells ? raw.spells : [];

		this.ornaments = raw.ornaments ? raw.ornaments : [];
		this.titles = raw.titles ? raw.titles : [];
		this.activeTitle = raw.activeTitle;
		this.activeOrnament = raw.activeOrnament;

		this.alignmentSide = raw.alignmentSide;
		this.alignmentValue = raw.alignmentValue;
		this.alignmentGrade = raw.alignmentGrade;
		this.honor = raw.honor;
		this.characterPower = raw.characterPower;
		this.aggressable = raw.aggressable;

        // Bag creation
        if (this.bagId == -1) {
            if (!creation) {
                var bag = new ItemBag();
                this.bindBag(bag);
                this.updateBag();
            }
        }
        else {
            var self = this;
            //Get bag by id
            DBManager.getBag(this.bagId, function (bag) {
                if (bag) {
                    var itemBag = new ItemBag();
                    itemBag.fromRaw(bag);
                    self.itemBag = itemBag;
                    self.bindBag(itemBag);
                }
                else {
                    var itemBag = new ItemBag();
                    itemBag.fromRaw(bag);
                    self.bindBag(itemBag);
                    self.updateBag();
                }
                self.getItemsSet();
            });
        }

        this.stats = [];
        this.statsManager = new StatsManager(this);
        this.statsManager.recalculateStats(raw);

        this.life = raw.life ? raw.life : this.statsManager.getMaxLife();
        this.requestedFighterId = null;

        this.shortcuts = raw.shortcuts ? raw.shortcuts : {};
        this.loadShortcuts();
    }

    getSetById(setId)
    {
        var sets = DataCenter.itemsSets;
        for (var i in sets)
        {
            if (sets[i]._id == setId)
                return sets[i];
        }
        return null;
    }

    getItemsSet() {
        var items = this.getItemsEquiped();
        for (var i in items)
        {
            var itemTemplate = ItemManager.getItemTemplateById(items[i].templateId);
            if (itemTemplate)
            {
                if (itemTemplate.itemSetId != -1) {
                    var set = this.getSetById(itemTemplate.itemSetId);
                    if (set)
                        items[i].set = set;
                    else
                    {
                        Logger.error("Cannot find current set on item !");
                    }
                }
            }
        }
    }

    getItemsEquiped() {
        var equipedItems = [];
        var items = this.itemBag.items;
        for (var i in items)
        {
            if (items[i].position != CharacterItem.DEFAULT_SLOT)
            {
                equipedItems.push(items[i]);
            }
        }
        return equipedItems;
    }

    onDisconnect() {
        CharacterManager.onDisconnect(this);
    }

    onConnected() {
        CharacterManager.onConnected(this);
    }

    getBaseSkin() {
        return CharacterManager.getDefaultLook(this.breed, this.sex);
    }

    getHeadSkinId() {
        return parseInt(CharacterManager.getHead(this.cosmeticId).skins);
    }

    getBreed() {
        return CharacterManager.getBreed(this.breed);
    }

    regen(life) {
        this.life += life;
        if (this.statsManager.getMaxLife() < this.life) this.life = this.statsManager.getMaxLife();
        this.client.send(new Messages.UpdateLifePointsMessage(this.life, this.statsManager.getMaxLife()));
    }

    //// Look Manager ////////////

    getBonesId() {
        return 1;
    }

    getColors() {
        var nextColors = [];
        for (var i = 0; i < this.colors.length; i++) {
            nextColors[i] = i + 1 << 24 | this.colors[i] & 16777215;
        }
        return nextColors;
    }

    refreshEntityLook() {

        var appearenceToShow = [];
        appearenceToShow.push(parseInt(this.getBaseSkin()));

        appearenceToShow.push(parseInt(this.getHeadSkinId()));
        if (this.itemBag) {
            if (this.itemBag.getItemAtPosition(6)) appearenceToShow.push(this.itemBag.getItemAtPosition(6).getTemplate().appearanceId); // Head
            if (this.itemBag.getItemAtPosition(7)) appearenceToShow.push(this.itemBag.getItemAtPosition(7).getTemplate().appearanceId); // Cape
            if (this.itemBag.getItemAtPosition(15)) appearenceToShow.push(this.itemBag.getItemAtPosition(15).getTemplate().appearanceId); // Bouclier
        }
        this.skins = appearenceToShow;

         if(this.skinsLook.length > 0 ){
            for(var i of this.skinsLook){
                this.skins.push(i);
            }
        }
    }

    refreshLookOnMap() {
        if (this.getMap()) {
            this.getMap().send(new Messages.GameContextRefreshEntityLookMessage(this._id, this.getEntityLook()));
        }
    }

    getSubentities() {
        var subentities = [];
        if (this.itemBag && !this.isRiding()) {
            if (this.itemBag.getItemAtPosition(8)) { // Familier
                if(this.itemBag.getItemAtPosition(8).getTemplate().look != null) {
                    let look = Basic.parseLook(this.itemBag.getItemAtPosition(8).getTemplate().look);
                    var entity = new Types.SubEntity(1, 0, new Types.EntityLook
                    (parseInt(look[0]), [], [0, 0, 0, 0, 0], [look[3] ? parseInt(look[3]) : 100], []));
                    subentities.push(entity);
                }
            }
        }
        else {
            subentities.push(new Types.SubEntity(2, 0, new Types.EntityLook(2, this.skins,
                this.getColors(), [this.scale], [])));
        }
        return subentities;
    }

    isRiding() {
        if (this.itemBag) {
            if (this.itemBag.getItemAtPosition(8)) { // Familier
                if(this.itemBag.getItemAtPosition(8).getTemplate().typeId == 121) {
                    return true;
                }
            }
        }
        return false;
    }

    getEntityLook() {
        this.refreshEntityLook();

        var characterColors = this.getColors();
        if(this.isRiding()) {
            return new Types.EntityLook(this.itemBag.getItemAtPosition(8).getTemplate().appearanceId, [],
                [characterColors[0], characterColors[1], characterColors[2]], [100], this.getSubentities());
        }
        else {
            return new Types.EntityLook(this.getBonesId(), this.skins,
                this.getColors(), [this.scale], this.getSubentities());
        }
    }


    ///////////////////////////

    getCharacterBaseInformations() {
        return new Types.CharacterBaseInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex);
    }

    getCharacterRestrictions() {
        return new Types.ActorRestrictionsInformations(false, false, false, false, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false, false, false, false);
    }

	getHumanOption() {
		var options = new Array();
		// TODO: Guilde, Alliance, Emotes
		options.push(new Types.HumanOptionTitle(this.activeTitle, ""));
		options.push(new Types.HumanOptionOrnament(this.activeOrnament));
		return options;
	}

	getActorAlignementInformations() {
		// TODO  Change this ?
		this.client.send(new Messages.AlignementRankUpdateMessage(this.getAlignRank(this.alignmentSide), false));
		return new Types.ActorAlignmentInformations(this.alignmentSide, this.alignmentValue, this.alignmentGrade, this.characterPower);
	}

    getGameRolePlayCharacterInformations(account) {
        return new Types.GameRolePlayCharacterInformations(this._id, this.getEntityLook(), new Types.EntityDispositionInformations(this.cellid, this.dirId),
            this.name, new Types.HumanInformations(this.getCharacterRestrictions(), this.sex, this.getHumanOption()), account.uid, this.getActorAlignementInformations());
    }

    getMap() {
        return WorldManager.getMapInstantly(this.mapid);
    }

    replyText(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, [string]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyError(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#ff0000\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyImportant(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#E8890D\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyWelcome(string) {
        try {
            this.client.send(new Messages.TextInformationMessage(0, 0, ["<font color=\"#ffffff\">" + string + "</font>"]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replyLangsMessage(typeId, id, params) {
        try {
            this.client.send(new Messages.TextInformationMessage(typeId, id, params));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    replySystemMessage(hangup, string) {
        try {
            this.client.send(new Messages.SystemMessageDisplayMessage(hangup, 61, [string]));
        }
        catch (error) {
            Logger.error(error);
        }
    }

    canSendSalesMessage() {
        return ChatRestrictionManager.canSendSalesMessages(this) ? true : false;
    }

    updateLastSalesMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastSalesMessage = time();
    }

    canSendSeekMessage() {
        return ChatRestrictionManager.canSendSeekMessage(this) ? true : false;
    }

    updateLastSeekMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastSeekMessage = time();
    }

    canSendMessage() {
        return ChatRestrictionManager.canSendMessage(this) ? true : false;
    }

    updateLastMessage() {
        var time = Date.now || function () {
                return +new Date;
            };
        this.lastMessage = time();
        this.isTemporaryMuted = false;
    }

    disconnect(reason) {
        if (reason)
            this.client.send(new Messages.SystemMessageDisplayMessage(true, 61, [reason]));
        this.dispose();
    }

    dispose() {
        this.client.close();
    }

    ban(byName, reason) {
        var self = this;
        DBManager.updateAccount(this.client.account.uid, {locked: 1}, function () {
            if (reason)
                self.disconnect("Vous avez été banni par " + byName + ": " + reason);
            else
                self.disconnect("Vous avez été banni par " + byName);
        });
    }

    save(callback) {
        var self = this;
        var toUpdate = {
            mapid: this.mapid,
            cellid: this.cellid,
            dirId: this.dirId,
            level: this.level,
            experience: this.experience,
            statsPoints: this.statsPoints,
            spellPoints: this.spellPoints,
            life: this.life,
            bagId: this.bagId,
            spells: this.spells,
            scale: this.scale,
            stats: {
                strength: this.statsManager.getStatById(10).base,
                vitality: this.statsManager.getStatById(11).base,
                wisdom: this.statsManager.getStatById(12).base,
                chance: this.statsManager.getStatById(13).base,
                agility: this.statsManager.getStatById(14).base,
                intelligence: this.statsManager.getStatById(15).base,
            },
            zaapKnows : this.zaapKnows,
            shortcuts: this.shortcuts,

			titles : this.titles,
			ornaments : this.ornaments,
			activeTitle: this.activeTitle,
			activeOrnament: this.activeOrnament,

			alignmentSide : this.alignmentSide,
			alignmentValue : this.alignmentValue,
			alignmentGrade : this.alignmentGrade,
			honor : this.honor,
			characterPower: this.characterPower,
			aggressable: this.aggressable,

        };
        DBManager.updateCharacter(this._id, toUpdate, function () {
            Logger.infos("Character '" + self.name + "(" + self._id + ")' saved");
            if (callback) callback();
        });
    }

    sendEmotesList() {
        CharacterManager.sendEmotesList(this);
    }

    sendWarnOnStateMessages() {
        this.client.send(new Messages.FriendWarnOnConnectionStateMessage(this.client.account.warnOnConnection));
    }

    updateBag() {
        var self = this;
        if (this.bagId == -1) {
            if (this.itemBag != null) {
                this.itemBag.money = ConfigManager.configData.characters_start.kamas;
                this.itemBag.create(function () {
                    self.bindBag(self.itemBag);
                    self.bagId = self.itemBag._id;
                    self.save();
                });
            }
        }
    }

    bindBag(bag) {
        var self = this;
        if (this.itemBag != null) {
            this.itemBag.unbind();
        }
        if (bag == null) return;
        this.itemBag = bag;
        this.itemBag.onItemAdded = function (item) {
            if (item) {
                var itemTemplate = ItemManager.getItemTemplateById(item.templateId);
                if (itemTemplate) {
                    if (itemTemplate.itemSetId != -1) {
                        var set = self.getSetById(itemTemplate.itemSetId);
                        if (set)
                            item.set = set;
                        else {
                            Logger.error("Cannot find current set on item !");
                        }
                    }
                }
            }
            Logger.debug("Item added to character bag");
            self.sendInventoryBag();
        };

        this.itemBag.onItemDeleted = function (item) {
            Logger.debug("Item removed from character bag");
            self.client.send(new Messages.ObjectDeletedMessage(item._id));
            self.sendInventoryBag();
        };

        this.itemBag.onItemUpdated = function (item) {
            Logger.debug("Item updated in character bag");
            self.client.send(new Messages.ObjectQuantityMessage(item._id, item.quantity));
            self.sendInventoryBag();
        };
    }

    sendInventoryBag() {
        if (this.itemBag == null) return;
        this.client.send(new Messages.InventoryWeightMessage(0, 1000));
        this.client.send(new Messages.InventoryContentMessage(this.itemBag.getObjectItemArray(), this.itemBag.money));
    }

    subKamas(amount, notif = true) {
        this.itemBag.money -= parseInt(amount);
        this.sendInventoryBag();
        if (notif)
            this.replyText("Vous avez perdu " + amount + " kamas.");
    }

    addKamas(amount, notif = true) {
        this.itemBag.money = this.itemBag.money + parseInt(amount);
        if (notif)
            this.replyLangsMessage(0, 45, [amount]);
        this.sendInventoryBag();
    }

    isInZaap() {
        if (this.dialog.constructor.name == "ZaapDialog")
            return true;
        else
            return false;
    }

    isInZaapi() {
        if (this.dialog.constructor.name == "ZaapiDialog")
            return true;
        else
            return false;
    }

    setDialog(typedialog) {
        if (this.dialog != null)
            this.dialog.close();

        this.dialog = typedialog;
    }

    closeDialog(typedialog) {
        if (this.dialog == typedialog)
            this.dialog = null;
    }

    leaveDialog() {
        if (this.dialog != null)
            this.dialog.close();
    }

    getExperienceFloorsData() {
        var nextFloor = null;
        if(this.level + 1 <= 200) {
            nextFloor = CharacterManager.getExperienceFloorByLevel(this.level + 1);
        }
        else {
            nextFloor = CharacterManager.getExperienceFloorByLevel(200);
        }
        return { floor: CharacterManager.getExperienceFloorByLevel(this.level), nextFloor: nextFloor };
    }

    addSpell(spell) {
        this.spells.push(spell);
        this.save();
    }

	refreshActor()
	{
		this.client.send(new Messages.GameRolePlayShowActorMessage(this.getGameRolePlayCharacterInformations(this.client.account)));
	}

	isValidTitle(titleId) {
		var titles = DataCenter.titles;
		for(var i in titles) {
			if(titles[i]._id == titleId) {
				return true;
			}
		}
		return false;
	}

	addTitle(titleId) {
		if(this.isValidTitle(titleId))
		{
			if(this.titles.indexOf(titleId) == -1) {
				this.titles.push(titleId);
				this.client.send(new Messages.TitleGainedMessage(titleId));
				this.save();
				return true;
			}
			return false;
		}
		return false;
	}

	addAllTitles() {
		for(var i in DataCenter.titles) {
				this.addTitle(DataCenter.titles[i]._id);
		}
	}

	selectTitle(titleId) {
		for(var i = 0 ; i < this.titles.length ; i++) {
			if(this.titles[i] == titleId) {
				this.activeTitle = titleId;
				this.save();
				this.refreshActor();
				return true;
			}
		}
		this.activeTitle = 0;
		this.save();
		this.refreshActor();
		return false;
	}

	isValidOrnament(ornamentId) {
		var ornaments = DataCenter.ornaments;
		for(var i in ornaments) {
			if(ornaments[i]._id == ornamentId) {
				return true;
			}
		}
		return false;
	}

	addOrnament(ornamentId) {
		if(this.isValidOrnament(ornamentId))
		{
			if(this.ornaments.indexOf(ornamentId) == -1) {
			var length = this.ornaments.push(ornamentId);
				this.client.send(new Messages.OrnamentGainedMessage(ornamentId));
				this.save();
				return 1;
			}
			return 0;
		}
		return -1;
	}

	addAllOrnaments() {
		for(var i in DataCenter.ornaments) {
			this.addOrnament(DataCenter.ornaments[i]._id);
		}
	}

	selectOrnament(ornamentId) {
		for(var i = 0 ; i < this.ornaments.length ; i++) {
			if(this.ornaments[i] == ornamentId) {
				this.activeOrnament = ornamentId;
				this.save();
				this.refreshActor();
				return true;
			}
		}
		this.activeOrnament = 0;
		this.save();
		this.refreshActor();
		return false;
	}

	isValidSide(side) {
		return side >= 0 && side <= 3;
	}

	getAlignRank(side) {
		switch (side) {
			case 0:
				return 0;
			case 1:
				return 17;
			case 2:
				return 33;
			case 3:
				return 40;
			default:
				return 0;
		}
	}

	updateAlignmentInformations() {
		this.client.send(new Messages.AlignementRankUpdateMessage(this.getAlignRank(this.alignmentSide), false));
		this.statsManager.sendStats();
		this.refreshActor();
	}

	setAlignement(side, notif = true) {
		if(this.isValidSide(side)) {
			this.alignmentSide = side;
			this.honor = 0;
			this.alignmentValue = 1;
			this.alignmentGrade = 1;
			this.characterPower = 0;
			this.aggressable = this.alignmentSide == 0 ? false : true;

			this.updateAlignmentInformations();

			if(notif) {
				this.replyText("Vous êtes désormais " + this.alignmentSide + "." );
			}
		}
	}

	addHonor(amount, notif = true) {
		this.honor += parseInt(amount);
		this.honor = this.honor > 20000 ? 20000 : this.honor;
		if(notif)
			this.replyLangsMessage(0, 74, [amount]);
		this.statsManager.checkGradeUp();
	}

    isBusy() {
        if (this.dialog != null)
            return true;
        if(this.requestedFighterId)
            return true;
        if(this.isInFight())
            return true;
        return false;
    }

    isInFight() {
        return this.fighter ? true : false;
    }

    getPartyInformations() {
        var mapPosition = this.getMap().getMapPosition();
        return new Types.PartyMemberInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex, this.life, this.statsManager.getMaxLife(),
            100, 1, 1000, 0, mapPosition.posX, mapPosition.posY, this.mapid, this.getMap().subareaId, new Types.PlayerStatus(0), []);
    }

    getPartyGuestInformations(leaderId) {
        return new Types.PartyGuestInformations(this._id, leaderId, this.name, this.getEntityLook(), this.breed, this.sex, new Types.PlayerStatus(0), []);
    }

    getPartyInvitationMemberInformations() {
        var mapPosition = this.getMap().getMapPosition();
        return new Types.PartyInvitationMemberInformations(this._id, this.name, this.level, this.getEntityLook(), this.breed, this.sex, mapPosition.posX, mapPosition.posY,
            this.mapid, this.getMap().subareaId, []);
    }

    getMapCoordinates() {
        var mapPosition = this.getMap().getMapPosition();
        return new Types.MapCoordinates(mapPosition.posX, mapPosition.posY);
    }

    // Shortcuts

    loadShortcuts() {
        for(var i in this.shortcuts) {
            var bar = this.shortcuts[i];
            for(var i2 in bar) {
                var shortcut = bar[i2];
                if(ProtocolTypeManager.getTypeName(shortcut.protocolId) == "ShortcutSpell") {
                    shortcut.__proto__ = Types.ShortcutSpell.prototype;
                }
            }
        }
    }

    getShortcutBar(barType) {
        if(!this.shortcuts[barType]) this.shortcuts[barType] = {};
        var bar = this.shortcuts[barType];
        var values = [];
        for(var i in bar) {
            values.push(bar[i]);
        }
        return values;
    }

    refreshShortcutsBar() {
        this.client.send(new Messages.ShortcutBarContentMessage(0, this.getShortcutBar(0)));
        this.client.send(new Messages.ShortcutBarContentMessage(1, this.getShortcutBar(1)));
    }

    teleport(mapId, cellId, callback = null) {
        if (callback == null) {
            WorldManager.teleportClient(this.client, mapId, cellId, null);
        } else {
            WorldManager.teleportClient(this.client, mapId, cellId, function(result) {
                callback(result);
            });
        }
    }

    // End shortcuts
}
