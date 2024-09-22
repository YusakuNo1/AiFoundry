import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as controllers from './controllers';
import LmManager from './lm/LmManager';
import Config from './config';
import ServerUtils from "./utils/serverUtils";
import DatabaseManager from "./database/DatabaseManager";
// import ServerConfig from "./config/ServerConfig";

export function setupServer() {
    // ServerConfig.setup(ServerUtils.getArgs());
    // const args = ServerUtils.getArgs();
    const args = {
        localserver: true,
    }

    const app = express();
    const apiRouter = express.Router();
    app.use(cookieParser());

    const databaseManager = new DatabaseManager(args.localserver);
    const lmManager = new LmManager(databaseManager);
    controllers.system.registerRoutes(apiRouter, lmManager);
    controllers.chat.registerRoutes(apiRouter, lmManager);
    app.use('/', apiRouter);

    app.listen(Config.SERVER_PORT, () => {
        console.log(`AI Foundry Server is running on port ${Config.SERVER_PORT}`);
    });
}

if (process.argv.length === 3 && process.argv[2] === "run") {
    setupServer();
}
