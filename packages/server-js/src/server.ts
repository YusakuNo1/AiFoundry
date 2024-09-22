import * as express from "express";
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as cookieParser from "cookie-parser";
import * as controllers from './controllers';
import LmManager from './lm/LmManager';
import Config from './config';
import ServerUtils from "./utils/serverUtils";
import DatabaseManager from "./database/DatabaseManager";
// import ServerConfig from "./config/ServerConfig";

dotenv.config({
    path: `${os.homedir()}/.aifoundry/assets/.env`,
});

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
    controllers.agents.registerAdminRoutes(apiRouter, lmManager);

    app.use('/', apiRouter);

    app.listen(Config.SERVER_PORT, () => {
        console.log(`AI Foundry Server is running on port ${Config.SERVER_PORT}`);
    });
}

if (process.argv.length === 3 && process.argv[2] === "run") {
    setupServer();
}
