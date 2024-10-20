import * as fs from 'fs';
import * as path from 'path';
import { api, database } from "aifoundry-vscode-shared";
import AssetUtils from '../utils/assetUtils';
import { HttpException } from '../exceptions';


class DatabaseManager {
    private _databaseFolderPath: string;

    constructor() {
    }

    public setup(databaseName: string) {
        try {
            this._setupDataSource(databaseName);
        } catch (error) {
            throw error;
        }
    }

    // Shared ------------------------------------------------------------------

    public saveDbEntity(dbEntity: database.BaseEntity): database.BaseEntity {
        const fileName = this._getDatabaseEntityFilePath(dbEntity.entityName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, JSON.stringify(content));
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }

        content[dbEntity.id] = dbEntity;
        fs.writeFileSync(fileName, JSON.stringify(content));
        return dbEntity;
    }

    public getDbEntity(dbName: string, id: string): database.BaseEntity | null {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            return null;
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            return content[id] ?? null;
        }
    }

    public deleteDbEntity(dbName: string, id: string): boolean {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            return false;
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            if (content[id]) {
                delete content[id];
                fs.writeFileSync(fileName, JSON.stringify(content));
            } else {
                return false;
            }
            return true;
        }
    }

    public listDbEntities(dbName: string): database.BaseEntity[] {
        const fileName = this._getDatabaseEntityFilePath(dbName);
        let content = {};
        if (!fs.existsSync(fileName)) {
            fs.writeFileSync(fileName, JSON.stringify(content));
        } else {
            content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }
        return Object.values(content);
    }

    // LmProvider --------------------------------------------------------------

    public listLmProviderInfo(): database.LmProviderEntity[] {
        return this.listDbEntities(database.LmProviderEntity.ENTITY_NAME) as database.LmProviderEntity[];
    }

    public getLmProviderInfo(providerId: string): database.LmProviderEntity | null {
        return this.getDbEntity(database.LmProviderEntity.ENTITY_NAME, providerId) as database.LmProviderEntity;
    }

    // Embeddings --------------------------------------------------------------

    public saveEmbeddingsMetadata(embeddingMetadata: database.EmbeddingEntity) {
        this.saveDbEntity(embeddingMetadata);
    }

    public listEmbeddingsMetadata() {
        return this.listDbEntities(database.EmbeddingEntity.name) as database.EmbeddingEntity[];
    }

    public getEmbeddingsMetadata(assetId: string): database.EmbeddingEntity | null {
        return this.getDbEntity(database.EmbeddingEntity.name, assetId) as database.EmbeddingEntity;
    }

    public deleteEmbeddingsMetadata(assetId: string) {
        return this.deleteDbEntity(database.EmbeddingEntity.name, assetId);
    }

    // Agents ------------------------------------------------------------------

    public listAgents() {
        return this.listDbEntities(database.AgentEntity.name) as database.AgentEntity[];
    }

    public getAgent(agentId: string): database.AgentEntity | null {
        return this.getDbEntity(database.AgentEntity.name, agentId) as database.AgentEntity;
    }

    public updateAgent(agentId: string, request: api.UpdateAgentRequest): database.AgentEntity {
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new HttpException(404, `Agent not found`);
        }

        agent.basemodelUri = request.basemodelUri || agent.basemodelUri;
        agent.name = request.name || agent.name;
        agent.systemPrompt = request.systemPrompt || agent.systemPrompt;
        agent.ragAssetIds = request.ragAssetIds || agent.ragAssetIds;
        agent.functionAssetIds = request.functionAssetIds || agent.functionAssetIds;
        return this.saveDbEntity(agent) as database.AgentEntity;
    }

    public deleteAgent(id: string) {
        return this.deleteDbEntity(database.AgentEntity.name, id);
    }

    // Chat --------------------------------------------------------------------

    public getChatHistory(sessionId: string): database.ChatHistoryEntity | null {
        return this.getDbEntity(database.ChatHistoryEntity.name, sessionId) as database.ChatHistoryEntity;
    }

    public addChatMessage(
        sessionId: string,
        aifAgentUri: string,
        role: api.ChatRole,
        content: database.ChatHistoryMessageContent,
        contentTextFormat: api.TextFormat,
    ) {
        let chatHistory = this.getChatHistory(sessionId);
        if (!chatHistory) {
            chatHistory = new database.ChatHistoryEntity(sessionId, aifAgentUri, []);
        }

        const chatHistoryMessage: database.ChatHistoryMessage = { role, content, contentTextFormat };
        (chatHistory.messages as database.ChatHistoryMessage[]).push(chatHistoryMessage);
        this.saveDbEntity(chatHistory);
    }


    // Private -----------------------------------------------------------------

    private _setupDataSource(databaseName: string) {
        const assetsPath = AssetUtils.getAssetsPath();
        this._databaseFolderPath = path.join(assetsPath, databaseName);

        // In solution for JSON based database, databaseName is the folder for all the json files
        if (!fs.existsSync(this._databaseFolderPath)) {
            fs.mkdirSync(this._databaseFolderPath, { recursive: true });
        }
    }

    private _getDatabaseEntityFilePath(dbName: string) {
        return path.join(this._databaseFolderPath, dbName + '.json');
    }
}

export default DatabaseManager;
