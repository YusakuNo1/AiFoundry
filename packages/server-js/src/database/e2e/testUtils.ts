import * as fs from "fs";
import * as path from "path";
import { types } from "aifoundry-vscode-shared";
import AssetUtils from "../../utils/assetUtils";

export function removeDatabaseFile(databaseName: string) {
    const assetsPath = AssetUtils.getAssetsPath();
    const databaseFilePath = path.join(assetsPath, databaseName);
    if (fs.existsSync(databaseFilePath)) {
        fs.rmSync(databaseFilePath, { recursive: true });
    }
}
