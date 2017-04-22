import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"

export default class TitlesAndOrnamentsHandler {
	static handleTitlesAndOrnamentsListRequestMessage(client, packet)
	{
		Logger.debug("Titles : " + client.character.titles.toString());
		Logger.debug("Ornaments : " + client.character.ornaments.toString());
		Logger.debug("currentTitle : " + client.character.activeTitle);
		Logger.debug("currentOrnament : " + client.character.activeOrnament);

		client.send(new Messages.TitlesAndOrnamentsListMessage(
			client.character.titles,
			client.character.ornaments,
			client.character.activeTitle,
			client.character.activeOrnament));
	}

	static handleTitleSelectRequestMessage(client, packet) {
		var titleId = packet.titleId;
		var success = client.character.selectTitle(titleId);
		if(success)
			client.send(new Messages.TitleSelectMessage(titleId));
		else {
			client.send(new Messages.TitleSelectErrorMessage("Wrong title id"));
		}
	}
}
