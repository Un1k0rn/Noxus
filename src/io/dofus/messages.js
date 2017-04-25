import IO from "../custom_data_wrapper"
import * as Types from "../dofus/types"
import Logger from "../../io/logger"
import ProtocolTypeManager from "./protocol_type_manager"

export class ProtocolMessage {
    constructor(messageId) {
        this.messageId = messageId;
        this.buffer = new IO.CustomDataWrapper();
    }
}

export class ProtocolRequiredMessage extends ProtocolMessage {

    constructor(requiredVersion, currentVersion) {
        super(1);
        this.requiredVersion = requiredVersion;
        this.currentVersion = currentVersion;
    }

    serialize() {
        this.buffer.writeInt(this.requiredVersion);
        this.buffer.writeInt(this.currentVersion);
    }
}

export class RawDataMessage extends ProtocolMessage {

    constructor(content) {
        super(6253);
        this.content = content;
    }

    serialize() {
        this.buffer.writeVarInt(this.content.length);
        for (var i = 0; i < this.content.length; i++) {
            this.buffer.writeByte(this.content[i]);
        }
    }
}

export class IdentificationMessage extends ProtocolMessage {

    constructor() {
        super(4);
    }

    deserialize(buffer) {
        var flag1 = buffer.readByte();
        this.autoconnect = IO.BooleanByteWrapper.getFlag(flag1, 0);
        this.useCertificate = IO.BooleanByteWrapper.getFlag(flag1, 1);
        this.useLoginToken = IO.BooleanByteWrapper.getFlag(flag1, 2);
        this.version = new Types.VersionExtended();
        this.version.deserialize(buffer);
        this.lang = buffer.readUTF();
        var len1 = buffer.readVarUhShort();
        //this.credentials = buffer.readUTF();
        //this.password = buffer.readUTF();
        //this.serverId = buffer.readShort();
    }
}

export class ServerSelectionMessage extends ProtocolMessage {
    constructor() {
        super(40);
    }
    deserialize(buffer) {
        this.serverId = buffer.readVarUhShort();
    }
}

export class SelectedServerDataMessage extends ProtocolMessage {
    constructor(serverId, host, port, canCreateNewCharacter, ticket) {
        super(42);
        this.serverId = serverId;
        this.host = host;
        this.port = port;
        this.canCreateNewCharacter = canCreateNewCharacter;
        this.ticket = ticket;
    }

    serialize() {
        this.buffer.writeVarShort(this.serverId);
        this.buffer.writeUTF(this.host);
        this.buffer.writeShort(this.port);
        this.buffer.writeBoolean(this.canCreateNewCharacter);
        this.buffer.writeUTF(this.ticket);
    }
}

export class IdentificationFailedMessage extends ProtocolMessage {
    constructor(reason) {
        super(20);
        this.reason = reason;
    }

    serialize() {
        this.buffer.writeByte(this.reason);
    }
}



export class NicknameRegistrationMessage extends ProtocolMessage {
    constructor(reason) {
        super(5640);
    }

    serialize() {

    }
}

export class IdentificationSuccessMessage extends ProtocolMessage {
    constructor(login, nickname, accountId, communityId, hasRights, secretQuestion, accountCreation, subscriptionElapsedDuration, subscriptionEndDate, wasAlreadyConnected, havenbagAvailableRoom) {
        super(22);
        this.login = login;
        this.nickname = nickname;
        this.accountId = accountId;
        this.communityId = communityId;
        this.hasRights = hasRights;
        this.secretQuestion = secretQuestion;
        this.accountCreation = accountCreation;
        this.subscriptionElapsedDuration = subscriptionElapsedDuration;
        this.subscriptionEndDate = subscriptionEndDate;
        this.wasAlreadyConnected = wasAlreadyConnected;
        this.havenbagAvailableRoom = havenbagAvailableRoom;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.hasRights);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.wasAlreadyConnected);
        this.buffer.writeByte(_loc2_);
        this.buffer.writeUTF(this.login);
        this.buffer.writeUTF(this.nickname);
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
        if (this.communityId < 0) {
            Logger.error("Forbidden value (" + this.communityId + ") on element communityId.");
        }
        this.buffer.writeByte(this.communityId);
        this.buffer.writeUTF(this.secretQuestion);
        if (this.accountCreation < 0 || this.accountCreation > 9007199254740990) {
            Logger.error("Forbidden value (" + this.accountCreation + ") on element accountCreation.");
        }
        this.buffer.writeDouble(this.accountCreation);
        if (this.subscriptionElapsedDuration < 0 || this.subscriptionElapsedDuration > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionElapsedDuration + ") on element subscriptionElapsedDuration.");
        }
        this.buffer.writeDouble(this.subscriptionElapsedDuration);
        if (this.subscriptionEndDate < 0 || this.subscriptionEndDate > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionEndDate + ") on element subscriptionEndDate.");
        }
        this.buffer.writeDouble(this.subscriptionEndDate);
        if (this.havenbagAvailableRoom < 0 || this.havenbagAvailableRoom > 255) {
            Logger.error("Forbidden value (" + this.havenbagAvailableRoom + ") on element havenbagAvailableRoom.");
        }
        this.buffer.writeByte(this.havenbagAvailableRoom);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.hasRights = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.wasAlreadyConnected = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.login = buffer.readUTF();
        this.nickname = buffer.readUTF();
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of IdentificationSuccessMessage.accountId.");
        }
        this.communityId = buffer.readByte();
        if (this.communityId < 0) {
            Logger.error("Forbidden value (" + this.communityId + ") on element of IdentificationSuccessMessage.communityId.");
        }
        this.secretQuestion = buffer.readUTF();
        this.accountCreation = buffer.readDouble();
        if (this.accountCreation < 0 || this.accountCreation > 9007199254740990) {
            Logger.error("Forbidden value (" + this.accountCreation + ") on element of IdentificationSuccessMessage.accountCreation.");
        }
        this.subscriptionElapsedDuration = buffer.readDouble();
        if (this.subscriptionElapsedDuration < 0 || this.subscriptionElapsedDuration > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionElapsedDuration + ") on element of IdentificationSuccessMessage.subscriptionElapsedDuration.");
        }
        this.subscriptionEndDate = buffer.readDouble();
        if (this.subscriptionEndDate < 0 || this.subscriptionEndDate > 9007199254740990) {
            Logger.error("Forbidden value (" + this.subscriptionEndDate + ") on element of IdentificationSuccessMessage.subscriptionEndDate.");
        }
        this.havenbagAvailableRoom = buffer.readUnsignedByte();
        if (this.havenbagAvailableRoom < 0 || this.havenbagAvailableRoom > 255) {
            Logger.error("Forbidden value (" + this.havenbagAvailableRoom + ") on element of IdentificationSuccessMessage.havenbagAvailableRoom.");
        }
    }
}

export class ServersListMessage extends ProtocolMessage {
    constructor(servers, alreadyConnectedToServerId, canCreateNewCharacter) {
        super(30);
        this.servers = servers;
        this.alreadyConnectedToServerId = alreadyConnectedToServerId;
        this.canCreateNewCharacter = canCreateNewCharacter;
    }

    serialize() {
        this.buffer.writeShort(this.servers.length);
        for (var i in this.servers) {
            this.servers[i].serialize(this.buffer);
        }
        this.buffer.writeVarShort(this.alreadyConnectedToServerId);
        this.buffer.writeBoolean(this.canCreateNewCharacter);
    }
}

export class HelloConnectMessage extends ProtocolMessage {
    constructor(salt, key) {
        super(3);
        this.salt = salt;
        this.key = key;
    }

    serialize() {
        this.buffer.writeUTF(this.salt);
        this.buffer.writeVarInt(this.key);
        for (var i = 0; i < 303; i++) {
            this.buffer.writeByte(i);
        }
    }
}

export class HelloGameMessage extends ProtocolMessage {
    constructor() {
        super(101);
    }
    serialize() {

    }
}

export class AuthenticationTicketMessage extends ProtocolMessage {

    constructor() {
        super(101);
    }
    deserialize(buffer) {
        this.lang = buffer.readUTF();
        this.ticket = buffer.readUTF();
    }
}

export class AuthenticationTicketAcceptedMessage extends ProtocolMessage {

    constructor() {
        super(111);
    }
    serialize() {

    }
}


export class AccountCapabilitiesMessage extends ProtocolMessage {

    constructor(tutorialAvailable, canCreateNewCharacter, accountId, breedsVisible, breedsAvailable, status) {
        super(6216);
        this.tutorialAvailable = tutorialAvailable;
        this.canCreateNewCharacter = canCreateNewCharacter;
        this.accountId = accountId;
        this.breedsVisible = breedsVisible;
        this.breedsAvailable = breedsAvailable;
        this.status = status;
    }
    serialize() {
        var flag1 = 0;
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 0, this.tutorialAvailable);
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 1, this.canCreateNewCharacter);
        this.buffer.writeByte(flag1);
        this.buffer.writeInt(this.accountId);
        this.buffer.writeVarInt(this.breedsVisible);
        this.buffer.writeVarInt(this.breedsAvailable);
        this.buffer.writeByte(this.status);
    }

}

export class TrustStatusMessage extends ProtocolMessage {

    constructor() {
        super(6267);
    }
    serialize() {
        var flag1 = 0;
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 0, true);
        flag1 = IO.BooleanByteWrapper.setFlag(flag1, 1, true);
        this.buffer.writeByte(flag1);
    }
}

export class ServerOptionalFeaturesMessage extends ProtocolMessage {
    constructor(features) {
        super(6305);
        this.features = features;
    }
    serialize() {
        this.buffer.writeShort(this.features.length);
        for (var feature in this.features) {
            this.buffer.writeByte(feature);
        }
    }
}

export class ServerSettingsMessage extends ProtocolMessage {
    constructor(lang, community, gameType, arenaLeaveBanTime) {
        super(6340);
        this.lang = lang;
        this.community = community;
        this.gameType = gameType;
        this.arenaLeaveBanTime = arenaLeaveBanTime;
    }
    serialize() {
        this.buffer.writeUTF(this.lang);
        this.buffer.writeByte(this.community);
        this.buffer.writeByte(this.gameType);
        this.buffer.writeVarShort(this.arenaLeaveBanTime);
    }
}


export class BasicCharactersListMessage extends ProtocolMessage {

    constructor(characters) {
        super();
        this.messageId = 6475;
        this.characters = characters;
    }
    serialize() {
        this.buffer.writeShort(this.characters.length);
        for (var i in this.characters) {
            this.buffer.writeShort(this.characters[i].protocolId);
            this.characters[i].serialize(this.buffer);
        }
    }
}

export class CharactersListMessage extends BasicCharactersListMessage {

    constructor(characters) {
        super(characters);
        this.messageId = 151;
    }
    serialize() {
        super.serialize();
        this.buffer.writeBoolean(false);
    }
}



export class CharactersListRequestMessage extends ProtocolMessage {

    constructor() {
        super(150);
    }
    deserialize(buffer) {

    }
}

export class CharacterNameSuggestionRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 162;
    }

    deserialize(buffer) {

    }
}

export class CharacterNameSuggestionSuccessMessage extends ProtocolMessage {
    constructor(suggestion) {
        super();
        this.messageId = 5544;
        this.suggestion = suggestion;
    }

    serialize() {
        this.buffer.writeUTF(this.suggestion);
    }
}

export class CharacterCreationRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 160;
    }

    deserialize(buffer) {
        this.name = buffer.readUTF();
        this.breed = buffer.readByte();
        this.sex = buffer.readBoolean();
        this.colors = [];
        var _loc2_ = 0;
        while (_loc2_ < 5) {
            this.colors[_loc2_] = buffer.readInt();
            _loc2_++;
        }
        this.cosmeticId = buffer.readVarUhShort();
    }
}

export class CharacterCreationResultMessage extends ProtocolMessage {
    constructor(result) {
        super();
        this.messageId = 161;

        this.result = result;
    }

    serialize() {
        this.buffer.writeByte(this.result);
    }
}

export class ReloginTokenRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 6540;
    }

    deserialize(buffer) { }
}

export class CharacterSelectionMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 152;
    }

    deserialize(buffer) {
        this.id = buffer.readVarLong();
    }
}

export class CharacterSelectedSuccessMessage extends ProtocolMessage {
    constructor(character, isCollectingStats) {
        super();
        this.messageId = 153;
        this.character = character;
        this.isCollectingStats = isCollectingStats;
    }

    serialize() {
        this.character.serialize(this.buffer);
        this.buffer.writeBoolean(this.isCollectingStats);
    }
}

export class CharacterLoadingCompleteMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 6471;
    }

    serialize() {

    }
}

export class CharacterCapabilitiesMessage extends ProtocolMessage {
    constructor(guildEmblemSymbolCategories) {
        super();
        this.messageId = 6339;
        this.guildEmblemSymbolCategories = guildEmblemSymbolCategories;
    }

    serialize() {
        this.buffer.writeVarInt(this.guildEmblemSymbolCategories);
    }
}

export class GameContextCreateRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 250;
    }

    deserialize(buffer) { }
}

export class GameContextDestroyMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 201;
    }

    serialize() { }
}

export class GameContextCreateMessage extends ProtocolMessage {
    constructor(context) {
        super();
        this.messageId = 200;

        this.context = context;
    }

    serialize() {
        this.buffer.writeByte(this.context);
    }
}

export class CharacterDeletionRequestMessage extends ProtocolMessage {

    constructor() {
        super();
        this.messageId = 165;
    }

    deserialize(buffer) {
        this.characterId = buffer.readVarLong();
        this.secretAnswerHash = buffer.readUTF();
    }
}

export class CharacterDeletionErrorMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 166;
    }

    serialize() {
        this.buffer.writeByte(this.messageId);
    }
}

export class CurrentMapMessage extends ProtocolMessage {
    constructor(mapId, mapKey) {
        super();
        this.messageId = 220;
        this.mapId = mapId;
        this.mapKey = mapKey;
    }

    serialize() {
        this.buffer.writeInt(this.mapId);
        this.buffer.writeUTF(this.mapKey);
    }
}

export class MapInformationsRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 225;
    }

    deserialize(buffer) {
        this.mapId = buffer.readInt();
    }
}

export class MapComplementaryInformationsDataMessage extends ProtocolMessage {
    constructor(subAreaId, mapId, houses, actors, interactiveElements, statedElements, obstacles, fights, hasAggressiveMonsters) {
        super();
        this.messageId = 226;

        this.subAreaId = subAreaId;
        this.mapId = mapId;
        this.houses = houses;
        this.actors = actors;
        this.interactiveElements = interactiveElements;
        this.statedElements = statedElements;
        this.obstacles = obstacles;
        this.fights = fights;
        this.hasAggressiveMonsters = hasAggressiveMonsters;
    }

    serialize() {
        this.buffer.writeVarShort(this.subAreaId);
        this.buffer.writeInt(this.mapId);
        this.buffer.writeShort(this.houses.length);
        for (house in this.houses) {
            this.buffer.writeShort(this.houses[house]);
        }
        this.buffer.writeShort(this.actors.length);
        for (var actor in this.actors) {
            this.buffer.writeShort(this.actors[actor].protocolId);
            this.actors[actor].serialize(this.buffer);
        }
        this.buffer.writeShort(this.interactiveElements.length);
        for (var interactive in this.interactiveElements) {
            this.buffer.writeShort(this.interactiveElements[interactive].protocolId);
            this.interactiveElements[interactive].serialize(this.buffer);
        }
        this.buffer.writeShort(this.statedElements.length);
        for (element in this.statedElements) {
            this.buffer.writeShort(this.statedElements[element]);
        }
        this.buffer.writeShort(this.obstacles.length);
        for (obstacle in this.obstacles) {
            this.buffer.writeShort(this.obstacles[obstacle]);
        }
        this.buffer.writeShort(this.fights.length);
        for (fight in this.fights) {
            this.buffer.writeShort(this.fights[fight]);
        }
        this.buffer.writeBoolean(this.hasAggressiveMonsters);
    }
}

export class ChatClientPrivateMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 851;
    }

    deserialize(buffer) {
        this.content = buffer.readUTF();
        this.receiver = buffer.readUTF();
    }
}

export class TextInformationMessage extends ProtocolMessage {
    constructor(msgType, msgId, parameters) {
        super();
        this.messageId = 780;
        this.msgType = msgType;
        this.msgId = msgId;
        this.parameters = parameters;
    }

    serialize() {
        this.buffer.writeByte(this.msgType);
        this.buffer.writeVarShort(this.msgId);
        this.buffer.writeShort(this.parameters.length);
        for (var parameter in this.parameters) {
            this.buffer.writeUTF(this.parameters[parameter]);
        }
    }
}

export class ChatAbstractServerMessage extends ProtocolMessage {
    constructor(channel, content, timestamp, fingerprint) {
        super();
        this.messageId = 880;
        this.channel = channel;
        this.content = content;
        this.timestamp = timestamp;
        this.fingerprint = fingerprint;
    }

    serialize() {
        this.buffer.writeByte(this.channel);
        this.buffer.writeUTF(this.content);
        this.buffer.writeInt(this.timestamp);
        this.buffer.writeUTF(this.fingerprint);
    }
}


export class ChatServerMessage extends ChatAbstractServerMessage {
    constructor(channel, content, timestamp, fingerprint, senderId, senderName, senderAccountId) {
        super(channel, content, timestamp, fingerprint);
        this.messageId = 881;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAccountId = senderAccountId;
    }

    serialize() {
        super.serialize();
        this.buffer.writeDouble(this.senderId);
        this.buffer.writeUTF(this.senderName);
        this.buffer.writeInt(this.senderAccountId);
    }
}

export class ChatServerCopyMessage extends ChatAbstractServerMessage {
    constructor(channel, content, timestamp, fingerprint, receiverId, receiverName) {
        super(channel, content, timestamp, fingerprint);
        this.messageId = 882;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
    }

    serialize() {
        super.serialize();
        this.buffer.writeVarLong(this.receiverId);
        this.buffer.writeUTF(this.receiverName);
    }
}

export class ChatClientMultiMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 861;
    }

    deserialize(buffer) {
        this.content = buffer.readUTF();
        this.channel = buffer.readByte();
    }
}

export class GameRolePlayShowActorMessage extends ProtocolMessage {
    constructor(informations) {
        super();
        this.messageId = 5632;
        this.informations = informations;
    }

    serialize() {
        this.buffer.writeShort(this.informations.protocolId);
        this.informations.serialize(this.buffer);
    }
}

export class GameContextRemoveElementMessage extends ProtocolMessage {
    constructor(id) {
        super();
        this.messageId = 251;
        this.id = id;
    }

    serialize() {
        this.buffer.writeDouble(this.id);
    }
}

export class SystemMessageDisplayMessage extends ProtocolMessage {
    constructor(hangUp, msgId, parameters) {
        super(189);
        this.hangUp = hangUp;
        this.msgId = msgId;
        this.parameters = parameters;
    }
    serialize() {
        this.buffer.writeBoolean(this.hangUp);
        if (this.msgId < 0) {
            Logger.error("Forbidden value (" + this.msgId + ") on element msgId.");
        }
        this.buffer.writeVarShort(this.msgId);
        this.buffer.writeShort(this.parameters.length);
        var _loc2_ = 0;
        while (_loc2_ < this.parameters.length) {
            this.buffer.writeUTF(this.parameters[_loc2_]);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        this.hangUp = buffer.readBoolean();
        this.msgId = buffer.readVarUhShort();
        if (this.msgId < 0) {
            Logger.error("Forbidden value (" + this.msgId + ") on element of SystemMessageDisplayMessage.msgId.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUTF();
            this.parameters.push(_loc4_);
            _loc3_++;
        }
    }
}

export class GameMapMovementRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 950;
        this.keyMovements = new Array();
    }

    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc2_ = buffer.readShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readShort();
            this.keyMovements.push(_loc4_);
            _loc3_++;
        }
        this.mapId = buffer.readInt();
    }
}

export class AdminCommandMessage extends ProtocolMessage {
    constructor(content) {
        super(76);
        this.content = content;
    }
    serialize() {
        this.buffer.writeUTF(this.content);
    }
    deserialize(buffer) {
        this.content = buffer.readUTF();
    }
}

export class AdminQuietCommandMessage extends AdminCommandMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5662;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class GameMapMovementMessage extends ProtocolMessage {
    constructor(keyMovements, actorId) {
        super();
        this.messageId = 951;
        this.keyMovements = keyMovements;
        this.actorId = actorId;
    }

    serialize() {
        this.buffer.writeShort(this.keyMovements.length);
        for (var i in this.keyMovements) {
            this.buffer.writeShort(this.keyMovements[i]);
        }
        this.buffer.writeDouble(this.actorId);
    }
}

export class GameMapMovementCancelMessage extends ProtocolMessage {
    constructor(cellId) {
        super(953);
        this.cellId = cellId;
    }
    serialize() {
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeVarShort(this.cellId);
    }
    deserialize(buffer) {
        this.cellId = buffer.readVarUhShort();
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of GameMapMovementCancelMessage.cellId.");
        }
    }
}

export class GameMapMovementConfirmMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 952;
    }

    deserialize(buffer) {
    }
}

export class ChangeMapMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 221;
    }

    deserialize(buffer) {
        this.mapId = buffer.readInt();
    }
}

export class FriendAddRequestMessage extends ProtocolMessage {
    constructor(name) {
        super(4004);
        this.name = name;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
    }
}

export class GameMapChangeOrientationRequestMessage extends ProtocolMessage {
    constructor() {
        super();
        this.messageId = 945;
    }

    deserialize(buffer) {
        this.direction = buffer.readByte();
    }
}

export class GameMapChangeOrientationMessage extends ProtocolMessage {
    constructor(orientation) {
        super();
        this.messageId = 946;
        this.orientation = orientation;
    }

    serialize() {
        this.orientation.serialize(this.buffer);
    }
}

export class CharacterStatsListMessage extends ProtocolMessage {
    constructor(stats) {
        super(500);
        this.stats = stats;
    }
    serialize() {
        this.stats.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.stats = new Types.CharacterCharacteristicsInformations();
        this.stats.deserialize(buffer);
    }
}

export class FriendAddFailureMessage extends ProtocolMessage {
    constructor(reason) {
        super(5600);
        this.reason = reason;
    }
    serialize() {
        this.buffer.writeByte(this.reason);
    }
    deserialize(buffer) {
        this.reason = buffer.readByte();
        if (this.reason < 0) {
            Logger.error("Forbidden value (" + this.reason + ") on element of FriendAddFailureMessage.reason.");
        }
    }
}

export class FriendAddedMessage extends ProtocolMessage {
    constructor(friendAdded) {
        super();
        this.messageId = 5599;
        this.friendAdded = friendAdded;
    }
    serialize() {
        this.buffer.writeShort(this.friendAdded.protocolId);
        this.friendAdded.serialize(this.buffer);
    }
}

export class FriendsListMessage extends ProtocolMessage {
    constructor(friendsList) {
        super();
        this.messageId = 4002;
        this.friendsList = friendsList;
    }
    serialize() {
        this.buffer.writeShort(this.friendsList.length);
        var _loc2_ = 0;
        while (_loc2_ < this.friendsList.length) {
            this.buffer.writeShort(this.friendsList[_loc2_].protocolId);
            this.friendsList[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(FriendInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.friendsList.push(_loc5_);
            _loc3_++;
        }
    }
}

export class StatsUpgradeRequestMessage extends ProtocolMessage {
    constructor(useAdditionnal, statId, boostPoint) {
        super(5610);
        this.useAdditionnal = useAdditionnal;
        this.statId = statId;
        this.boostPoint = boostPoint;
    }
    serialize() {
        this.buffer.writeBoolean(this.useAdditionnal);
        this.buffer.writeByte(this.statId);
        if (this.boostPoint < 0) {
            Logger.error("Forbidden value (" + this.boostPoint + ") on element boostPoint.");
        }
        this.buffer.writeVarShort(this.boostPoint);
    }
    deserialize(buffer) {
        this.useAdditionnal = buffer.readBoolean();
        this.statId = buffer.readByte();
        if (this.statId < 0) {
            Logger.error("Forbidden value (" + this.statId + ") on element of StatsUpgradeRequestMessage.statId.");
        }
        this.boostPoint = buffer.readVarUhShort();
        if (this.boostPoint < 0) {
            Logger.error("Forbidden value (" + this.boostPoint + ") on element of StatsUpgradeRequestMessage.boostPoint.");
        }
    }
}

export class FriendsGetListMessage extends ProtocolMessage {
    constructor() {
        super(4001);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class FriendDeleteRequestMessage extends ProtocolMessage {
    constructor(accountId) {
        super(5603);
        this.accountId = accountId;
    }
    serialize() {
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
    }
    deserialize(buffer) {
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of FriendDeleteRequestMessage.accountId.");
        }
    }
}

export class CharacterLevelUpMessage extends ProtocolMessage {
    constructor(newLevel) {
        super(5670);
        this.newLevel = newLevel;
    }
    serialize() {
        if (this.newLevel < 2 || this.newLevel > 200) {
            Logger.error("Forbidden value (" + this.newLevel + ") on element newLevel.");
        }
        this.buffer.writeByte(this.newLevel);
    }
    deserialize(buffer) {
        this.newLevel = buffer.readUnsignedByte();
        if (this.newLevel < 2 || this.newLevel > 200) {
            Logger.error("Forbidden value (" + this.newLevel + ") on element of CharacterLevelUpMessage.newLevel.");
        }
    }
}

export class EmoteListMessage extends  ProtocolMessage{
constructor(emoteIds) {
super(5689);
this.emoteIds = emoteIds;
}
serialize(){
         this.buffer.writeShort(this.emoteIds.length);
         var _loc2_ =  0;
         while(_loc2_ < this.emoteIds.length)
         {
            if(this.emoteIds[_loc2_] < 0 || this.emoteIds[_loc2_] > 255)
            {
               Logger.error("Forbidden value (" + this.emoteIds[_loc2_] + ") on element 1 (starting at 1) of emoteIds.");
            }
            this.buffer.writeByte(this.emoteIds[_loc2_]);
            _loc2_++;
         }
}
deserialize(buffer){
         var _loc4_ =  0;
         var _loc2_ =  buffer.readUnsignedShort();
         var _loc3_ =  0;
         while(_loc3_ < _loc2_)
         {
            _loc4_ = buffer.readUnsignedByte();
            if(_loc4_ < 0 || _loc4_ > 255)
            {
               Logger.error("Forbidden value (" + _loc4_ + ") on elements of emoteIds.");
            }
            this.emoteIds.push(_loc4_);
            _loc3_++;
         }
}
}

export class FriendSetWarnOnConnectionMessage extends ProtocolMessage {
constructor() {
    super(5602);
}
    deserialize(buffer){
        this.enable = buffer.readBoolean();
    }
}

export class FriendWarnOnConnectionStateMessage extends ProtocolMessage {
    constructor(enable)
    {
        super(5630);
        this.enable = enable;
    }
    serialize()
    {
        this.buffer.writeBoolean(this.enable);
    }
}

export class ChatSmileyRequestMessage extends ProtocolMessage {
    constructor()
    {
        super(800);
    }

    deserialize(buffer)
    {
        this.smileyId = buffer.readVarUhShort();
    }
}

export class ChatSmileyMessage extends ProtocolMessage {
    constructor(entityId, smileyId, accountId) {
        super(801);
        this.entityId = entityId;
        this.smileyId = smileyId;
        this.accountId = accountId;
    }

    serialize() {
        this.buffer.writeDouble(this.entityId);
        this.buffer.writeVarShort(this.smileyId);
        this.buffer.writeInt(this.accountId);
    }
}

export class MoodSmileyRequestMessage extends ProtocolMessage {
    constructor()
    {
        super(6192);
    }

    deserialize(buffer) {
        this.smileyId = buffer.readVarUhShort();
    }
}

export class InventoryWeightMessage extends ProtocolMessage {
    constructor(weight, weightMax) {
        super(3009);
        this.weight = weight;
        this.weightMax = weightMax;
    }
    serialize() {
        if (this.weight < 0) {
            Logger.error("Forbidden value (" + this.weight + ") on element weight.");
        }
        this.buffer.writeVarInt(this.weight);
        if (this.weightMax < 0) {
            Logger.error("Forbidden value (" + this.weightMax + ") on element weightMax.");
        }
        this.buffer.writeVarInt(this.weightMax);
    }
    deserialize(buffer) {
        this.weight = buffer.readVarUhInt();
        if (this.weight < 0) {
            Logger.error("Forbidden value (" + this.weight + ") on element of InventoryWeightMessage.weight.");
        }
        this.weightMax = buffer.readVarUhInt();
        if (this.weightMax < 0) {
            Logger.error("Forbidden value (" + this.weightMax + ") on element of InventoryWeightMessage.weightMax.");
        }
    }
}

export class InventoryContentMessage extends ProtocolMessage {
    constructor(objects, kamas) {
        super(3016);
        this.objects = objects;
        this.kamas = kamas;
    }
    serialize() {
        this.buffer.writeShort(this.objects.length);
        var _loc2_ = 0;
        while (_loc2_ < this.objects.length) {
            this.objects[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element kamas.");
        }
        this.buffer.writeVarInt(this.kamas);
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new ObjectItem();
            _loc4_.deserialize(buffer);
            this.objects.push(_loc4_);
            _loc3_++;
        }
        this.kamas = buffer.readVarUhInt();
        if (this.kamas < 0) {
            Logger.error("Forbidden value (" + this.kamas + ") on element of InventoryContentMessage.kamas.");
        }
    }
}
export class TeleportDestinationsListMessage extends ProtocolMessage {
    constructor(teleporterType, mapIds, subAreaIds, costs, destTeleporterType) {
        super(5960);
        this.teleporterType = teleporterType;
        this.mapIds = mapIds;
        this.subAreaIds = subAreaIds;
        this.costs = costs;
        this.destTeleporterType = destTeleporterType;
    }
    serialize() {
        this.buffer.writeByte(this.teleporterType);
        this.buffer.writeShort(this.mapIds.length);
        var _loc2_ = 0;
        while (_loc2_ < this.mapIds.length) {
            if (this.mapIds[_loc2_] < 0) {
                Logger.error("Forbidden value (" + this.mapIds[_loc2_] + ") on element 2 (starting at 1) of mapIds.");
            }
            this.buffer.writeInt(this.mapIds[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.subAreaIds.length);
        var _loc3_ = 0;
        while (_loc3_ < this.subAreaIds.length) {
            if (this.subAreaIds[_loc3_] < 0) {
                Logger.error("Forbidden value (" + this.subAreaIds[_loc3_] + ") on element 3 (starting at 1) of subAreaIds.");
            }
            this.buffer.writeVarShort(this.subAreaIds[_loc3_]);
            _loc3_++;
        }
        this.buffer.writeShort(this.costs.length);
        var _loc4_ = 0;
        while (_loc4_ < this.costs.length) {
            if (this.costs[_loc4_] < 0) {
                Logger.error("Forbidden value (" + this.costs[_loc4_] + ") on element 4 (starting at 1) of costs.");
            }
            this.buffer.writeVarShort(this.costs[_loc4_]);
            _loc4_++;
        }
        this.buffer.writeShort(this.destTeleporterType.length);
        var _loc5_ = 0;
        while (_loc5_ < this.destTeleporterType.length) {
            this.buffer.writeByte(this.destTeleporterType[_loc5_]);
            _loc5_++;
        }
    }
}
export class ZaapListMessage extends TeleportDestinationsListMessage {
    constructor(param1, param2, param3, param4, param5, param6) {
        super(param1, param2, param3, param4, param5);
        this.spawnMapId = param6;
        this.messageId = 1604;
    }
    serialize() {
        super.serialize();
        if (this.spawnMapId < 0) {
            Logger.error("Forbidden value (" + this.spawnMapId + ") on element spawnMapId.");
        }
        this.buffer.writeInt(this.spawnMapId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.spawnMapId = buffer.readInt();
        if (this.spawnMapId < 0) {
            Logger.error("Forbidden value (" + this.spawnMapId + ") on element of ZaapListMessage.spawnMapId.");
        }
    }
}
export class InteractiveUseRequestMessage extends ProtocolMessage {
    constructor(elemId, skillInstanceUid) {
        super(5001);
        this.elemId = elemId;
        this.skillInstanceUid = skillInstanceUid;
    }
    serialize() {
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillInstanceUid < 0) {
            Logger.error("Forbidden value (" + this.skillInstanceUid + ") on element skillInstanceUid.");
        }
        this.buffer.writeVarInt(this.skillInstanceUid);
    }
    deserialize(buffer) {
        this.elemId = buffer.readVarUhInt();
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element of InteractiveUseRequestMessage.elemId.");
        }
        this.skillInstanceUid = buffer.readVarUhInt();
        if (this.skillInstanceUid < 0) {
            Logger.error("Forbidden value (" + this.skillInstanceUid + ") on element of InteractiveUseRequestMessage.skillInstanceUid.");
        }
    }
}
export class InteractiveUsedMessage extends ProtocolMessage {
    constructor(entityId, elemId, skillId, duration, canMove) {
        super(5745);
        this.entityId = entityId;
        this.elemId = elemId;
        this.skillId = skillId;
        this.duration = duration;
        this.canMove = canMove;
    }
    serialize() {
        if (this.entityId < 0 || this.entityId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.entityId + ") on element entityId.");
        }
        this.buffer.writeVarLong(this.entityId);
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillId < 0) {
            Logger.error("Forbidden value (" + this.skillId + ") on element skillId.");
        }
        this.buffer.writeVarShort(this.skillId);
        if (this.duration < 0) {
            Logger.error("Forbidden value (" + this.duration + ") on element duration.");
        }
        this.buffer.writeVarShort(this.duration);
        this.buffer.writeBoolean(this.canMove);
    }
}
export class InteractiveUseEndedMessage extends ProtocolMessage {
    constructor(elemId, skillId) {
        super(6112);
        this.elemId = elemId;
        this.skillId = skillId;
    }
    serialize() {
        if (this.elemId < 0) {
            Logger.error("Forbidden value (" + this.elemId + ") on element elemId.");
        }
        this.buffer.writeVarInt(this.elemId);
        if (this.skillId < 0) {
            Logger.error("Forbidden value (" + this.skillId + ") on element skillId.");
        }
        this.buffer.writeVarShort(this.skillId);
    }
}

export class EmoteAddMessage extends ProtocolMessage {
    constructor(emoteId) {
        super(5644);
        this.emoteId = emoteId;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmoteAddMessage.emoteId.");
        }
    }
}


// Generated by Noxus messages
export class EmotePlayAbstractMessage extends ProtocolMessage {
    constructor(emoteId, emoteStartTime) {
        super(5690);
        this.emoteId = emoteId;
        this.emoteStartTime = emoteStartTime;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
        if (this.emoteStartTime < -9007199254740990 || this.emoteStartTime > 9007199254740990) {
            Logger.error("Forbidden value (" + this.emoteStartTime + ") on element emoteStartTime.");
        }
        this.buffer.writeDouble(this.emoteStartTime);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmotePlayAbstractMessage.emoteId.");
        }
        this.emoteStartTime = buffer.readDouble();
        if (this.emoteStartTime < -9007199254740990 || this.emoteStartTime > 9007199254740990) {
            Logger.error("Forbidden value (" + this.emoteStartTime + ") on element of EmotePlayAbstractMessage.emoteStartTime.");
        }
    }
}

export class EmotePlayRequestMessage extends ProtocolMessage {
    constructor(emoteId) {
        super(5685);
        this.emoteId = emoteId;
    }
    serialize() {
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element emoteId.");
        }
        this.buffer.writeByte(this.emoteId);
    }
    deserialize(buffer) {
        this.emoteId = buffer.readUnsignedByte();
        if (this.emoteId < 0 || this.emoteId > 255) {
            Logger.error("Forbidden value (" + this.emoteId + ") on element of EmotePlayRequestMessage.emoteId.");
        }
    }
}

// Generated by Noxus messages
export class EmotePlayMessage extends EmotePlayAbstractMessage{
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.actorId = param3;
        this.accountId = param4;
        this.messageId = 5683;
    }
    serialize() {
        super.serialize();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element actorId.");
        }
        this.buffer.writeDouble(this.actorId);
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.actorId = buffer.readDouble();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element of EmotePlayMessage.actorId.");
        }
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of EmotePlayMessage.accountId.");
        }
    }
}

export class ObjectSetPositionMessage extends ProtocolMessage {
    constructor(objectUID, position, quantity) {
        super(3021);
        this.objectUID = objectUID;
        this.position = position;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        this.buffer.writeByte(this.position);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectSetPositionMessage.objectUID.");
        }
        this.position = buffer.readUnsignedByte();
        if (this.position < 0 || this.position > 255) {
            Logger.error("Forbidden value (" + this.position + ") on element of ObjectSetPositionMessage.position.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectSetPositionMessage.quantity.");
        }
    }
}

export class ObjectMovementMessage extends ProtocolMessage {
    constructor(objectUID, position) {
        super(3010);
        this.objectUID = objectUID;
        this.position = position;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        this.buffer.writeByte(this.position);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectMovementMessage.objectUID.");
        }
        this.position = buffer.readUnsignedByte();
        if (this.position < 0 || this.position > 255) {
            Logger.error("Forbidden value (" + this.position + ") on element of ObjectMovementMessage.position.");
        }
    }
}

export class IgnoredAddedMessage extends ProtocolMessage {
    constructor(ignoreAdded, session) {
        super(5678);
        this.ignoreAdded = ignoreAdded;
        this.session = session;
    }
    serialize() {
        this.buffer.writeShort(this.ignoreAdded.protocolId);
        this.ignoreAdded.serialize(this.buffer);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readUnsignedShort();
        this.ignoreAdded = ProtocolTypeManager.getInstance(IgnoredInformations, _loc2_);
        this.ignoreAdded.deserialize(buffer);
        this.session = buffer.readBoolean();
    }
}

export class IgnoredAddRequestMessage extends ProtocolMessage {
    constructor(name, session) {
        super(5673);
        this.name = name;
        this.session = session;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
        this.session = buffer.readBoolean();
    }
}

export class IgnoredListMessage extends ProtocolMessage {
    constructor(ignoredList) {
        super(5674);
        this.ignoredList = ignoredList;
    }
    serialize() {
        this.buffer.writeShort(this.ignoredList.length);
        var _loc2_ = 0;
        while (_loc2_ < this.ignoredList.length) {
            this.buffer.writeShort((this.ignoredList[_loc2_]).protocolId);
            this.ignoredList[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(IgnoredInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.ignoredList.push(_loc5_);
            _loc3_++;
        }
    }
}

export class IgnoredGetListMessage extends ProtocolMessage {
constructor() {
    super(5676);
}
serialize()
{
}
deserialize(buffer){
}
}

export class ObjectDeletedMessage extends ProtocolMessage {
    constructor(objectUID) {
        super(3024);
        this.objectUID = objectUID;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectDeletedMessage.objectUID.");
        }
    }
}

export class IgnoredDeleteRequestMessage extends ProtocolMessage {
    constructor(accountId, session) {
        super(5680);
        this.accountId = accountId;
        this.session = session;
    }
    serialize() {
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element accountId.");
        }
        this.buffer.writeInt(this.accountId);
        this.buffer.writeBoolean(this.session);
    }
    deserialize(buffer) {
        this.accountId = buffer.readInt();
        if (this.accountId < 0) {
            Logger.error("Forbidden value (" + this.accountId + ") on element of IgnoredDeleteRequestMessage.accountId.");
        }
        this.session = buffer.readBoolean();
    }
}

export class IgnoredDeleteResultMessage extends ProtocolMessage {
    constructor(success, name, session) {
        super(5677);
        this.success = success;
        this.name = name;
        this.session = session;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.success);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.session);
        this.buffer.writeByte(_loc2_);
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.success = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.session = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.name = buffer.readUTF();
    }
}

export class GameContextRefreshEntityLookMessage extends ProtocolMessage {
    constructor(id, look) {
        super(5637);
        this.id = id;
        this.look = look;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
        this.look.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of GameContextRefreshEntityLookMessage.id.");
        }
        this.look = new EntityLook();
        this.look.deserialize(buffer);
    }
}

export class BasicNoOperationMessage extends ProtocolMessage {
    constructor() {
        super(176);
    }
    serialize(){
    }
}
export class LeaveDialogRequestMessage extends ProtocolMessage {
    constructor() {
        super(5501);
    }
    serialize(){
    }
    deserialize(buffer){
    }
}
export class LeaveDialogMessage extends ProtocolMessage {
    constructor(dialogType) {
        super(5502);
        this.dialogType = dialogType;
    }
    serialize() {
        this.buffer.writeByte(this.dialogType);
    }
}
export class TeleportRequestMessage extends ProtocolMessage {
    constructor(teleporterType, mapId) {
        super(5961);
        this.teleporterType = teleporterType;
        this.mapId = mapId;
    }
     deserialize(buffer) {
        this.teleporterType = buffer.readByte();
        if (this.teleporterType < 0) {
            Logger.error("Forbidden value (" + this.teleporterType + ") on element of TeleportRequestMessage.teleporterType.");
        }
        this.mapId = buffer.readInt();
        if (this.mapId < 0) {
            Logger.error("Forbidden value (" + this.mapId + ") on element of TeleportRequestMessage.mapId.");
        }
    }
}

export class ObjectDeleteMessage extends ProtocolMessage {
    constructor(objectUID, quantity) {
        super(3022);
        this.objectUID = objectUID;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectDeleteMessage.objectUID.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectDeleteMessage.quantity.");
        }
    }
}

export class ObjectQuantityMessage extends ProtocolMessage {
    constructor(objectUID, quantity) {
        super(3023);
        this.objectUID = objectUID;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ObjectQuantityMessage.objectUID.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ObjectQuantityMessage.quantity.");
        }
    }
}

export class UpdateLifePointsMessage extends ProtocolMessage {
    constructor(lifePoints, maxLifePoints) {
        super(5658);
        this.lifePoints = lifePoints;
        this.maxLifePoints = maxLifePoints;
    }
    serialize() {
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element lifePoints.");
        }
        this.buffer.writeVarInt(this.lifePoints);
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element maxLifePoints.");
        }
        this.buffer.writeVarInt(this.maxLifePoints);
    }
    deserialize(buffer) {
        this.lifePoints = buffer.readVarUhInt();
        if (this.lifePoints < 0) {
            Logger.error("Forbidden value (" + this.lifePoints + ") on element of UpdateLifePointsMessage.lifePoints.");
        }
        this.maxLifePoints = buffer.readVarUhInt();
        if (this.maxLifePoints < 0) {
            Logger.error("Forbidden value (" + this.maxLifePoints + ") on element of UpdateLifePointsMessage.maxLifePoints.");
        }
    }
}

export class SetCharacterRestrictionsMessage extends ProtocolMessage {
    constructor(actorId, restrictions) {
        super(170);
        this.actorId = actorId;
        this.restrictions = restrictions;
    }
    serialize() {
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element actorId.");
        }
        this.buffer.writeDouble(this.actorId);
        this.restrictions.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.actorId = buffer.readDouble();
        if (this.actorId < -9007199254740990 || this.actorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.actorId + ") on element of SetCharacterRestrictionsMessage.actorId.");
        }
        this.restrictions = new ActorRestrictionsInformations();
        this.restrictions.deserialize(buffer);
    }
}

export class LifePointsRegenBeginMessage extends ProtocolMessage {
    constructor(regenRate) {
        super(5684);
        this.regenRate = regenRate;
    }
    serialize() {
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element regenRate.");
        }
        this.buffer.writeByte(this.regenRate);
    }
    deserialize(buffer) {
        this.regenRate = buffer.readUnsignedByte();
        if (this.regenRate < 0 || this.regenRate > 255) {
            Logger.error("Forbidden value (" + this.regenRate + ") on element of LifePointsRegenBeginMessage.regenRate.");
        }
    }
}

export class LifePointsRegenEndMessage extends UpdateLifePointsMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.lifePointsGained = param3;
        this.messageId = 5686;
    }
    serialize() {
        super.serialize();
        if (this.lifePointsGained < 0) {
            Logger.error("Forbidden value (" + this.lifePointsGained + ") on element lifePointsGained.");
        }
        this.buffer.writeVarInt(this.lifePointsGained);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.lifePointsGained = buffer.readVarUhInt();
        if (this.lifePointsGained < 0) {
            Logger.error("Forbidden value (" + this.lifePointsGained + ") on element of LifePointsRegenEndMessage.lifePointsGained.");
        }
    }
}

export class ObjectErrorMessage extends ProtocolMessage {
    constructor(reason) {
        super(3004);
        this.reason = reason;
    }
    serialize() {
        this.buffer.writeByte(this.reason);
    }
    deserialize(buffer) {
        this.reason = buffer.readByte();
    }
}

export class PartyInvitationRequestMessage extends ProtocolMessage {
    constructor(name) {
        super(5585);
        this.name = name;
    }
    serialize() {
        this.buffer.writeUTF(this.name);
    }
    deserialize(buffer) {
        this.name = buffer.readUTF();
    }
}

export class AbstractPartyMessage extends ProtocolMessage {
    constructor(partyId) {
        super(6274);
        this.partyId = partyId;
    }
    serialize() {
        if (this.partyId < 0) {
            Logger.error("Forbidden value (" + this.partyId + ") on element partyId.");
        }
        this.buffer.writeVarInt(this.partyId);
    }
    deserialize(buffer) {
        this.partyId = buffer.readVarUhInt();
        if (this.partyId < 0) {
            Logger.error("Forbidden value (" + this.partyId + ") on element of AbstractPartyMessage.partyId.");
        }
    }
}

export class PartyInvitationMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7) {
        super(param1);
        this.partyType = param2;
        this.partyName = param3;
        this.maxParticipants = param4;
        this.fromId = param5;
        this.fromName = param6;
        this.toId = param7;
        this.messageId = 5586;
    }
    serialize() {
        super.serialize();
        this.buffer.writeByte(this.partyType);
        this.buffer.writeUTF(this.partyName);
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element maxParticipants.");
        }
        this.buffer.writeByte(this.maxParticipants);
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element fromId.");
        }
        this.buffer.writeVarLong(this.fromId);
        this.buffer.writeUTF(this.fromName);
        if (this.toId < 0 || this.toId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.toId + ") on element toId.");
        }
        this.buffer.writeVarLong(this.toId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.partyType = buffer.readByte();
        if (this.partyType < 0) {
            Logger.error("Forbidden value (" + this.partyType + ") on element of PartyInvitationMessage.partyType.");
        }
        this.partyName = buffer.readUTF();
        this.maxParticipants = buffer.readByte();
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element of PartyInvitationMessage.maxParticipants.");
        }
        this.fromId = buffer.readVarUhLong();
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element of PartyInvitationMessage.fromId.");
        }
        this.fromName = buffer.readUTF();
        this.toId = buffer.readVarUhLong();
        if (this.toId < 0 || this.toId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.toId + ") on element of PartyInvitationMessage.toId.");
        }
    }
}

export class AbstractPartyEventMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 6273;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyRefuseInvitationMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5582;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyRefuseInvitationNotificationMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.guestId = param2;
        this.messageId = 5596;
    }
    serialize() {
        super.serialize();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element guestId.");
        }
        this.buffer.writeVarLong(this.guestId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guestId = buffer.readVarUhLong();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element of PartyRefuseInvitationNotificationMessage.guestId.");
        }
    }
}

export class SpellListMessage extends ProtocolMessage {
    constructor(spellPrevisualization, spells) {
        super(1200);
        this.spellPrevisualization = spellPrevisualization;
        this.spells = spells;
    }
    serialize() {
        this.buffer.writeBoolean(this.spellPrevisualization);
        this.buffer.writeShort(this.spells.length);
        var _loc2_ = 0;
        while (_loc2_ < this.spells.length) {
            this.spells[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        this.spellPrevisualization = buffer.readBoolean();
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new SpellItem();
            _loc4_.deserialize(buffer);
            this.spells.push(_loc4_);
            _loc3_++;
        }
    }
}

export class PartyInvitationCancelledForGuestMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.cancelerId = param2;
        this.messageId = 6256;
    }
    serialize() {
        super.serialize();
        if (this.cancelerId < 0 || this.cancelerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.cancelerId + ") on element cancelerId.");
        }
        this.buffer.writeVarLong(this.cancelerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.cancelerId = buffer.readVarUhLong();
        if (this.cancelerId < 0 || this.cancelerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.cancelerId + ") on element of PartyInvitationCancelledForGuestMessage.cancelerId.");
        }
    }
}

export class PartyAcceptInvitationMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5580;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyUpdateMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.memberInformations = param2;
        this.messageId = 5575;
    }
    serialize() {
        super.serialize();
        this.buffer.writeShort(this.memberInformations.protocolId);
        this.memberInformations.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        this.memberInformations = ProtocolTypeManager.getInstance(PartyMemberInformations, _loc2_);
        this.memberInformations.deserialize(buffer);
    }
}

export class PartyNewMemberMessage extends PartyUpdateMessage {
    constructor(param1, param2) {
        super(param1, param2);
        this.messageId = 6306;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyJoinMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8) {
        super(param1);
        this.partyType = param2;
        this.partyLeaderId = param3;
        this.maxParticipants = param4;
        this.members = param5;
        this.guests = param6;
        this.restricted = param7;
        this.partyName = param8;
        this.messageId = 5576;
    }
    serialize() {
        super.serialize();
        this.buffer.writeByte(this.partyType);
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element partyLeaderId.");
        }
        this.buffer.writeVarLong(this.partyLeaderId);
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element maxParticipants.");
        }
        this.buffer.writeByte(this.maxParticipants);
        this.buffer.writeShort(this.members.length);
        var _loc2_ = 0;
        while (_loc2_ < this.members.length) {
            this.buffer.writeShort((this.members[_loc2_]).protocolId);
            this.members[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        this.buffer.writeShort(this.guests.length);
        var _loc3_ = 0;
        while (_loc3_ < this.guests.length) {
            this.guests[_loc3_].serialize(this.buffer);
            _loc3_++;
        }
        this.buffer.writeBoolean(this.restricted);
        this.buffer.writeUTF(this.partyName);
    }
    deserialize(buffer) {
        var _loc6_ = 0;
        var _loc7_ = null;
        var _loc8_ = null;
        super.deserialize(buffer);
        this.partyType = buffer.readByte();
        if (this.partyType < 0) {
            Logger.error("Forbidden value (" + this.partyType + ") on element of PartyJoinMessage.partyType.");
        }
        this.partyLeaderId = buffer.readVarUhLong();
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element of PartyJoinMessage.partyLeaderId.");
        }
        this.maxParticipants = buffer.readByte();
        if (this.maxParticipants < 0) {
            Logger.error("Forbidden value (" + this.maxParticipants + ") on element of PartyJoinMessage.maxParticipants.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readUnsignedShort();
            _loc7_ = ProtocolTypeManager.getInstance(PartyMemberInformations, _loc6_);
            _loc7_.deserialize(buffer);
            this.members.push(_loc7_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc8_ = new PartyGuestInformations();
            _loc8_.deserialize(buffer);
            this.guests.push(_loc8_);
            _loc5_++;
        }
        this.restricted = buffer.readBoolean();
        this.partyName = buffer.readUTF();
    }
}

export class SpellModifyRequestMessage extends ProtocolMessage {
    constructor(spellId, spellLevel) {
        super(6655);
        this.spellId = spellId;
        this.spellLevel = spellLevel;
    }
    serialize() {
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        this.buffer.writeShort(this.spellLevel);
    }
    deserialize(buffer) {
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of SpellModifyRequestMessage.spellId.");
        }
        this.spellLevel = buffer.readShort();
        if (this.spellLevel < 1 || this.spellLevel > 6) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of SpellModifyRequestMessage.spellLevel.");
        }
    }
}

export class SpellModifySuccessMessage extends ProtocolMessage {
    constructor(spellId, spellLevel) {
        super(6654);
        this.spellId = spellId;
        this.spellLevel = spellLevel;
    }
    serialize() {
        this.buffer.writeInt(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 200) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        this.buffer.writeShort(this.spellLevel);
    }
    deserialize(buffer) {
        this.spellId = buffer.readInt();
        this.spellLevel = buffer.readShort();
        if (this.spellLevel < 1 || this.spellLevel > 200) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of SpellModifySuccessMessage.spellLevel.");
        }
    }
}

export class GameRolePlayPlayerFightRequestMessage extends ProtocolMessage {
    constructor(targetId, targetCellId, friendly) {
        super(5731);
        this.targetId = targetId;
        this.targetCellId = targetCellId;
        this.friendly = friendly;
    }
    serialize() {
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
        if (this.targetCellId < -1 || this.targetCellId > 559) {
            Logger.error("Forbidden value (" + this.targetCellId + ") on element targetCellId.");
        }
        this.buffer.writeShort(this.targetCellId);
        this.buffer.writeBoolean(this.friendly);
    }
    deserialize(buffer) {
        this.targetId = buffer.readVarLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightRequestMessage.targetId.");
        }
        this.targetCellId = buffer.readShort();
        if (this.targetCellId < -1 || this.targetCellId > 559) {
            Logger.error("Forbidden value (" + this.targetCellId + ") on element of GameRolePlayPlayerFightRequestMessage.targetCellId.");
        }
        this.friendly = buffer.readBoolean();
    }
}

export class GameRolePlayPlayerFightFriendlyRequestedMessage extends ProtocolMessage {
    constructor(fightId, sourceId, targetId) {
        super(5937);
        this.fightId = fightId;
        this.sourceId = sourceId;
        this.targetId = targetId;
    }
    serialize() {
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element fightId.");
        }
        this.buffer.writeInt(this.fightId);
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeVarLong(this.sourceId);
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.fightId.");
        }
        this.sourceId = buffer.readVarUhLong();
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.sourceId.");
        }
        this.targetId = buffer.readVarUhLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightFriendlyRequestedMessage.targetId.");
        }
    }
}

export class GameRolePlayPlayerFightFriendlyAnswerMessage extends ProtocolMessage {
    constructor(fightId, accept) {
        super(5732);
        this.fightId = fightId;
        this.accept = accept;
    }
    serialize() {
        this.buffer.writeInt(this.fightId);
        this.buffer.writeBoolean(this.accept);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        this.accept = buffer.readBoolean();
    }
}

export class GameRolePlayPlayerFightFriendlyAnsweredMessage extends ProtocolMessage {
    constructor(fightId, sourceId, targetId, accept) {
        super(5733);
        this.fightId = fightId;
        this.sourceId = sourceId;
        this.targetId = targetId;
        this.accept = accept;
    }
    serialize() {
        this.buffer.writeInt(this.fightId);
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeVarLong(this.sourceId);
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeVarLong(this.targetId);
        this.buffer.writeBoolean(this.accept);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
        this.sourceId = buffer.readVarUhLong();
        if (this.sourceId < 0 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of GameRolePlayPlayerFightFriendlyAnsweredMessage.sourceId.");
        }
        this.targetId = buffer.readVarUhLong();
        if (this.targetId < 0 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameRolePlayPlayerFightFriendlyAnsweredMessage.targetId.");
        }
        this.accept = buffer.readBoolean();
    }
}

export class GameFightStartingMessage extends ProtocolMessage {
    constructor(fightType, attackerId, defenderId) {
        super(700);
        this.fightType = fightType;
        this.attackerId = attackerId;
        this.defenderId = defenderId;
    }
    serialize() {
        this.buffer.writeByte(this.fightType);
        if (this.attackerId < -9007199254740990 || this.attackerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.attackerId + ") on element attackerId.");
        }
        this.buffer.writeDouble(this.attackerId);
        if (this.defenderId < -9007199254740990 || this.defenderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.defenderId + ") on element defenderId.");
        }
        this.buffer.writeDouble(this.defenderId);
    }
    deserialize(buffer) {
        this.fightType = buffer.readByte();
        if (this.fightType < 0) {
            Logger.error("Forbidden value (" + this.fightType + ") on element of GameFightStartingMessage.fightType.");
        }
        this.attackerId = buffer.readDouble();
        if (this.attackerId < -9007199254740990 || this.attackerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.attackerId + ") on element of GameFightStartingMessage.attackerId.");
        }
        this.defenderId = buffer.readDouble();
        if (this.defenderId < -9007199254740990 || this.defenderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.defenderId + ") on element of GameFightStartingMessage.defenderId.");
        }
    }
}

export class PartyNewGuestMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.guest = param2;
        this.messageId = 6260;
    }
    serialize() {
        super.serialize();
        this.guest.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guest = new PartyGuestInformations();
        this.guest.deserialize(buffer);
    }
}

export class GameFightJoinMessage extends ProtocolMessage {
    constructor(isTeamPhase, canBeCancelled, canSayReady, isFightStarted, timeMaxBeforeFightStart, fightType) {
        super(702);
        this.isTeamPhase = isTeamPhase;
        this.canBeCancelled = canBeCancelled;
        this.canSayReady = canSayReady;
        this.isFightStarted = isFightStarted;
        this.timeMaxBeforeFightStart = timeMaxBeforeFightStart;
        this.fightType = fightType;
    }
    serialize() {
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.isTeamPhase);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.canBeCancelled);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 2, this.canSayReady);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 3, this.isFightStarted);
        this.buffer.writeByte(_loc2_);
        if (this.timeMaxBeforeFightStart < 0) {
            Logger.error("Forbidden value (" + this.timeMaxBeforeFightStart + ") on element timeMaxBeforeFightStart.");
        }
        this.buffer.writeShort(this.timeMaxBeforeFightStart);
        this.buffer.writeByte(this.fightType);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readByte();
        this.isTeamPhase = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.canBeCancelled = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.canSayReady = IO.BooleanByteWrapper.getFlag(_loc2_, 2);
        this.isFightStarted = IO.BooleanByteWrapper.getFlag(_loc2_, 3);
        this.timeMaxBeforeFightStart = buffer.readShort();
        if (this.timeMaxBeforeFightStart < 0) {
            Logger.error("Forbidden value (" + this.timeMaxBeforeFightStart + ") on element of GameFightJoinMessage.timeMaxBeforeFightStart.");
        }
        this.fightType = buffer.readByte();
        if (this.fightType < 0) {
            Logger.error("Forbidden value (" + this.fightType + ") on element of GameFightJoinMessage.fightType.");
        }
    }
}

export class PartyLeaveRequestMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5593;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class PartyLeaveMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 5594;
    }

    serialize() {
        super.serialize();
    }

    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class GameFightPlacementPossiblePositionsMessage extends ProtocolMessage {
    constructor(positionsForChallengers, positionsForDefenders, teamNumber) {
        super(703);
        this.positionsForChallengers = positionsForChallengers;
        this.positionsForDefenders = positionsForDefenders;
        this.teamNumber = teamNumber;
    }
    serialize() {
        this.buffer.writeShort(this.positionsForChallengers.length);
        var _loc2_ = 0;
        while (_loc2_ < this.positionsForChallengers.length) {
            if (this.positionsForChallengers[_loc2_] < 0 || this.positionsForChallengers[_loc2_] > 559) {
                Logger.error("Forbidden value (" + this.positionsForChallengers[_loc2_] + ") on element 1 (starting at 1) of positionsForChallengers.");
            }
            this.buffer.writeVarShort(this.positionsForChallengers[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.positionsForDefenders.length);
        var _loc3_ = 0;
        while (_loc3_ < this.positionsForDefenders.length) {
            if (this.positionsForDefenders[_loc3_] < 0 || this.positionsForDefenders[_loc3_] > 559) {
                Logger.error("Forbidden value (" + this.positionsForDefenders[_loc3_] + ") on element 2 (starting at 1) of positionsForDefenders.");
            }
            this.buffer.writeVarShort(this.positionsForDefenders[_loc3_]);
            _loc3_++;
        }
        this.buffer.writeByte(this.teamNumber);
    }
    deserialize(buffer) {
        var _loc6_ = 0;
        var _loc7_ = 0;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readVarUhShort();
            if (_loc6_ < 0 || _loc6_ > 559) {
                Logger.error("Forbidden value (" + _loc6_ + ") on elements of positionsForChallengers.");
            }
            this.positionsForChallengers.push(_loc6_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc7_ = buffer.readVarUhShort();
            if (_loc7_ < 0 || _loc7_ > 559) {
                Logger.error("Forbidden value (" + _loc7_ + ") on elements of positionsForDefenders.");
            }
            this.positionsForDefenders.push(_loc7_);
            _loc5_++;
        }
        this.teamNumber = buffer.readByte();
        if (this.teamNumber < 0) {
            Logger.error("Forbidden value (" + this.teamNumber + ") on element of GameFightPlacementPossiblePositionsMessage.teamNumber.");
        }
    }
}

export class PartyMemberRemoveMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.leavingPlayerId = param2;
        this.messageId = 5579;
    }
    serialize() {
        super.serialize();
        if (this.leavingPlayerId < 0 || this.leavingPlayerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leavingPlayerId + ") on element leavingPlayerId.");
        }
        this.buffer.writeVarLong(this.leavingPlayerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.leavingPlayerId = buffer.readVarUhLong();
        if (this.leavingPlayerId < 0 || this.leavingPlayerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leavingPlayerId + ") on element of PartyMemberRemoveMessage.leavingPlayerId.");
        }
    }
}

export class GameFightShowFighterMessage extends ProtocolMessage {
    constructor(informations) {
        super(5864);
        this.informations = informations;
    }
    serialize() {
        this.buffer.writeShort(this.informations.protocolId);
        this.informations.serialize(this.buffer);
    }
    deserialize(buffer) {
        var _loc2_ = buffer.readUnsignedShort();
        this.informations = ProtocolTypeManager.getInstance(GameFightFighterInformations, _loc2_);
        this.informations.deserialize(buffer);
    }
}

export class GameFightPlacementPositionRequestMessage extends ProtocolMessage {
    constructor(cellId) {
        super(704);
        this.cellId = cellId;
    }
    serialize() {
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeVarShort(this.cellId);
    }
    deserialize(buffer) {
        this.cellId = buffer.readVarUhShort();
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of GameFightPlacementPositionRequestMessage.cellId.");
        }
    }
}

export class GameEntitiesDispositionMessage extends ProtocolMessage {
    constructor(dispositions) {
        super(5696);
        this.dispositions = dispositions;
    }
    serialize() {
        this.buffer.writeShort(this.dispositions.length);
        var _loc2_ = 0;
        while (_loc2_ < this.dispositions.length) {
            this.dispositions[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new IdentifiedEntityDispositionInformations();
            _loc4_.deserialize(buffer);
            this.dispositions.push(_loc4_);
            _loc3_++;
        }
    }
}

export class GameFightReadyMessage extends ProtocolMessage {
    constructor(isReady) {
        super(708);
        this.isReady = isReady;
    }
    serialize() {
        this.buffer.writeBoolean(this.isReady);
    }
    deserialize(buffer) {
        this.isReady = buffer.readBoolean();
    }
}

export class GameFightHumanReadyStateMessage extends ProtocolMessage {
    constructor(characterId, isReady) {
        super(740);
        this.characterId = characterId;
        this.isReady = isReady;
    }
    serialize() {
        if (this.characterId < 0 || this.characterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.characterId + ") on element characterId.");
        }
        this.buffer.writeVarLong(this.characterId);
        this.buffer.writeBoolean(this.isReady);
    }
    deserialize(buffer) {
        this.characterId = buffer.readVarUhLong();
        if (this.characterId < 0 || this.characterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.characterId + ") on element of GameFightHumanReadyStateMessage.characterId.");
        }
        this.isReady = buffer.readBoolean();
    }
}

export class GameFightStartMessage extends ProtocolMessage {
    constructor(idols) {
        super(712);
        this.idols = idols;
    }
    serialize() {
        this.buffer.writeShort(this.idols.length);
        var _loc2_ = 0;
        while (_loc2_ < this.idols.length) {
            this.idols[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new Idol();
            _loc4_.deserialize(buffer);
            this.idols.push(_loc4_);
            _loc3_++;
        }
    }
}

export class GameRolePlayShowChallengeMessage extends ProtocolMessage {
    constructor(commonsInfos) {
        super(301);
        this.commonsInfos = commonsInfos;
    }
    serialize() {
        this.commonsInfos.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.commonsInfos = new FightCommonInformations();
        this.commonsInfos.deserialize(buffer);
    }
}

export class GameFightJoinRequestMessage extends ProtocolMessage {
    constructor(fighterId, fightId) {
        super(701);
        this.fighterId = fighterId;
        this.fightId = fightId;
    }
    serialize() {
        if (this.fighterId < -9007199254740990 || this.fighterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fighterId + ") on element fighterId.");
        }
        this.buffer.writeDouble(this.fighterId);
        this.buffer.writeInt(this.fightId);
    }
    deserialize(buffer) {
        this.fighterId = buffer.readDouble();
        if (this.fighterId < -9007199254740990 || this.fighterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fighterId + ") on element of GameFightJoinRequestMessage.fighterId.");
        }
        this.fightId = buffer.readInt();
    }
}

export class GameRolePlayRemoveChallengeMessage extends ProtocolMessage {
    constructor(fightId) {
        super(300);
        this.fightId = fightId;
    }
    serialize() {
        this.buffer.writeInt(this.fightId);
    }
    deserialize(buffer) {
        this.fightId = buffer.readInt();
    }
}

export class GameContextQuitMessage extends ProtocolMessage {
    constructor() {
    super(255);
    }
    serialize(){
    }
    deserialize(buffer){
    }
}

export class GameFightLeaveMessage extends ProtocolMessage {
    constructor(charId) {
        super(721);
        this.charId = charId;
    }
    serialize() {
        if (this.charId < -9007199254740990 || this.charId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.charId + ") on element charId.");
        }
        this.buffer.writeDouble(this.charId);
    }
    deserialize(buffer) {
        this.charId = buffer.readDouble();
        if (this.charId < -9007199254740990 || this.charId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.charId + ") on element of GameFightLeaveMessage.charId.");
        }
    }
}

export class GameFightEndMessage extends ProtocolMessage {
    constructor(duration, ageBonus, lootShareLimitMalus, results, namedPartyTeamsOutcomes) {
        super(720);
        this.duration = duration;
        this.ageBonus = ageBonus;
        this.lootShareLimitMalus = lootShareLimitMalus;
        this.results = results;
        this.namedPartyTeamsOutcomes = namedPartyTeamsOutcomes;
    }
    serialize() {
        if (this.duration < 0) {
            Logger.error("Forbidden value (" + this.duration + ") on element duration.");
        }
        this.buffer.writeInt(this.duration);
        this.buffer.writeShort(this.ageBonus);
        this.buffer.writeShort(this.lootShareLimitMalus);
        this.buffer.writeShort(this.results.length);
        var _loc2_ = 0;
        while (_loc2_ < this.results.length) {
            this.buffer.writeShort((this.results[_loc2_]).protocolId);
            this.results[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        this.buffer.writeShort(this.namedPartyTeamsOutcomes.length);
        var _loc3_ = 0;
        while (_loc3_ < this.namedPartyTeamsOutcomes.length) {
            this.namedPartyTeamsOutcomes[_loc3_].serialize(this.buffer);
            _loc3_++;
        }
    }
    deserialize(buffer) {
        var _loc6_ = 0;
        var _loc7_ = null;
        var _loc8_ = null;
        this.duration = buffer.readInt();
        if (this.duration < 0) {
            Logger.error("Forbidden value (" + this.duration + ") on element of GameFightEndMessage.duration.");
        }
        this.ageBonus = buffer.readShort();
        this.lootShareLimitMalus = buffer.readShort();
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readUnsignedShort();
            _loc7_ = ProtocolTypeManager.getInstance(FightResultListEntry, _loc6_);
            _loc7_.deserialize(buffer);
            this.results.push(_loc7_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc8_ = new NamedPartyTeamWithOutcome();
            _loc8_.deserialize(buffer);
            this.namedPartyTeamsOutcomes.push(_loc8_);
            _loc5_++;
        }
    }
}

export class GameFightSynchronizeMessage extends ProtocolMessage {
    constructor(fighters) {
        super(5921);
        this.fighters = fighters;
    }
    serialize() {
        this.buffer.writeShort(this.fighters.length);
        var _loc2_ = 0;
        while (_loc2_ < this.fighters.length) {
            this.buffer.writeShort((this.fighters[_loc2_]).protocolId);
            this.fighters[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(GameFightFighterInformations, _loc4_);
            _loc5_.deserialize(buffer);
            this.fighters.push(_loc5_);
            _loc3_++;
        }
    }
}

export class GameFightRemoveTeamMemberMessage extends ProtocolMessage {
    constructor(fightId, teamId, charId) {
        super(711);
        this.fightId = fightId;
        this.teamId = teamId;
        this.charId = charId;
    }
    serialize() {
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element fightId.");
        }
        this.buffer.writeShort(this.fightId);
        this.buffer.writeByte(this.teamId);
        if (this.charId < -9007199254740990 || this.charId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.charId + ") on element charId.");
        }
        this.buffer.writeDouble(this.charId);
    }
    deserialize(buffer) {
        this.fightId = buffer.readShort();
        if (this.fightId < 0) {
            Logger.error("Forbidden value (" + this.fightId + ") on element of GameFightRemoveTeamMemberMessage.fightId.");
        }
        this.teamId = buffer.readByte();
        if (this.teamId < 0) {
            Logger.error("Forbidden value (" + this.teamId + ") on element of GameFightRemoveTeamMemberMessage.teamId.");
        }
        this.charId = buffer.readDouble();
        if (this.charId < -9007199254740990 || this.charId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.charId + ") on element of GameFightRemoveTeamMemberMessage.charId.");
        }
    }
}

export class GameFightTurnListMessage extends ProtocolMessage {
    constructor(ids, deadsIds) {
        super(713);
        this.ids = ids;
        this.deadsIds = deadsIds;
    }
    serialize() {
        this.buffer.writeShort(this.ids.length);
        var _loc2_ = 0;
        while (_loc2_ < this.ids.length) {
            if (this.ids[_loc2_] < -9007199254740990 || this.ids[_loc2_] > 9007199254740990) {
                Logger.error("Forbidden value (" + this.ids[_loc2_] + ") on element 1 (starting at 1) of ids.");
            }
            this.buffer.writeDouble(this.ids[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.deadsIds.length);
        var _loc3_ = 0;
        while (_loc3_ < this.deadsIds.length) {
            if (this.deadsIds[_loc3_] < -9007199254740990 || this.deadsIds[_loc3_] > 9007199254740990) {
                Logger.error("Forbidden value (" + this.deadsIds[_loc3_] + ") on element 2 (starting at 1) of deadsIds.");
            }
            this.buffer.writeDouble(this.deadsIds[_loc3_]);
            _loc3_++;
        }
    }
    deserialize(buffer) {
        var _loc6_ = null;
        var _loc7_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = buffer.readDouble();
            if (_loc6_ < -9007199254740990 || _loc6_ > 9007199254740990) {
                Logger.error("Forbidden value (" + _loc6_ + ") on elements of ids.");
            }
            this.ids.push(_loc6_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc7_ = buffer.readDouble();
            if (_loc7_ < -9007199254740990 || _loc7_ > 9007199254740990) {
                Logger.error("Forbidden value (" + _loc7_ + ") on elements of deadsIds.");
            }
            this.deadsIds.push(_loc7_);
            _loc5_++;
        }
    }
}

export class GameFightTurnStartMessage extends ProtocolMessage {
    constructor(id, waitTime) {
        super(714);
        this.id = id;
        this.waitTime = waitTime;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
        if (this.waitTime < 0) {
            Logger.error("Forbidden value (" + this.waitTime + ") on element waitTime.");
        }
        this.buffer.writeVarInt(this.waitTime);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of GameFightTurnStartMessage.id.");
        }
        this.waitTime = buffer.readVarUhInt();
        if (this.waitTime < 0) {
            Logger.error("Forbidden value (" + this.waitTime + ") on element of GameFightTurnStartMessage.waitTime.");
        }
    }
}

export class GameFightTurnEndMessage extends ProtocolMessage {
    constructor(id) {
        super(719);
        this.id = id;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of GameFightTurnEndMessage.id.");
        }
    }
}

export class GameFightTurnFinishMessage extends ProtocolMessage {
    constructor(isAfk) {
        super(718);
        this.isAfk = isAfk;
    }
    serialize() {
        this.buffer.writeBoolean(this.isAfk);
    }
    deserialize(buffer) {
        this.isAfk = buffer.readBoolean();
    }
}


export class AbstractGameActionMessage extends ProtocolMessage {
    constructor(actionId, sourceId) {
        super(1000);
        this.actionId = actionId;
        this.sourceId = sourceId;
    }
    serialize() {
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element actionId.");
        }
        this.buffer.writeVarShort(this.actionId);
        if (this.sourceId < -9007199254740990 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeDouble(this.sourceId);
    }
    deserialize(buffer) {
        this.actionId = buffer.readVarUhShort();
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element of AbstractGameActionMessage.actionId.");
        }
        this.sourceId = buffer.readDouble();
        if (this.sourceId < -9007199254740990 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of AbstractGameActionMessage.sourceId.");
        }
    }
}

export class GameActionFightPointsVariationMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.delta = param4;
        this.messageId = 1030;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        this.buffer.writeShort(this.delta);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightPointsVariationMessage.targetId.");
        }
        this.delta = buffer.readShort();
    }
}

export class SequenceStartMessage extends ProtocolMessage {
    constructor(sequenceType, authorId) {
        super(955);
        this.sequenceType = sequenceType;
        this.authorId = authorId;
    }
    serialize() {
        this.buffer.writeByte(this.sequenceType);
        if (this.authorId < -9007199254740990 || this.authorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.authorId + ") on element authorId.");
        }
        this.buffer.writeDouble(this.authorId);
    }
    deserialize(buffer) {
        this.sequenceType = buffer.readByte();
        this.authorId = buffer.readDouble();
        if (this.authorId < -9007199254740990 || this.authorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.authorId + ") on element of SequenceStartMessage.authorId.");
        }
    }
}

export class SequenceEndMessage extends ProtocolMessage {
    constructor(actionId, authorId, sequenceType) {
        super(956);
        this.actionId = actionId;
        this.authorId = authorId;
        this.sequenceType = sequenceType;
    }
    serialize() {
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element actionId.");
        }
        this.buffer.writeVarShort(this.actionId);
        if (this.authorId < -9007199254740990 || this.authorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.authorId + ") on element authorId.");
        }
        this.buffer.writeDouble(this.authorId);
        this.buffer.writeByte(this.sequenceType);
    }
    deserialize(buffer) {
        this.actionId = buffer.readVarUhShort();
        if (this.actionId < 0) {
            Logger.error("Forbidden value (" + this.actionId + ") on element of SequenceEndMessage.actionId.");
        }
        this.authorId = buffer.readDouble();
        if (this.authorId < -9007199254740990 || this.authorId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.authorId + ") on element of SequenceEndMessage.authorId.");
        }
        this.sequenceType = buffer.readByte();
    }
}

export class GameFightTurnReadyMessage extends ProtocolMessage {
    constructor(isReady) {
        super(716);
        this.isReady = isReady;
    }
    serialize() {
        this.buffer.writeBoolean(this.isReady);
    }
    deserialize(buffer) {
        this.isReady = buffer.readBoolean();
    }
}

export class GameFightTurnReadyRequestMessage extends ProtocolMessage {
    constructor(id) {
        super(715);
        this.id = id;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of GameFightTurnReadyRequestMessage.id.");
        }
    }
}

export class GameFightTurnStartPlayingMessage extends ProtocolMessage {
    constructor() {
        super(6465);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class NotificationListMessage extends ProtocolMessage {
    constructor(flags) {
        super(6087);
        this.flags = flags;
    }
    serialize() {
        this.buffer.writeShort(this.flags.length);
        var _loc2_ = 0;
        while (_loc2_ < this.flags.length) {
            this.buffer.writeVarInt(this.flags[_loc2_]);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readVarInt();
            this.flags.push(_loc4_);
            _loc3_++;
        }
    }
}

export class PartyKickRequestMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.playerId = param2;
        this.messageId = 5592;
    }
    serialize() {
        super.serialize();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        this.buffer.writeVarLong(this.playerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerId = buffer.readVarLong();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element of PartyKickRequestMessage.playerId.");
        }
    }
}

export class PartyLeaderUpdateMessage extends AbstractPartyEventMessage {
    constructor(param1, param2) {
        super(param1);
        this.partyLeaderId = param2;
        this.messageId = 5578;
    }

    serialize() {
        super.serialize();
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element partyLeaderId.");
        }
        this.buffer.writeVarLong(this.partyLeaderId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.partyLeaderId = buffer.readVarUhLong();
        if (this.partyLeaderId < 0 || this.partyLeaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.partyLeaderId + ") on element of PartyLeaderUpdateMessage.partyLeaderId.");
        }
    }
}

export class PartyAbdicateThroneMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.playerId = param2;
        this.messageId = 6080;
    }
    serialize() {
        super.serialize();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        this.buffer.writeVarLong(this.playerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerId = buffer.readVarUhLong();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element of PartyAbdicateThroneMessage.playerId.");
        }
    }
}

// Generated by Noxus messages
export class PartyFollowMemberRequestMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.playerId = param2;
        this.messageId = 5577;
    }
    serialize() {
        super.serialize();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        this.buffer.writeVarLong(this.playerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerId = buffer.readVarUhLong();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element of PartyFollowMemberRequestMessage.playerId.");
        }
    }
}

// Generated by Noxus messages
export class PartyFollowStatusUpdateMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4) {
        super(param1);
        this.success = param2;
        this.isFollowed = param3;
        this.followedId = param4;
        this.messageId = 5581;
    }
    serialize() {
        super.serialize();
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.success);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.isFollowed);
        this.buffer.writeByte(_loc2_);
        if (this.followedId < 0 || this.followedId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.followedId + ") on element followedId.");
        }
        this.buffer.writeVarLong(this.followedId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readByte();
        this.success = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.isFollowed = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.followedId = buffer.readVarUhLong();
        if (this.followedId < 0 || this.followedId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.followedId + ") on element of PartyFollowStatusUpdateMessage.followedId.");
        }
    }
}

// Generated by Noxus messages
export class PartyFollowThisMemberRequestMessage extends PartyFollowMemberRequestMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.enabled = param3;
        this.messageId = 5588;
    }
    serialize() {
        super.serialize();
        this.buffer.writeBoolean(this.enabled);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.enabled = buffer.readBoolean();
    }
}

export class PartyStopFollowRequestMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.playerId = param2;
        this.messageId = 5574;
    }
    serialize() {
        super.serialize();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element playerId.");
        }
        this.buffer.writeVarLong(this.playerId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.playerId = buffer.readVarUhLong();
        if (this.playerId < 0 || this.playerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.playerId + ") on element of PartyStopFollowRequestMessage.playerId.");
        }
    }
}


export class CompassUpdateMessage extends ProtocolMessage {
    constructor(type, coords) {
        super(5591);
        this.type = type;
        this.coords = coords;
    }
    serialize() {
        this.buffer.writeByte(this.type);
        this.buffer.writeShort(this.coords.protocolId);
        this.coords.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.type = buffer.readByte();
        if (this.type < 0) {
            Logger.error("Forbidden value (" + this.type + ") on element of CompassUpdateMessage.type.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        this.coords = ProtocolTypeManager.getInstance(MapCoordinates, _loc2_);
        this.coords.deserialize(buffer);
    }
}

export class CompassUpdatePartyMemberMessage extends CompassUpdateMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.memberId = param3;
        this.active = param4;
        this.messageId = 5589;
    }
    serialize() {
        super.serialize();
        if (this.memberId < 0 || this.memberId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.memberId + ") on element memberId.");
        }
        this.buffer.writeVarLong(this.memberId);
        this.buffer.writeBoolean(this.active);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.memberId = buffer.readVarUhLong();
        if (this.memberId < 0 || this.memberId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.memberId + ") on element of CompassUpdatePartyMemberMessage.memberId.");
        }
        this.active = buffer.readBoolean();
    }
}

export class PartyInvitationDetailsMessage extends AbstractPartyMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8) {
        super(param1);
        this.partyType = param2;
        this.partyName = param3;
        this.fromId = param4;
        this.fromName = param5;
        this.leaderId = param6;
        this.members = param7;
        this.guests = param8;
        this.messageId = 6263;
    }
    serialize() {
        super.serialize();
        this.buffer.writeByte(this.partyType);
        this.buffer.writeUTF(this.partyName);
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element fromId.");
        }
        this.buffer.writeVarLong(this.fromId);
        this.buffer.writeUTF(this.fromName);
        if (this.leaderId < 0 || this.leaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leaderId + ") on element leaderId.");
        }
        this.buffer.writeVarLong(this.leaderId);
        this.buffer.writeShort(this.members.length);
        var _loc2_ = 0;
        while (_loc2_ < this.members.length) {
            this.members[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
        this.buffer.writeShort(this.guests.length);
        var _loc3_ = 0;
        while (_loc3_ < this.guests.length) {
            this.guests[_loc3_].serialize(this.buffer);
            _loc3_++;
        }
    }
    deserialize(buffer) {
        var _loc6_ = null;
        var _loc7_ = null;
        super.deserialize(buffer);
        this.partyType = buffer.readByte();
        if (this.partyType < 0) {
            Logger.error("Forbidden value (" + this.partyType + ") on element of PartyInvitationDetailsMessage.partyType.");
        }
        this.partyName = buffer.readUTF();
        this.fromId = buffer.readVarUhLong();
        if (this.fromId < 0 || this.fromId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.fromId + ") on element of PartyInvitationDetailsMessage.fromId.");
        }
        this.fromName = buffer.readUTF();
        this.leaderId = buffer.readVarUhLong();
        if (this.leaderId < 0 || this.leaderId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.leaderId + ") on element of PartyInvitationDetailsMessage.leaderId.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc6_ = new PartyInvitationMemberInformations();
            _loc6_.deserialize(buffer);
            this.members.push(_loc6_);
            _loc3_++;
        }
        var _loc4_ = buffer.readUnsignedShort();
        var _loc5_ = 0;
        while (_loc5_ < _loc4_) {
            _loc7_ = new PartyGuestInformations();
            _loc7_.deserialize(buffer);
            this.guests.push(_loc7_);
            _loc5_++;
        }
    }
}

export class PartyInvitationDetailsRequestMessage extends AbstractPartyMessage {
    constructor(param1) {
        super(param1);
        this.messageId = 6264;
    }
    serialize() {
        super.serialize();
    }
    deserialize(buffer) {
        super.deserialize(buffer);
    }
}

export class ShortcutBarAddRequestMessage extends ProtocolMessage {
    constructor(barType, shortcut) {
        super(6225);
        this.barType = barType;
        this.shortcut = shortcut;
    }
    serialize() {
        this.buffer.writeByte(this.barType);
        this.buffer.writeShort(this.shortcut.protocolId);
        this.shortcut.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.barType = buffer.readByte();
        if (this.barType < 0) {
            Logger.error("Forbidden value (" + this.barType + ") on element of ShortcutBarAddRequestMessage.barType.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        this.shortcut = ProtocolTypeManager.getInstance(_loc2_);
        this.shortcut.deserialize(buffer);
    }
}

export class ShortcutBarContentMessage extends ProtocolMessage {
    constructor(barType, shortcuts) {
        super(6231);
        this.barType = barType;
        this.shortcuts = shortcuts;
    }
    serialize() {
        this.buffer.writeByte(this.barType);
        this.buffer.writeShort(this.shortcuts.length);
        var _loc2_ = 0;
        while (_loc2_ < this.shortcuts.length) {
            this.buffer.writeShort(this.shortcuts[_loc2_].protocolId);
            this.shortcuts[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        var _loc5_ = null;
        this.barType = buffer.readByte();
        if (this.barType < 0) {
            Logger.error("Forbidden value (" + this.barType + ") on element of ShortcutBarContentMessage.barType.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readUnsignedShort();
            _loc5_ = ProtocolTypeManager.getInstance(Shortcut, _loc4_);
            _loc5_.deserialize(buffer);
            this.shortcuts.push(_loc5_);
            _loc3_++;
        }
    }
}

export class ShortcutBarRefreshMessage extends ProtocolMessage {
    constructor(barType, shortcut) {
        super(6229);
        this.barType = barType;
        this.shortcut = shortcut;
    }
    serialize() {
        this.buffer.writeByte(this.barType);
        this.buffer.writeShort(this.shortcut.protocolId);
        this.shortcut.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.barType = buffer.readByte();
        if (this.barType < 0) {
            Logger.error("Forbidden value (" + this.barType + ") on element of ShortcutBarRefreshMessage.barType.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        this.shortcut = ProtocolTypeManager.getInstance(Shortcut, _loc2_);
        this.shortcut.deserialize(buffer);
    }
}

export class PartyCancelInvitationMessage extends AbstractPartyMessage {
    constructor(param1, param2) {
        super(param1);
        this.guestId = param2;
        this.messageId = 6254;
    }
    serialize() {
        super.serialize();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element guestId.");
        }
        this.buffer.writeVarLong(this.guestId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.guestId = buffer.readVarUhLong();
        if (this.guestId < 0 || this.guestId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.guestId + ") on element of PartyCancelInvitationMessage.guestId.");
        }
    }
}

export class ExchangeRequestMessage extends ProtocolMessage {
    constructor(exchangeType) {
        super(5505);
        this.exchangeType = exchangeType;
    }
    serialize() {
        this.buffer.writeByte(this.exchangeType);
    }
    deserialize(buffer) {
        this.exchangeType = buffer.readByte();
    }
}

export class ExchangePlayerRequestMessage extends ExchangeRequestMessage {
    constructor(param1, param2) {
        super(param1);
        this.target = param2;
        this.messageId = 5773;
    }
    serialize() {
        super.serialize();
        if (this.target < 0 || this.target > 9007199254740990) {
            Logger.error("Forbidden value (" + this.target + ") on element target.");
        }
        this.buffer.writeVarLong(this.target);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.target = buffer.readVarUhLong();
        if (this.target < 0 || this.target > 9007199254740990) {
            Logger.error("Forbidden value (" + this.target + ") on element of ExchangePlayerRequestMessage.target.");
        }
    }
}

export class ExchangeRequestedMessage extends ProtocolMessage {
    constructor(exchangeType) {
        super(5522);
        this.exchangeType = exchangeType;
    }
    serialize() {
        this.buffer.writeByte(this.exchangeType);
    }
    deserialize(buffer) {
        this.exchangeType = buffer.readByte();
    }
}

export class ExchangeRequestedTradeMessage extends ExchangeRequestedMessage {
    constructor(param1, param2, param3) {
        super(param1);
        this.source = param2;
        this.target = param3;
        this.messageId = 5523;
    }
    serialize() {
        super.serialize();
        if (this.source < 0 || this.source > 9007199254740990) {
            Logger.error("Forbidden value (" + this.source + ") on element source.");
        }
        this.buffer.writeVarLong(this.source);
        if (this.target < 0 || this.target > 9007199254740990) {
            Logger.error("Forbidden value (" + this.target + ") on element target.");
        }
        this.buffer.writeVarLong(this.target);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.source = buffer.readVarUhLong();
        if (this.source < 0 || this.source > 9007199254740990) {
            Logger.error("Forbidden value (" + this.source + ") on element of ExchangeRequestedTradeMessage.source.");
        }
        this.target = buffer.readVarUhLong();
        if (this.target < 0 || this.target > 9007199254740990) {
            Logger.error("Forbidden value (" + this.target + ") on element of ExchangeRequestedTradeMessage.target.");
        }
    }
}

export class ShortcutBarSwapRequestMessage extends ProtocolMessage {
    constructor(barType, firstSlot, secondSlot) {
        super(6230);
        this.barType = barType;
        this.firstSlot = firstSlot;
        this.secondSlot = secondSlot;
    }
    serialize() {
        this.buffer.writeByte(this.barType);
        if (this.firstSlot < 0 || this.firstSlot > 99) {
            Logger.error("Forbidden value (" + this.firstSlot + ") on element firstSlot.");
        }
        this.buffer.writeByte(this.firstSlot);
        if (this.secondSlot < 0 || this.secondSlot > 99) {
            Logger.error("Forbidden value (" + this.secondSlot + ") on element secondSlot.");
        }
        this.buffer.writeByte(this.secondSlot);
    }
    deserialize(buffer) {
        this.barType = buffer.readByte();
        if (this.barType < 0) {
            Logger.error("Forbidden value (" + this.barType + ") on element of ShortcutBarSwapRequestMessage.barType.");
        }
        this.firstSlot = buffer.readByte();
        if (this.firstSlot < 0 || this.firstSlot > 99) {
            Logger.error("Forbidden value (" + this.firstSlot + ") on element of ShortcutBarSwapRequestMessage.firstSlot.");
        }
        this.secondSlot = buffer.readByte();
        if (this.secondSlot < 0 || this.secondSlot > 99) {
            Logger.error("Forbidden value (" + this.secondSlot + ") on element of ShortcutBarSwapRequestMessage.secondSlot.");
        }
    }
}

export class ShortcutBarRemoveRequestMessage extends ProtocolMessage {
    constructor(barType, slot) {
        super(6228);
        this.barType = barType;
        this.slot = slot;
    }
    serialize() {
        this.buffer.writeByte(this.barType);
        if (this.slot < 0 || this.slot > 99) {
            Logger.error("Forbidden value (" + this.slot + ") on element slot.");
        }
        this.buffer.writeByte(this.slot);
    }
    deserialize(buffer) {
        this.barType = buffer.readByte();
        if (this.barType < 0) {
            Logger.error("Forbidden value (" + this.barType + ") on element of ShortcutBarRemoveRequestMessage.barType.");
        }
        this.slot = buffer.readByte();
        if (this.slot < 0 || this.slot > 99) {
            Logger.error("Forbidden value (" + this.slot + ") on element of ShortcutBarRemoveRequestMessage.slot.");
        }
    }
}
export class EntityLook{
constructor(bonesId,skins,indexedColors,scales,subentities) {
this.bonesId = bonesId;
this.skins = skins;
this.indexedColors = indexedColors;
this.scales = scales;
this.subentities = subentities;
this.protocolId  = 55;
}
serialize(buffer){
         if(this.bonesId < 0)
         {
            Logger.error("Forbidden value (" + this.bonesId + ") on element bonesId.");
         }
         buffer.writeVarShort(this.bonesId);
         buffer.writeShort(this.skins.length);
         var _loc2_ =  0;
         while(_loc2_ < this.skins.length)
         {
            if(this.skins[_loc2_] < 0)
            {
               Logger.error("Forbidden value (" + this.skins[_loc2_] + ") on element 2 (starting at 1) of skins.");
            }
            buffer.writeVarShort(this.skins[_loc2_]);
            _loc2_++;
         }
         buffer.writeShort(this.indexedColors.length);
         var _loc3_ =  0;
         while(_loc3_ < this.indexedColors.length)
         {
            buffer.writeInt(this.indexedColors[_loc3_]);
            _loc3_++;
         }
         buffer.writeShort(this.scales.length);
         var _loc4_ =  0;
         while(_loc4_ < this.scales.length)
         {
            buffer.writeVarShort(this.scales[_loc4_]);
            _loc4_++;
         }
         buffer.writeShort(this.subentities.length);
         var _loc5_ =  0;
         while(_loc5_ < this.subentities.length)
         {
this.subentities[_loc5_].serialize(buffer);
            _loc5_++;
         }
}
}

export class ExchangeLeaveMessage extends LeaveDialogMessage {
    constructor(param1, param2) {
        super(param1);
        this.success = param2;
        this.messageId = 5628;
    }
    serialize() {
        super.serialize();
        this.buffer.writeBoolean(this.success);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.success = buffer.readBoolean();
    }
}

export class ExchangeAcceptMessage extends ProtocolMessage {
    constructor() {
        super(5508);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class ExchangeStartedMessage extends ProtocolMessage {
    constructor(exchangeType) {
        super(5512);
        this.exchangeType = exchangeType;
    }
    serialize() {
        this.buffer.writeByte(this.exchangeType);
    }
    deserialize(buffer) {
        this.exchangeType = buffer.readByte();
    }
}

export class ExchangeStartedWithPodsMessage extends ExchangeStartedMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7) {
        super(param1);
        this.firstCharacterId = param2;
        this.firstCharacterCurrentWeight = param3;
        this.firstCharacterMaxWeight = param4;
        this.secondCharacterId = param5;
        this.secondCharacterCurrentWeight = param6;
        this.secondCharacterMaxWeight = param7;
        this.messageId = 6129;
    }
    serialize() {
        super.serialize();
        if (this.firstCharacterId < -9007199254740990 || this.firstCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.firstCharacterId + ") on element firstCharacterId.");
        }
        this.buffer.writeDouble(this.firstCharacterId);
        if (this.firstCharacterCurrentWeight < 0) {
            Logger.error("Forbidden value (" + this.firstCharacterCurrentWeight + ") on element firstCharacterCurrentWeight.");
        }
        this.buffer.writeVarInt(this.firstCharacterCurrentWeight);
        if (this.firstCharacterMaxWeight < 0) {
            Logger.error("Forbidden value (" + this.firstCharacterMaxWeight + ") on element firstCharacterMaxWeight.");
        }
        this.buffer.writeVarInt(this.firstCharacterMaxWeight);
        if (this.secondCharacterId < -9007199254740990 || this.secondCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.secondCharacterId + ") on element secondCharacterId.");
        }
        this.buffer.writeDouble(this.secondCharacterId);
        if (this.secondCharacterCurrentWeight < 0) {
            Logger.error("Forbidden value (" + this.secondCharacterCurrentWeight + ") on element secondCharacterCurrentWeight.");
        }
        this.buffer.writeVarInt(this.secondCharacterCurrentWeight);
        if (this.secondCharacterMaxWeight < 0) {
            Logger.error("Forbidden value (" + this.secondCharacterMaxWeight + ") on element secondCharacterMaxWeight.");
        }
        this.buffer.writeVarInt(this.secondCharacterMaxWeight);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.firstCharacterId = buffer.readDouble();
        if (this.firstCharacterId < -9007199254740990 || this.firstCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.firstCharacterId + ") on element of ExchangeStartedWithPodsMessage.firstCharacterId.");
        }
        this.firstCharacterCurrentWeight = buffer.readVarUhInt();
        if (this.firstCharacterCurrentWeight < 0) {
            Logger.error("Forbidden value (" + this.firstCharacterCurrentWeight + ") on element of ExchangeStartedWithPodsMessage.firstCharacterCurrentWeight.");
        }
        this.firstCharacterMaxWeight = buffer.readVarUhInt();
        if (this.firstCharacterMaxWeight < 0) {
            Logger.error("Forbidden value (" + this.firstCharacterMaxWeight + ") on element of ExchangeStartedWithPodsMessage.firstCharacterMaxWeight.");
        }
        this.secondCharacterId = buffer.readDouble();
        if (this.secondCharacterId < -9007199254740990 || this.secondCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.secondCharacterId + ") on element of ExchangeStartedWithPodsMessage.secondCharacterId.");
        }
        this.secondCharacterCurrentWeight = buffer.readVarUhInt();
        if (this.secondCharacterCurrentWeight < 0) {
            Logger.error("Forbidden value (" + this.secondCharacterCurrentWeight + ") on element of ExchangeStartedWithPodsMessage.secondCharacterCurrentWeight.");
        }
        this.secondCharacterMaxWeight = buffer.readVarUhInt();
        if (this.secondCharacterMaxWeight < 0) {
            Logger.error("Forbidden value (" + this.secondCharacterMaxWeight + ") on element of ExchangeStartedWithPodsMessage.secondCharacterMaxWeight.");
        }
    }
}

export class GameActionFightCastRequestMessage extends ProtocolMessage {
    constructor(spellId, cellId) {
        super(1005);
        this.spellId = spellId;
        this.cellId = cellId;
    }
    serialize() {
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        if (this.cellId < -1 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeShort(this.cellId);
    }
    deserialize(buffer) {
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of GameActionFightCastRequestMessage.spellId.");
        }
        this.cellId = buffer.readShort();
        if (this.cellId < -1 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of GameActionFightCastRequestMessage.cellId.");
        }
    }
}

export class GameContextKickMessage extends ProtocolMessage {
    constructor(targetId) {
        super(6081);
        this.targetId = targetId;
    }
    serialize() {
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
    }
    deserialize(buffer) {
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameContextKickMessage.targetId.");
        }
    }
}

export class AbstractGameActionFightTargetedAbilityMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7) {
        super(param1, param2);
        this.targetId = param3;
        this.destinationCellId = param4;
        this.critical = param5;
        this.silentCast = param6;
        this.verboseCast = param7;
        this.messageId = 6118;
    }
    serialize() {
        super.serialize();
        var _loc2_ = 0;
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 0, this.silentCast);
        _loc2_ = IO.BooleanByteWrapper.setFlag(_loc2_, 1, this.verboseCast);
        this.buffer.writeByte(_loc2_);
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.destinationCellId < -1 || this.destinationCellId > 559) {
            Logger.error("Forbidden value (" + this.destinationCellId + ") on element destinationCellId.");
        }
        this.buffer.writeShort(this.destinationCellId);
        this.buffer.writeByte(this.critical);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readByte();
        this.silentCast = IO.BooleanByteWrapper.getFlag(_loc2_, 0);
        this.verboseCast = IO.BooleanByteWrapper.getFlag(_loc2_, 1);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of AbstractGameActionFightTargetedAbilityMessage.targetId.");
        }
        this.destinationCellId = buffer.readShort();
        if (this.destinationCellId < -1 || this.destinationCellId > 559) {
            Logger.error("Forbidden value (" + this.destinationCellId + ") on element of AbstractGameActionFightTargetedAbilityMessage.destinationCellId.");
        }
        this.critical = buffer.readByte();
        if (this.critical < 0) {
            Logger.error("Forbidden value (" + this.critical + ") on element of AbstractGameActionFightTargetedAbilityMessage.critical.");
        }
    }
}

export class GameActionFightSpellCastMessage extends AbstractGameActionFightTargetedAbilityMessage {
    constructor(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10) {
        super(param1, param2, param3, param4, param5, param6, param7);
        this.spellId = param8;
        this.spellLevel = param9;
        this.portalsIds = param10;
        this.messageId = 1010;
    }
    serialize() {
        super.serialize();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        if (this.spellLevel < 1 || this.spellLevel > 200) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element spellLevel.");
        }
        this.buffer.writeShort(this.spellLevel);
        this.buffer.writeShort(this.portalsIds.length);
        var _loc2_ = 0;
        while (_loc2_ < this.portalsIds.length) {
            this.buffer.writeShort(this.portalsIds[_loc2_]);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = 0;
        super.deserialize(buffer);
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of GameActionFightSpellCastMessage.spellId.");
        }
        this.spellLevel = buffer.readShort();
        if (this.spellLevel < 1 || this.spellLevel > 200) {
            Logger.error("Forbidden value (" + this.spellLevel + ") on element of GameActionFightSpellCastMessage.spellLevel.");
        }
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = buffer.readShort();
            this.portalsIds.push(_loc4_);
            _loc3_++;
        }
    }
}

export class GameActionFightLifePointsLostMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4, param5) {
        super(param1, param2);
        this.targetId = param3;
        this.loss = param4;
        this.permanentDamages = param5;
        this.messageId = 6312;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.loss < 0) {
            Logger.error("Forbidden value (" + this.loss + ") on element loss.");
        }
        this.buffer.writeVarInt(this.loss);
        if (this.permanentDamages < 0) {
            Logger.error("Forbidden value (" + this.permanentDamages + ") on element permanentDamages.");
        }
        this.buffer.writeVarInt(this.permanentDamages);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightLifePointsLostMessage.targetId.");
        }
        this.loss = buffer.readVarUhInt();
        if (this.loss < 0) {
            Logger.error("Forbidden value (" + this.loss + ") on element of GameActionFightLifePointsLostMessage.loss.");
        }
        this.permanentDamages = buffer.readVarUhInt();
        if (this.permanentDamages < 0) {
            Logger.error("Forbidden value (" + this.permanentDamages + ") on element of GameActionFightLifePointsLostMessage.permanentDamages.");
        }
    }
}

export class GameActionFightDeathMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.targetId = param3;
        this.messageId = 1099;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightDeathMessage.targetId.");
        }
    }
}

export class ExchangeObjectMoveKamaMessage extends ProtocolMessage {
    constructor(quantity) {
        super(5520);
        this.quantity = quantity;
    }
    serialize() {
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.quantity = buffer.readVarInt();
    }
}

export class ExchangeObjectMessage extends ProtocolMessage {
    constructor(remote) {
        super(5515);
        this.remote = remote;
    }
    serialize() {
        this.buffer.writeBoolean(this.remote);
    }
    deserialize(buffer) {
        this.remote = buffer.readBoolean();
    }
}

export class ExchangeKamaModifiedMessage extends ExchangeObjectMessage {
    constructor(param1, param2) {
        super(param1);
        this.quantity = param2;
        this.messageId = 5521;
    }
    serialize() {
        super.serialize();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ExchangeKamaModifiedMessage.quantity.");
        }
    }
}

export class ExchangeObjectMoveMessage extends ProtocolMessage {
    constructor(objectUID, quantity) {
        super(5518);
        this.objectUID = objectUID;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ExchangeObjectMoveMessage.objectUID.");
        }
        this.quantity = buffer.readVarInt();
    }
}

export class ExchangeObjectAddedMessage extends ExchangeObjectMessage {
    constructor(param1, param2) {
        super(param1);
        this.object = param2;
        this.messageId = 5516;
    }
    serialize() {
        super.serialize();
        this.object.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.object = new ObjectItem();
        this.object.deserialize(buffer);
    }
}

export class ExchangeObjectModifiedMessage extends ExchangeObjectMessage {
    constructor(param1, param2) {
        super(param1);
        this.object = param2;
        this.messageId = 5519;
    }
    serialize() {
        super.serialize();
        this.object.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.object = new ObjectItem();
        this.object.deserialize(buffer);
    }
}

export class ExchangeObjectRemovedMessage extends ExchangeObjectMessage {
    constructor(param1, param2) {
        super(param1);
        this.objectUID = param2;
        this.messageId = 5517;
    }
    serialize() {
        super.serialize();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element objectUID.");
        }
        this.buffer.writeVarInt(this.objectUID);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.objectUID = buffer.readVarUhInt();
        if (this.objectUID < 0) {
            Logger.error("Forbidden value (" + this.objectUID + ") on element of ExchangeObjectRemovedMessage.objectUID.");
        }
    }
}

export class ExchangeReadyMessage extends ProtocolMessage {
    constructor(ready, step) {
        super(5511);
        this.ready = ready;
        this.step = step;
    }
    serialize() {
        this.buffer.writeBoolean(this.ready);
        if (this.step < 0) {
            Logger.error("Forbidden value (" + this.step + ") on element step.");
        }
        this.buffer.writeVarShort(this.step);
    }
    deserialize(buffer) {
        this.ready = buffer.readBoolean();
        this.step = buffer.readVarUhShort();
        if (this.step < 0) {
            Logger.error("Forbidden value (" + this.step + ") on element of ExchangeReadyMessage.step.");
        }
    }
}

export class ExchangeIsReadyMessage extends ProtocolMessage {
    constructor(id, ready) {
        super(5509);
        this.id = id;
        this.ready = ready;
    }
    serialize() {
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element id.");
        }
        this.buffer.writeDouble(this.id);
        this.buffer.writeBoolean(this.ready);
    }
    deserialize(buffer) {
        this.id = buffer.readDouble();
        if (this.id < -9007199254740990 || this.id > 9007199254740990) {
            Logger.error("Forbidden value (" + this.id + ") on element of ExchangeIsReadyMessage.id.");
        }
        this.ready = buffer.readBoolean();
    }
}

export class GameActionFightTeleportOnSameMapMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.cellId = param4;
        this.messageId = 5528;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.cellId < -1 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeShort(this.cellId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightTeleportOnSameMapMessage.targetId.");
        }
        this.cellId = buffer.readShort();
        if (this.cellId < -1 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of GameActionFightTeleportOnSameMapMessage.cellId.");
        }
    }
}
export class NpcGenericActionRequestMessage extends ProtocolMessage {
    constructor(npcId, npcActionId, npcMapId) {
        super(5898);
        this.npcId = npcId;
        this.npcActionId = npcActionId;
        this.npcMapId = npcMapId;
    }
    serialize() {
        this.buffer.writeInt(this.npcId);
        if (this.npcActionId < 0) {
            Logger.error("Forbidden value (" + this.npcActionId + ") on element npcActionId.");
        }
        this.buffer.writeByte(this.npcActionId);
        this.buffer.writeInt(this.npcMapId);
    }
    deserialize(buffer) {
        this.npcId = buffer.readInt();
        this.npcActionId = buffer.readByte();
        if (this.npcActionId < 0) {
            Logger.error("Forbidden value (" + this.npcActionId + ") on element of NpcGenericActionRequestMessage.npcActionId.");
        }
        this.npcMapId = buffer.readInt();
    }
}

export class GameActionFightDispellableEffectMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.effect = param3;
        this.messageId = 6070;
    }
    serialize() {
        super.serialize();
        this.buffer.writeShort(this.effect.protocolId);
        this.effect.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        var _loc2_ = buffer.readUnsignedShort();
        this.effect = ProtocolTypeManager.getInstance(AbstractFightDispellableEffect, _loc2_);
        this.effect.deserialize(buffer);
    }
}

export class NpcDialogCreationMessage extends ProtocolMessage {
    constructor(mapId, npcId) {
        super(5618);
        this.mapId = mapId;
        this.npcId = npcId;
    }
    serialize() {
        this.buffer.writeInt(this.mapId);
        this.buffer.writeInt(this.npcId);
    }
}
export class NpcDialogQuestionMessage extends ProtocolMessage {
    constructor(message, dialogParams, visibleReplies) {
        super(5617);
        this.message = message;
        this.dialogParams = dialogParams;
        this.visibleReplies = visibleReplies;
    }
    serialize() {
        if (this.message < 0) {
            Logger.error("Forbidden value (" + this.message + ") on element messageId.");
        }
        this.buffer.writeVarShort(this.message);
        this.buffer.writeShort(this.dialogParams.length);
        var _loc2_ = 0;
        while (_loc2_ < this.dialogParams.length) {
            this.buffer.writeUTF(this.dialogParams[_loc2_]);
            _loc2_++;
        }
        this.buffer.writeShort(this.visibleReplies.length);
        var _loc3_ = 0;
        while (_loc3_ < this.visibleReplies.length) {
            if (this.visibleReplies[_loc3_] < 0) {
                Logger.error("Forbidden value (" + this.visibleReplies[_loc3_] + ") on element 3 (starting at 1) of visibleReplies.");
            }
            this.buffer.writeVarShort(this.visibleReplies[_loc3_]);
            _loc3_++;
        }
    }
}

export class GameActionFightSlideMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4, param5) {
        super(param1, param2);
        this.targetId = param3;
        this.startCellId = param4;
        this.endCellId = param5;
        this.messageId = 5525;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.startCellId < -1 || this.startCellId > 559) {
            Logger.error("Forbidden value (" + this.startCellId + ") on element startCellId.");
        }
        this.buffer.writeShort(this.startCellId);
        if (this.endCellId < -1 || this.endCellId > 559) {
            Logger.error("Forbidden value (" + this.endCellId + ") on element endCellId.");
        }
        this.buffer.writeShort(this.endCellId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightSlideMessage.targetId.");
        }
        this.startCellId = buffer.readShort();
        if (this.startCellId < -1 || this.startCellId > 559) {
            Logger.error("Forbidden value (" + this.startCellId + ") on element of GameActionFightSlideMessage.startCellId.");
        }
        this.endCellId = buffer.readShort();
        if (this.endCellId < -1 || this.endCellId > 559) {
            Logger.error("Forbidden value (" + this.endCellId + ") on element of GameActionFightSlideMessage.endCellId.");
        }
    }
}
export class NpcDialogReplyMessage extends ProtocolMessage {
    constructor(replyId) {
        super(5616);
        this.replyId = replyId;
    }
    serialize() {
        if (this.replyId < 0) {
            Logger.error("Forbidden value (" + this.replyId + ") on element replyId.");
        }
        this.buffer.writeVarShort(this.replyId);
    }
    deserialize(buffer) {
        this.replyId = buffer.readVarUhShort();
        if (this.replyId < 0) {
            Logger.error("Forbidden value (" + this.replyId + ") on element of NpcDialogReplyMessage.replyId.");
        }
    }
}

export class GameActionFightDodgePointLossMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.amount = param4;
        this.messageId = 5828;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.amount < 0) {
            Logger.error("Forbidden value (" + this.amount + ") on element amount.");
        }
        this.buffer.writeVarShort(this.amount);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightDodgePointLossMessage.targetId.");
        }
        this.amount = buffer.readVarUhShort();
        if (this.amount < 0) {
            Logger.error("Forbidden value (" + this.amount + ") on element of GameActionFightDodgePointLossMessage.amount.");
        }
    }
}

export class ExchangeStartOkNpcShopMessage extends ProtocolMessage {
    constructor(npcSellerId, tokenId, objectsInfos) {
        super(5761);
        this.npcSellerId = npcSellerId;
        this.tokenId = tokenId;
        this.objectsInfos = objectsInfos;
    }
    serialize() {
        if (this.npcSellerId < -9007199254740990 || this.npcSellerId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.npcSellerId + ") on element npcSellerId.");
        }
        this.buffer.writeDouble(this.npcSellerId);
        if (this.tokenId < 0) {
            Logger.error("Forbidden value (" + this.tokenId + ") on element tokenId.");
        }
        this.buffer.writeVarShort(this.tokenId);
        this.buffer.writeShort(this.objectsInfos.length);
        var _loc2_ = 0;
        while (_loc2_ < this.objectsInfos.length) {
            this.objectsInfos[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
}

export class FighterStatsListMessage extends ProtocolMessage {
    constructor(stats) {
        super(6322);
        this.stats = stats;
    }
    serialize() {
        this.stats.serialize(this.buffer);
    }
    deserialize(buffer) {
        this.stats = new CharacterCharacteristicsInformations();
        this.stats.deserialize(buffer);
    }
}

export class ExchangeBuyMessage extends ProtocolMessage {
    constructor(objectToBuyId, quantity) {
        super(5774);
        this.objectToBuyId = objectToBuyId;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectToBuyId < 0) {
            Logger.error("Forbidden value (" + this.objectToBuyId + ") on element objectToBuyId.");
        }
        this.buffer.writeVarInt(this.objectToBuyId);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectToBuyId = buffer.readVarUhInt();
        if (this.objectToBuyId < 0) {
            Logger.error("Forbidden value (" + this.objectToBuyId + ") on element of ExchangeBuyMessage.objectToBuyId.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ExchangeBuyMessage.quantity.");
        }
    }
}
export class ExchangeErrorMessage extends ProtocolMessage {
    constructor(errorType) {
        super(5513);
        this.errorType = errorType;
    }
    serialize() {
        this.buffer.writeByte(this.errorType);
    }
    deserialize(buffer) {
        this.errorType = buffer.readByte();
    }
}

export class GameActionFightLifePointsGainMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.delta = param4;
        this.messageId = 6311;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.delta < 0) {
            Logger.error("Forbidden value (" + this.delta + ") on element delta.");
        }
        this.buffer.writeVarInt(this.delta);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightLifePointsGainMessage.targetId.");
        }
        this.delta = buffer.readVarUhInt();
        if (this.delta < 0) {
            Logger.error("Forbidden value (" + this.delta + ") on element of GameActionFightLifePointsGainMessage.delta.");
        }
    }
}

export class ExchangeBuyOkMessage extends ProtocolMessage {
    constructor() {
        super(5759);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class GameActionFightCastOnTargetRequestMessage extends ProtocolMessage {
    constructor(spellId, targetId) {
        super(6330);
        this.spellId = spellId;
        this.targetId = targetId;
    }
    serialize() {
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
    }
    deserialize(buffer) {
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of GameActionFightCastOnTargetRequestMessage.spellId.");
        }
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightCastOnTargetRequestMessage.targetId.");
        }
    }
}
export class ExchangeSellMessage extends ProtocolMessage {
    constructor(objectToSellId, quantity) {
        super(5778);
        this.objectToSellId = objectToSellId;
        this.quantity = quantity;
    }
    serialize() {
        if (this.objectToSellId < 0) {
            Logger.error("Forbidden value (" + this.objectToSellId + ") on element objectToSellId.");
        }
        this.buffer.writeVarInt(this.objectToSellId);
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element quantity.");
        }
        this.buffer.writeVarInt(this.quantity);
    }
    deserialize(buffer) {
        this.objectToSellId = buffer.readVarUhInt();
        if (this.objectToSellId < 0) {
            Logger.error("Forbidden value (" + this.objectToSellId + ") on element of ExchangeSellMessage.objectToSellId.");
        }
        this.quantity = buffer.readVarUhInt();
        if (this.quantity < 0) {
            Logger.error("Forbidden value (" + this.quantity + ") on element of ExchangeSellMessage.quantity.");
        }
    }
}

export class ExchangeSellOkMessage extends ProtocolMessage {
    constructor() {
        super(5792);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class GameActionFightNoSpellCastMessage extends ProtocolMessage {
    constructor(spellLevelId) {
        super(6132);
        this.spellLevelId = spellLevelId;
    }
    serialize() {
        if (this.spellLevelId < 0) {
            Logger.error("Forbidden value (" + this.spellLevelId + ") on element spellLevelId.");
        }
        this.buffer.writeVarInt(this.spellLevelId);
    }
    deserialize(buffer) {
        this.spellLevelId = buffer.readVarUhInt();
        if (this.spellLevelId < 0) {
            Logger.error("Forbidden value (" + this.spellLevelId + ") on element of GameActionFightNoSpellCastMessage.spellLevelId.");
        }
    }
}

export class GameActionFightDispellMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.targetId = param3;
        this.messageId = 5533;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightDispellMessage.targetId.");
        }
    }
}

export class GameActionFightDispellSpellMessage extends GameActionFightDispellMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2, param3);
        this.spellId = param4;
        this.messageId = 6176;
    }
    serialize() {
        super.serialize();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.spellId = buffer.readVarUhShort();
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element of GameActionFightDispellSpellMessage.spellId.");
        }
    }
}

export class AlmanachCalendarDateMessage extends ProtocolMessage {
    constructor(date) {
        super(6341);
        this.date = date;
    }
    serialize() {
        this.buffer.writeInt(this.date);
    }
    deserialize(buffer) {
        this.date = buffer.readInt();
    }
}

export class GameRolePlayAttackMonsterRequestMessage extends ProtocolMessage {
    constructor(monsterGroupId) {
        super(6191);
        this.monsterGroupId = monsterGroupId;
    }
    serialize() {
        if (this.monsterGroupId < -9007199254740990 || this.monsterGroupId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.monsterGroupId + ") on element monsterGroupId.");
        }
        this.buffer.writeDouble(this.monsterGroupId);
    }
    deserialize(buffer) {
        this.monsterGroupId = buffer.readDouble();
        if (this.monsterGroupId < -9007199254740990 || this.monsterGroupId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.monsterGroupId + ") on element of GameRolePlayAttackMonsterRequestMessage.monsterGroupId.");
        }
    }
}

export class GameActionFightInvisibilityMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.state = param4;
        this.messageId = 5821;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        this.buffer.writeByte(this.state);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.targetId = buffer.readDouble();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element of GameActionFightInvisibilityMessage.targetId.");
        }
        this.state = buffer.readByte();
        if (this.state < 0) {
            Logger.error("Forbidden value (" + this.state + ") on element of GameActionFightInvisibilityMessage.state.");
        }
    }
}

export class ShowCellMessage extends ProtocolMessage {
    constructor(sourceId, cellId) {
        super(5612);
        this.sourceId = sourceId;
        this.cellId = cellId;
    }
    serialize() {
        if (this.sourceId < -9007199254740990 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element sourceId.");
        }
        this.buffer.writeDouble(this.sourceId);
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element cellId.");
        }
        this.buffer.writeVarShort(this.cellId);
    }
    deserialize(buffer) {
        this.sourceId = buffer.readDouble();
        if (this.sourceId < -9007199254740990 || this.sourceId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.sourceId + ") on element of ShowCellMessage.sourceId.");
        }
        this.cellId = buffer.readVarUhShort();
        if (this.cellId < 0 || this.cellId > 559) {
            Logger.error("Forbidden value (" + this.cellId + ") on element of ShowCellMessage.cellId.");
        }
    }
}

export class GameActionFightMarkCellsMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.mark = param3;
        this.messageId = 5540;
    }
    serialize() {
        super.serialize();
        this.mark.serialize(this.buffer);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.mark = new GameActionMark();
        this.mark.deserialize(buffer);
    }
}
export class GameActionFightSpellCooldownVariationMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4, param5) {
        super(param1, param2);
        this.targetId = param3;
        this.spellId = param4;
        this.value = param5;
        this.messageId = 6219;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        if (this.spellId < 0) {
            Logger.error("Forbidden value (" + this.spellId + ") on element spellId.");
        }
        this.buffer.writeVarShort(this.spellId);
        this.buffer.writeVarShort(this.value);
    }
}

export class GameActionFightTriggerGlyphTrapMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4, param5) {
        super(param1, param2);
        this.markId = param3;
        this.triggeringCharacterId = param4;
        this.triggeredSpellId = param5;
        this.messageId = 5741;
    }
    serialize() {
        super.serialize();
        this.buffer.writeShort(this.markId);
        if (this.triggeringCharacterId < -9007199254740990 || this.triggeringCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.triggeringCharacterId + ") on element triggeringCharacterId.");
        }
        this.buffer.writeDouble(this.triggeringCharacterId);
        if (this.triggeredSpellId < 0) {
            Logger.error("Forbidden value (" + this.triggeredSpellId + ") on element triggeredSpellId.");
        }
        this.buffer.writeVarShort(this.triggeredSpellId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.markId = buffer.readShort();
        this.triggeringCharacterId = buffer.readDouble();
        if (this.triggeringCharacterId < -9007199254740990 || this.triggeringCharacterId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.triggeringCharacterId + ") on element of GameActionFightTriggerGlyphTrapMessage.triggeringCharacterId.");
        }
        this.triggeredSpellId = buffer.readVarUhShort();
        if (this.triggeredSpellId < 0) {
            Logger.error("Forbidden value (" + this.triggeredSpellId + ") on element of GameActionFightTriggerGlyphTrapMessage.triggeredSpellId.");
        }
    }
}

export class GameActionFightUnmarkCellsMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.markId = param3;
        this.messageId = 5570;
    }
    serialize() {
        super.serialize();
        this.buffer.writeShort(this.markId);
    }
    deserialize(buffer) {
        super.deserialize(buffer);
        this.markId = buffer.readShort();
    }
}

export class GameMapNoMovementMessage extends ProtocolMessage {
    constructor(cellX, cellY) {
        super(954);
        this.cellX = cellX;
        this.cellY = cellY;
    }
    serialize() {
        this.buffer.writeShort(this.cellX);
        this.buffer.writeShort(this.cellY);
    }
    deserialize(buffer) {
        this.cellX = buffer.readShort();
        this.cellY = buffer.readShort();
    }
}

export class GameActionFightChangeLookMessage extends AbstractGameActionMessage {
    constructor(param1, param2, param3, param4) {
        super(param1, param2);
        this.targetId = param3;
        this.entityLook = param4;
        this.messageId = 5532;
    }
    serialize() {
        super.serialize();
        if (this.targetId < -9007199254740990 || this.targetId > 9007199254740990) {
            Logger.error("Forbidden value (" + this.targetId + ") on element targetId.");
        }
        this.buffer.writeDouble(this.targetId);
        this.entityLook.serialize(this.buffer);
    }
}

export class FinishMoveListRequestMessage extends ProtocolMessage {
    constructor() {
        super(6702);
    }
    serialize() {
    }
    deserialize(buffer) {
    }
}

export class FinishMoveListMessage extends ProtocolMessage {
    constructor(finishMoves) {
        super(6704);
        this.finishMoves = finishMoves;
    }
    serialize() {
        this.buffer.writeShort(this.finishMoves.length);
        var _loc2_ = 0;
        while (_loc2_ < this.finishMoves.length) {
            this.finishMoves[_loc2_].serialize(this.buffer);
            _loc2_++;
        }
    }
    deserialize(buffer) {
        var _loc4_ = null;
        var _loc2_ = buffer.readUnsignedShort();
        var _loc3_ = 0;
        while (_loc3_ < _loc2_) {
            _loc4_ = new Types.FinishMoveInformations();
            _loc4_.deserialize(buffer);
            this.finishMoves.push(_loc4_);
            _loc3_++;
        }
    }
}

// Ask for ornaments & titles
export class TitlesAndOrnamentsListRequestMessage extends ProtocolMessage {
	constructor() {
		super(6363);
	}

	serialize() {}
	deserialize(buffer) {}
}

// Return ornaments & titles list
export class TitlesAndOrnamentsListMessage extends ProtocolMessage {
	constructor(titles, ornaments, activeTitle, activeOrnament) {
		super(6367);
		this.titles = titles;
		this.ornaments = ornaments;
		this.activeTitle = activeTitle;
		this.activeOrnament = activeOrnament;
	}

	serialize() {
		this.buffer.writeShort(this.titles.length);
		for (var i = 0; i < this.titles.length ; i++) {
			this.buffer.writeVarShort(this.titles[i]);
		}

		this.buffer.writeShort(this.ornaments.length);
		for (var i = 0; i < this.ornaments.length ; i++) {
			this.buffer.writeVarShort(this.ornaments[i]);
		}

		this.buffer.writeVarShort(this.activeTitle);
		this.buffer.writeVarShort(this.activeOrnament);
	}
}

export class OrnamentGainedMessage extends ProtocolMessage {
	constructor(ornamentId) {
		super(6368);
		this.ornamentId = ornamentId;
	}

	serialize() {
		this.buffer.writeShort(this.ornamentId);
	}
}


export class OrnamentSelectRequestMessage extends ProtocolMessage {
	constructor(ornamentId)
	{
		super(6374);
		this.ornamentId = ornamentId;
	}

	deserialize(buffer) {
		this.ornamentId = buffer.readVarUhShort();
	}
}

export class OrnamentSelectMessage extends ProtocolMessage {
	constructor(ornamentId)
	{
		super(6369);
		this.ornamentId = ornamentId;
	}

	serialize() {
		this.buffer.writeVarShort(this.ornamentId);
	}
}

export class OrnamentSelectErrorMessage extends ProtocolMessage {
	constructor(reason)
	{
		super(6370);
		this.reason = reason;
	}

	serialize() {
		this.buffer.writeByte(this.reason);
	}
}

export class TitleGainedMessage extends ProtocolMessage {
	constructor(titleId) {
		super(6364);
		this.titleId = titleId;
	}

	serialize() {
		this.buffer.writeVarShort(this.titleId);
	}
}

export class TitleSelectRequestMessage extends ProtocolMessage {
	constructor(titleId)
	{
		super(6365);
		this.titleId = titleId;
	}

	deserialize(buffer) {
		this.titleId = buffer.readVarUhShort();
	}
}

export class TitleSelectMessage extends ProtocolMessage {
	constructor(titleId)
	{
		super(6366)
		this.titleId = titleId;
	}

	serialize() {
		this.buffer.writeVarShort(this.titleId);
	}
}

export class TitleSelectErrorMessage extends ProtocolMessage {
	constructor(reason)
	{
		super(6366)
		this.reason = reason;
	}

	serialize() {
		this.buffer.writeByte(this.reason);
	}
}

export class AlignementRankUpdateMessage extends ProtocolMessage {
	constructor(rank, verbose) {
		super(6058);
		this.alignmentRank = rank;
		this.verbose = verbose;
	}

	serialize() {
		this.buffer.writeByte(this.alignmentRank);
		this.buffer.writeBoolean(this.verbose);
	}
}

export class SetEnablePVPRequestMessage extends ProtocolMessage {
	constructor(enable)
	{
		super(1810);
		this.enable = enable;
	}

	deserialize(buffer) {
		this.enable = buffer.readBoolean();
		Logger.debug(this.enable);
	}
}
