import AuthServer from "./network/auth"
import WorldServer from "./network/world"
import ConfigManager from "./utils/configmanager.js"
import Logger from "./io/logger"
import DBManager from "./database/dbmanager"
import Datacenter from "./database/datacenter"
import Common from "./common"

class App {

    constructor() {
        Logger.drawAscii();

         process.on('uncaughtException', function(error) {
            console.error((new Date).toUTCString() + ' uncaughtException:', error.message)
            console.error(error.stack);
        });

        ConfigManager.load(function() {
            DBManager.start(function(){
                Logger.infos("Trying to connect to MongoDB ..");
                Datacenter.load(function() {        
                    Logger.infos("Starting network services ..");
                    try
                    {
                        AuthServer.start(ConfigManager.configData.host, ConfigManager.configData.auth_port);
                        WorldServer.start(ConfigManager.configData.host, ConfigManager.configData.world_port);
                    }
                    finally {
                        Logger.infos("Server started successfully !");
                    }
                });
            })
            
        });
    }
}

var app = new App(); 
