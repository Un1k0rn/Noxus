require('colors');
import Common from "../common"

export default class Logger {

    static level = 0;

    static drawAscii() {
        var v = "ALPHA VERSION v" + Common.NOXUS_VERSION.major + "." + Common.NOXUS_VERSION.minor;
        console.log("    _   _                     ".cyan);
        console.log("   | \\ | |                    ".cyan);
        console.log("   |  \\| | _____  ___   _ ___ ".cyan);
        console.log("   | . ` |/ _ \\ \\/ / | | / __|".cyan + "    Emulator for Dofus 2.39".yellow);
        console.log("   | |\\  | (_) >  <| |_| \\__ \\".cyan + "    By Yuki, Arkalius and Yamisaaf".yellow);
        console.log("   \\_| \\_/\\___/_/\\_\\\\__,_|___/".cyan + "    " + v.red);
        console.log(" _________________________________________________________________ \n".yellow)
    }

    static log(color, header, message) {
        console.log("[" + header[color] + "]" + " : " + message.toString().white);
    }

    static infos(message) {
        Logger.log("green", "INFOS", message);
    }

    static error(message) {
        Logger.log("red", "ERROR", message);
    }

    static debug(message) {
        Logger.log("magenta", "DEBUG", message);
    }

    static network(message) {
        if(Logger.level == 0) Logger.log("cyan", "NETWORK", message);
    }

    static warning(message) {
        Logger.log("yellow", "WARNING", message);
    }

	static todo(message) {
		Logger.log("rainbow", "TODO", message);
	}
}
