import * as fs from 'fs';
import * as path from 'path';
import { types } from "aifoundry-vscode-shared";
import Config from '../config';
import { LmProviderCredentials } from './entities/LmProviderCredentials';
import { LmProviderInfo } from './entities/LmProviderInfo';
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

    public saveDbEntity(dbEntity: types.database.BaseEntity): types.database.BaseEntity {
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

    public getDbEntity(dbName: string, id: string): types.database.BaseEntity | null {
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

    public listDbEntities(dbName: string): types.database.BaseEntity[] {
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

    public getLmProviderCredentials(providerId: string): LmProviderCredentials | null {
        const lmProviderCredentials = this.getDbEntity(LmProviderCredentials.ENTITY_NAME, providerId) as LmProviderCredentials;

        if (!lmProviderCredentials) {
            return null;
        } else if (!lmProviderCredentials.id || !lmProviderCredentials.apiKey) {
            throw new HttpException(400, "Invalid credentials");
        } else {
            return {
                ...lmProviderCredentials,
                properties: lmProviderCredentials.properties ?? {},
            } as LmProviderCredentials;
        }
    }

    public saveLmProviderCredentials(providerId: string, apiKey: string, properties: Record<string, string>): void {
        const oldLmProviderCredentials = this.getLmProviderCredentials(providerId);
        const lmProviderCredentials = oldLmProviderCredentials ?? new LmProviderCredentials(
            providerId,
            apiKey,
            properties,
        );
        this.saveDbEntity(lmProviderCredentials);
    }

    public listLmProviderInfo(): LmProviderInfo[] {
        return this.listDbEntities(LmProviderInfo.ENTITY_NAME) as LmProviderInfo[];
    }

    public getLmProviderInfo(providerId: string): LmProviderInfo | null {
        return this.getDbEntity(LmProviderInfo.ENTITY_NAME, providerId) as LmProviderInfo;
    }

    public saveLmProviderInfo(
        providerId: string,
        defaultWeight: number,
        selectedEmbeddingModels: string[],
        selectedVisionModels: string[],
        selectedToolsModels: string[],
    ): void {
        const lmProviderInfo = new LmProviderInfo(
            providerId,
            defaultWeight,
            selectedEmbeddingModels,
            selectedVisionModels,
            selectedToolsModels,
        );
        this.saveDbEntity(lmProviderInfo);
    }

    // Embeddings --------------------------------------------------------------

    public saveEmbeddingsMetadata(embeddingMetadata: types.database.EmbeddingMetadata) {
        this.saveDbEntity(embeddingMetadata);
    }

    public listEmbeddingsMetadata() {
        return this.listDbEntities(types.database.EmbeddingMetadata.name) as types.database.EmbeddingMetadata[];
    }

    public getEmbeddingsMetadata(assetId: string): types.database.EmbeddingMetadata | null {
        return this.getDbEntity(types.database.EmbeddingMetadata.name, assetId) as types.database.EmbeddingMetadata;
    }

    public deleteEmbeddingsMetadata(assetId: string) {
        return this.deleteDbEntity(types.database.EmbeddingMetadata.name, assetId);
    }

    // Agents ------------------------------------------------------------------

    public listAgents() {
        return this.listDbEntities(types.database.AgentMetadata.name) as types.database.AgentMetadata[];
    }

    public getAgent(agentId: string): types.database.AgentMetadata | null {
        return this.getDbEntity(types.database.AgentMetadata.name, agentId) as types.database.AgentMetadata;
    }

    public updateAgent(agentId: string, request: types.api.UpdateAgentRequest): types.database.AgentMetadata {
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new HttpException(404, `Agent not found`);
        }

        agent.basemodelUri = request.basemodelUri || agent.basemodelUri;
        agent.name = request.name || agent.name;
        agent.systemPrompt = request.systemPrompt || agent.systemPrompt;
        agent.ragAssetIds = request.ragAssetIds || agent.ragAssetIds;
        agent.functionAssetIds = request.functionAssetIds || agent.functionAssetIds;
        return this.saveDbEntity(agent) as types.database.AgentMetadata;
    }

    public deleteAgent(id: string) {
        return this.deleteDbEntity(types.database.AgentMetadata.name, id);
    }

    // Chat --------------------------------------------------------------------

    public getChatHistory(sessionId: string): types.database.ChatHistory | null {
        return this.getDbEntity(types.database.ChatHistory.name, sessionId) as types.database.ChatHistory;
    }

    public addChatMessage(
        sessionId: string,
        aifAgentUri: string,
        role: types.api.ChatRole,
        content: string,
        contentTextFormat: types.api.TextFormat,
        files: types.UploadFileInfo[] = [],
    ) {
        let chatHistory = this.getChatHistory(sessionId);
        if (!chatHistory) {
            chatHistory = new types.database.ChatHistory(sessionId, aifAgentUri, []);
        }

        const chatHistoryMessage: types.database.ChatHistoryMessage = {
            role: role,
            content: content,
            contentTextFormat,
            files: files,
        };
        (chatHistory.messages as types.database.ChatHistoryMessage[]).push(chatHistoryMessage);
        this.saveDbEntity(chatHistory);
    }


    // Private -----------------------------------------------------------------

    private _setupDataSource(databaseName: string) {
        const assetsPath = AssetUtils.getAssetsPath();
        this._databaseFolderPath = path.join(assetsPath, databaseName);
        // this._databaseFolderPath = path.join(assetsPath, "db.sqlite3");     // TODO: only for testing

        // In solution for JSON based database, databaseName is the folder for all the json files
        if (!fs.existsSync(this._databaseFolderPath)) {
            fs.mkdirSync(this._databaseFolderPath, { recursive: true });
        }
    }

    private _getDatabaseEntityFilePath(dbName: string) {
        return path.join(this._databaseFolderPath, dbName + '.json');
    }

//     def add_chat_message(self, aifAgentUri: str, id: str, role: ChatRole, content: str):
//         with Session(self._engine) as session:
//             chat_history = session.get(ChatHistory, id)
//             if chat_history is None:
//                 chat_history = ChatHistory(id=id, aifAgentUri=aifAgentUri, messages="[]")
//                 session.add(chat_history)

//             messages_json = json.loads(chat_history.messages) if chat_history.messages else []
//             messages_json.append({
//                 "role": role.name,
//                 "content": content,
//             })

//             chat_history.messages = json.dumps(messages_json)
//             session.commit()


//     def get_chat_history(self, id: str) -> List[ChatHistoryMessage] | None:
//         with Session(self._engine) as session:
//             return session.get(ChatHistory, id)


//     def get_chat_history_messages(self, id: str) -> List[ChatHistoryMessage] | None:
//         with Session(self._engine) as session:
//             chat_history = session.get(ChatHistory, id)
//             if chat_history is None:
//                 return None

//             messages_json = json.loads(chat_history.messages) if chat_history.messages else []
//             messages = []
//             for message in messages_json:
//                 messages.append(ChatHistoryMessage(**message))
//             return messages


//     def delete_chat_history(self, id: str):
//         with Session(self._engine) as session:
//             chat_history = session.get(ChatHistory, id)
//             if chat_history is not None:
//                 session.delete(chat_history)
//                 session.commit()


//     def list_functions(self) -> List[FunctionMetadata]:
//         with Session(self._engine) as session:
//             return session.query(FunctionMetadata).all()


//     def get_function(self, id: str) -> FunctionMetadata | None:
//         with Session(self._engine) as session:
//             return session.get(FunctionMetadata, id)


//     def update_function(self, request: UpdateFunctionRequest) -> CreateOrUpdateFunctionResponse:
//         with Session(self._engine) as session:
//             function = session.get(FunctionMetadata, request.id)
//             if function is None:
//                 raise HTTPException(status_code=404, detail=f"Function with id {request.id} not found")

//             function.name = request.name if request.name else function.name
//             session.commit()
//             return CreateOrUpdateFunctionResponse(
//                 id=function.id,
//                 uri=function.uri,
//                 name=function.name,
//                 functions_path=function.functions_path,
//                 functions_name=function.functions_name,
//             )


//     def delete_function(self, id: str):
//         with Session(self._engine) as session:
//             function = session.get(FunctionMetadata, id)
//             if function is None:
//                 raise HTTPException(status_code=404, detail=f"Function with id {id} not found")

//             session.delete(function)
//             session.commit()
//             return DeleteFunctionResponse(id=id)
}

export default DatabaseManager;
