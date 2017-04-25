import Datacenter from "../database/datacenter"
import FriendHandler from "../handlers/friend_handler"
import * as Messages from "../io/dofus/messages"
import GameHandler from "../handlers/game_handler"
import Logger from "../io/logger"
import SpellManager from "../game/spell/spell_manager"
import WorldServer from "../network/world"
import * as Types from "../io/dofus/types"

export default class CharacterManager {

    static getBreed(breedId) {
        for (var i in Datacenter.breeds) {
            var b = Datacenter.breeds[i];
            if (b._id == breedId) {
                return b;
            }
        }
    }

    static getHead(cosmeticId) {
        for (var i in Datacenter.heads) {
            var b = Datacenter.heads[i];
            if (b.id == cosmeticId) {
                return b;
            }
        }
    }

    static getDefaultLook(breedId, sex) {
        var breed = CharacterManager.getBreed(breedId);
        return parseInt(sex ? CharacterManager.parseStrLook(breed.femaleLook)[1] : CharacterManager.parseStrLook(breed.maleLook)[1]);
    }

    static getDefaultScale(breedId, sex) {
        var breed = CharacterManager.getBreed(breedId);
        return parseInt(sex ? CharacterManager.parseStrLook(breed.femaleLook)[3] : CharacterManager.parseStrLook(breed.maleLook)[3]);
    }

    static parseStrLook(look) {
        var data = look.replace('{', '').replace('}', '').trim().split('|');
        return data;
    }

    static getFloorForStats(character, type) {
        var breed = character.getBreed();
        var value = 1;
        var current = character.statsManager.getStatById(type).base;
        var floor = null;
        switch (type) {
            case 10:
                floor = breed.statsPointsForStrength;
                break;
            case 11:
                floor = breed.statsPointsForVitality;
                break;
            case 12:
                floor = breed.statsPointsForWisdom;
                break;
            case 13:
                floor = breed.statsPointsForChance;
                break;
            case 14:
                floor = breed.statsPointsForAgility;
                break;
            case 15:
                floor = breed.statsPointsForIntelligence;
                break;
        }
        if (floor != null) {
            var validFloor = null;
            for (var i in floor) {
                var floorData = floor[i];
                if (current >= floorData[0]) {
                    validFloor = floorData[1];
                }
            }
            return validFloor;
        }
        return value;
    }

    static getExperienceFloorByLevel(exp) {
        return Datacenter.experiences.filter(function (x) {
            if (x.level == exp) return x;
        })[0];
    }

    static getExperienceFloorByExperience(exp) {
        var floor = null;
        for (var i in Datacenter.experiences) {
            if (Datacenter.experiences[i].xp <= exp) floor = Datacenter.experiences[i];
        }
        return floor;
    }

	static getHonorFloorByGrade(grade) {
		return Datacenter.experiences.filter(function (x) {
			if(x.level == grade) {
				return x;
			}
		})[0];
	}

	static getHonorFloorByHonor(honor) {
		var floor = null;
		for (var i in Datacenter.experiences) {
			if (Datacenter.experiences[i].honor <= honor && Datacenter.experiences[i].level <= 10)
				floor = Datacenter.experiences[i];
		}
		return floor;
	}


    static onDisconnect(character)
    {
        if (character.party != null)
            character.party.removeMember(character, true);
        if (character.exchange != null)
            character.exchange.close();
        else if (character.invitation != null)
        {
            var party = WorldServer.getPartyById(character.invitation.party.id);
            if (party)
            {
                if (party.isInParty(character))
                    party.removeMember(character, true);
            }
        }
        try { FriendHandler.sendFriendDisconnect(character.client); } catch (error) { Logger.error(error); }
        try { character.save(); } catch (error) { Logger.error(error); }
    }

    static onConnected(character)
    {
        GameHandler.sendWelcomeMessage(character.client);
        FriendHandler.sendFriendsOnlineMessage(character.client);
        try { FriendHandler.warnFriends(character.client); } catch (error) { Logger.error(error); }
        character.sendWarnOnStateMessages(character.client.account.warnOnConnection);
        character.sendInventoryBag();
        character.client.send(new Messages.LifePointsRegenBeginMessage(10));
        character.statsManager.sendStats();
        CharacterManager.learnSpellsForCharacter(character);
        character.statsManager.sendSpellsList();
        character.refreshShortcutsBar();
        CharacterManager.setRegenState(character);
        character.client.send(new Messages.AlmanachCalendarDateMessage(94));
    }

    static sendEmotesList(character)
    {
        character.client.send(new Messages.EmoteListMessage(character.emotes));
    }

    static setRegenState(character) {
        character.regenTimestamp = Math.floor(Date.now() / 1000);
    }

    static applyRegen(character) {
        var now = Math.floor(Date.now() / 1000);
        var diff = now - character.regenTimestamp;
        character.regen(diff);
        character.regenTimestamp = now;
    }

    static learnSpellsForCharacter(character) {
        var result = false;
        for(var s of character.getBreed().breedSpellsId) {
            var spellTemplate = SpellManager.getSpell(s);
            if(spellTemplate) {
                var spellLevel = SpellManager.getSpellLevelById(spellTemplate.spellLevels[0]);
                if(spellLevel) {
                    if(!character.statsManager.hasSpell(spellTemplate._id) && spellLevel.minPlayerLevel <= character.level) {
                        character.spells.push({spellId: spellTemplate._id, spellLevel: 1});
                        CharacterManager.createSpellShortcut(character, spellTemplate._id);
                        result = true;
                    }
                }
            }
        }
        if(result)  {
            character.statsManager.sendSpellsList();
            character.save();
        }
    }

    static LearnSpellById(character, spellId)
    {
        var spellTemplate = SpellManager.getSpell(spellId);
        if(spellTemplate) {
            var spellLevel = SpellManager.getSpellLevelById(spellTemplate.spellLevels[0]);
            if(spellLevel) {
               character.spells.push({spellId: spellTemplate._id, spellLevel: 1});
               character.statsManager.sendSpellsList();
               character.save();
               return true;
            }
        }
        return false;
    }

    static createSpellShortcut(character, spellId) {
        var topIndex = 0;
        if(!character.shortcuts[1])
            character.shortcuts[1] = {}
        for(var i in character.shortcuts[1]) {
            var s = character.shortcuts[1][i];
            if(topIndex <= s.slot) {
                topIndex = s.slot + 1;
            }
        }
        var shortcut = {spellId: spellId, protocolId: 368, slot: topIndex};
        shortcut.__proto__ = Types.ShortcutSpell.prototype;
        character.shortcuts[1][topIndex] = shortcut;
        character.refreshShortcutsBar();
    }
}
