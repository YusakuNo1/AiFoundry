import * as path from 'path';
import { DataSource } from "typeorm";
import { types } from "aifoundry-vscode-shared";
import Config from '../config';
import AssetUtils from '../utils/assetUtils';


class DatabaseManager {
    private _dataSource!: DataSource;

    constructor() {
    }

    public async setup(databaseName: string) {
        try {
            await this._setupDataSource(databaseName);
        } catch (error) {
            throw error;
        }
    }

    // Shared ------------------------------------------------------------------

    public async saveDbModel(dbModel: types.database.IEntity) {
        return this._dataSource.manager.save(dbModel);
    }

    // Embeddings --------------------------------------------------------------

    public async listEmbeddingsMetadata() {
        return this._dataSource.manager.find(types.database.EmbeddingMetadata);
    }

    public async loadEmbeddingsMetadata(assetId: string) {
        return this._dataSource.manager.findOneBy(types.database.EmbeddingMetadata, { id: assetId });
    }

    public async deleteEmbeddingsMetadata(assetId: string) {
        this._dataSource.manager.delete(types.database.EmbeddingMetadata, { id: assetId });
    }

    // Agents ------------------------------------------------------------------

    public async listAgents() {
        return this._dataSource.manager.find(types.database.AgentMetadata);
    }

    public async updateAgent(agentId: string, request: types.api.UpdateAgentRequest) {
        // const agent = this._dataSource.manager.findOne(AgentMetadata, { id: agentId });
        // if (!agent) {
        //     throw new Error(`Agent with id ${agentId} not found`);
        // }

        // agent.base_model_uri = request.base_model_uri || agent.base_model_uri;
        // agent.name = request.name || agent.name;
        // agent.system_prompt = request.system_prompt || agent.system_prompt;
        // agent.rag_asset_ids = request.rag_asset_ids || agent.rag_asset_ids;
        // agent.function_asset_ids = request.function_asset_ids || agent.function_asset_ids;

        // this._dataSource.manager.save(agent);
    }

    public deleteAgent(id: string) {
        this._dataSource.manager.delete(types.database.AgentMetadata, { id });
    }

    // Private -----------------------------------------------------------------

    private async _setupDataSource(databaseName: string) {
        const assetsPath = AssetUtils.getAssetsPath();
        const databaseFilePath = path.join(assetsPath, databaseName);
        // const databaseFilePath = path.join(assetsPath, "db.sqlite3");     // TODO: only for testing

        this._dataSource = new DataSource({
            type: 'sqlite',
            database: databaseFilePath,
            synchronize: true, // Set to false in production
            logging: true,
            entities: [
                types.database.AgentMetadata,
                types.database.ChatHistory,
                types.database.EmbeddingMetadata,
                types.database.FunctionMetadata,
            ],
            migrations: [
                // List of your migration classes here
            ],
        });
        
        return this._dataSource.initialize();
    }


//     def add_chat_message(self, aif_agent_uri: str, id: str, role: ChatRole, content: str):
//         with Session(self._engine) as session:
//             chat_history = session.get(ChatHistory, id)
//             if chat_history is None:
//                 chat_history = ChatHistory(id=id, aif_agent_uri=aif_agent_uri, messages="[]")
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
