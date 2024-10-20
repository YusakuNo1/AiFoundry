import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as controllers from './controllers';
import LmManager from './lm/LmManager';
import Config from './config';
import DatabaseManager from "./database/DatabaseManager";


// dotenv.config({
//     path: `${os.homedir()}/.aifoundry/assets/.env`,
// });

export async function setupServer() {
    // ServerConfig.setup(ServerUtils.getArgs());
    // const args = ServerUtils.getArgs();
    const args = {
        localserver: true,
    }

    const app = express();
    const apiRouter = express.Router();
    app.use(cookieParser());

    try {
        const databaseManager = new DatabaseManager();
        await databaseManager.setup(Config.SQLITE_FOLDER_NAME);
        const lmManager = new LmManager(databaseManager);
        await lmManager.init();
        
        controllers.system.registerRoutes(apiRouter, lmManager);
        controllers.chat.registerRoutes(apiRouter, lmManager);
        controllers.agents.registerAdminRoutes(apiRouter, lmManager);
        controllers.embeddings.registerAdminRoutes(apiRouter, lmManager);
        controllers.languagemodels.registerAdminRoutes(apiRouter, lmManager);

        app.use('/', apiRouter);
    
        app.listen(Config.SERVER_PORT, () => {
            console.log(`AI Foundry Server is running on port ${Config.SERVER_PORT}`);
        });    
    } catch (error) {
        console.error('Server setup error:', error);
    }
}

if (process.argv.length === 3 && process.argv[2] === "run") {
    setupServer();
}
