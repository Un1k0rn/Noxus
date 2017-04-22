import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"

export class TitlesAndOrnamentsHandler {
	static handleTitlesAndOrnamentsListRequestMessage(client, packet)
	{
		client.send(new Messages.TitlesAndOrnamentsListMessage(
			client.character.titles,
			client.character.ornaments,
			client.character.currentTitle,
			client.character.currentOrnament));
		}
}
