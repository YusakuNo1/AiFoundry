import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';
import { consts } from 'aifoundry-vscode-shared';

namespace LaunchUtils {
    export function setupFolders() {
        const homedir = os.homedir();
        const localServerPath = `${homedir}/${consts.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME}`;
        const assetsPath = `${localServerPath}/${consts.ASSETS_FOLDER_NAME}`;
        
        // Create ~/.aifoundry folder
        if (!fs.existsSync(localServerPath)) {
            fs.mkdirSync(localServerPath);
        }

        // Create ~/.aifoundry/assets folder
        if (!fs.existsSync(assetsPath)) {
            fs.mkdirSync(assetsPath);
        }
    }

    // Install the required extensions for development only
    export function installDevExtensions() {
        async function install(extensionId: string) {
            try {
                await exec(`code --install-extension ${extensionId}`);
            } catch (error) {
                console.error(`Error installing extension ${extensionId}`);
            }
        }

        install('ms-python.debugpy');
        install('ms-toolsai.jupyter');
    }
}
export default LaunchUtils;
