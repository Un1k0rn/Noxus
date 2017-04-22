import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"

export default class TitlesAndOrnamentsHandler {
	static handleTitlesAndOrnamentsListRequestMessage(client, packet)
	{
		client.send(new Messages.TitlesAndOrnamentsListMessage(
			client.character.titles,
			client.character.ornaments,
			client.character.activeTitle,
			client.character.activeOrnament));
	}

	static handleTitleSelectRequestMessage(client, packet) {
		var titleId = packet.titleId;
		var success = client.character.selectTitle(titleId);
		if(success) {
			client.send(new Messages.TitleSelectMessage(titleId));
		}
		else {
			client.send(new Messages.TitleSelectErrorMessage("Wrong title id"));
		}
	}

	static handleOrnamentSelectRequestMessage(client, packet) {
		var ornamentId = packet.ornamentId;
		var success = client.character.selectOrnament(ornamentId);
		if(success) {
			client.send(new Messages.OrnamentSelectMessage(ornamentId));
		}
		else {
			client.send(new Messages.OrnamentSelectErrorMessage("Wrong ornament id"));
		}
	}
}
