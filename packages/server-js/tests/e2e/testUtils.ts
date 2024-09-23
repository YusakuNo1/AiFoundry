import * as fs from "fs";
import * as path from "path";
import { types } from "aifoundry-vscode-shared";
import AssetUtils from "../../src/utils/assetUtils";

export function createAgentMetadata(id: string) {
    const agentMetadata = new types.database.AgentMetadata();
    agentMetadata.id = `${id}`;
    agentMetadata.name = `Mock agent name ${id}`;
    agentMetadata.agent_uri = `mock_agent_${id}_uri`;
    agentMetadata.system_prompt = `Mock system ${id} prompt`;
    agentMetadata.base_model_uri = `mock_base_model_${id}_uri`;
    agentMetadata.rag_asset_ids = ['1', '2'];
    agentMetadata.function_asset_ids = ['1', '2', '3'];
    return agentMetadata;
}

export function removeDatabaseFile(databaseName: string) {
    const assetsPath = AssetUtils.getAssetsPath();
    const databaseFilePath = path.join(assetsPath, databaseName);
    if (fs.existsSync(databaseFilePath)) {
        fs.rmSync(databaseFilePath);
    }
}
