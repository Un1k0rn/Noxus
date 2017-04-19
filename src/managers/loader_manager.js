import Logger from "../io/logger"
import * as Messages from "../io/dofus/messages"
import * as Types from "../io/dofus/types"
import IO from "../io/custom_data_wrapper"
import Formatter from "../utils/formatter"
import DBManager from "../database/dbmanager"
import ConfigManager from "../utils/configmanager.js"
import WorldServer from "../network/world"
import AuthServer from "../network/auth"
import ChatChannel from "../enums/chat_activable_channels_enum"
import Character from "../database/models/character"
import AccountRole from "../enums/account_role_enum"
import Common from "../common"
import WorldManager from "../managers/world_manager"
import FriendHandler from "../handlers/friend_handler"

export default class LoaderManager {

    static LoadAccountData(client, callback)
    {
        try
        {
            client.account.friends = [];
            client.account.ignoredsList = [];

            DBManager.getFriends({accountId: client.account.uid}, function(friends){
                for (var i in friends) {
                    var friend = friends[i];

                    (function(tmp){
                        DBManager.getAccount({uid: tmp.friendAccountId}, function (account) {
                            if (account) {
                                    tmp.account = account;
                                    client.account.friends.push(tmp);
                            }
                        });
                    })(friend);
                }
                DBManager.getIgnoreds({accountId: client.account.uid}, function(ignoreds) {
                    for (var i in ignoreds)
                    {
                        var ignored = ignoreds[i];
                        (function(tmp2) {
                            DBManager.getAccount({uid: tmp2.ignoredAccountId}, function (account) {
                                if (account) {
                                    tmp2.account = account;
                                    client.account.ignoredsList.push(tmp2);
                                }
                            });
                        })(ignored);
                    }
                    Logger.infos("Account data successfully loaded for account " + client.account.username + " (" + client.account.uid + ")");
                    callback();
                });
            });
        }
        catch (error)
        {
            Logger.error("Can't load account data for " + client.account.username + ", error :" + error);
            client.close();
        }
    }

    static getFriendsOnline(client, callback)
    {
        var friendOnline = 0;
        if (client.account.friends)
        {
            for (var i in client.account.friends)
            {
                var character = WorldServer.getOnlineCharacterByAccountId(client.account.friends[i].friendAccountId);
                if (character)
                {
                    FriendHandler.sendFriendsList(character.client);
                    friendOnline++;
                }
            }
            callback(friendOnline);
            return;

        }
        callback(0);
        return;
    }

    static LoadCharacterData(client, callback)
    {
        LoaderManager.getFriendsOnline(client, function(online){
            client.character.friendsOnline = online;
            callback();
        });
    }

}
