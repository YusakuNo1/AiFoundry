import * as os from 'os';
import Config from '../config';
import ServerConfig from '../config/ServerConfig';
import * as path from 'path';


namespace AssetUtils {
    export function getAssetsPath(): string {
        const homedir = os.homedir();
        const projectFolder = ServerConfig.useLocalServer ? Config.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME : ""
        return path.join(homedir, projectFolder, Config.ASSETS_FOLDER_NAME);
    }

    export function getFunctionsAssetPath() {
        return path.join(getAssetsPath(), Config.FUNCTIONS_FOLDER_NAME);
    }

    export function getEmbeddingsAssetPath() {
        return path.join(getAssetsPath(), Config.EMBEDDINGS_FOLDER_NAME);
    }
}

export default AssetUtils;
