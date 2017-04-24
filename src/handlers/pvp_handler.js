import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"

export default class PvPHandler {
	static handleSetEnablePVPRequestMessage(client, packet) {
		client.character.aggressable = packet.enable;
		client.character.updateAlignmentInformations();
	}
}
