import Config from '../config';

namespace AssetUtils {
//     def get_assets_path() -> str:
//     projectFolder = AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME if serverConfig.useLocalServer else ""
//     return os.path.join(expanduser("~"), projectFolder, ASSETS_FOLDER_NAME)

    export function getAssetsPath(useLocalServer: boolean): string {
        // return `${Config.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME}/.aifoundry/assets`;
        throw new Error("Not implemented");
    }


// def get_functions_asset_path() -> str:
//     return os.path.join(get_assets_path(), FUNCTIONS_FOLDER_NAME)


// def get_embeddings_asset_path() -> str:
//     return os.path.join(get_assets_path(), EMBEDDINGS_FOLDER_NAME)
}

export default AssetUtils;
