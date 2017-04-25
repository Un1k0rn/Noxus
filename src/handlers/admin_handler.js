import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import PlayableBreedEnum from "../enums/playable_breed_enum"
import Character from "../database/models/character"
import WorldManager from "../managers/world_manager"
import AccountRole from "../enums/account_role_enum"
import Pathfinding from "../game/pathfinding/pathfinding"

export default class AdminHandler {

    static handleAdminQuietCommandMessage(client, packet)
    {
        if (client.account.scope < AccountRole.ANIMATOR.value)
            return;
        var data = packet.content.split(" ");
        switch (data[0])
        {
            case "moveto":
                WorldManager.teleportClient(client, data[1], client.character.cellid, function(result) {
                    if (!result) {
                        client.character.replyError("Impossible de vous téléporter sur cette carte !");
                        return;
                    }
                    var cells = client.character.getMap().cells;

                    if (!cells[client.character.cellid]._mov) {
                        var newCell = Pathfinding.findClosestWalkableCell(client);

                        if (newCell != 0 && cells[newCell]._mov) {
                            WorldManager.teleportClient(client, client.character.getMap()._id, newCell, function(){
                            });
                        }
                    }
            });
            break;
        }
    }

}
