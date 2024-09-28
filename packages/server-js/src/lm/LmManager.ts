import { Observable } from 'rxjs';
import { v4 as uuid } from "uuid";
import { AifUtils, consts, types } from 'aifoundry-vscode-shared';
import ILmProvider from './ILmProvider';
import ILmManager from './ILmManager';
import DatabaseManager from '../database/DatabaseManager';
import { runLm, runEmbedding } from '../lm/LmProviderTmpAzureOpenAI';
import { HttpException } from '../exceptions';
import { Embeddings } from '@langchain/core/embeddings';
import AssetUtils from '../utils/assetUtils';
import LmProviderAzureOpenAI from './LmProviderAzureOpenAI';
// import LmProviderOllama from './LmProviderOllama';


class LmManager implements ILmManager {
    private _lmProviderMap: Record<string, ILmProvider> = {};

    constructor(private databaseManager: DatabaseManager) {
        this.listAgents = this.listAgents.bind(this);
        this.createAgent = this.createAgent.bind(this);
        this.updateAgent = this.updateAgent.bind(this);
        this.chat = this.chat.bind(this);
        this.listEmbeddings = this.listEmbeddings.bind(this);
        this.createEmbedding = this.createEmbedding.bind(this);
        this.updateEmbedding = this.updateEmbedding.bind(this);

        this._lmProviderMap[LmProviderAzureOpenAI.ID] = new LmProviderAzureOpenAI(databaseManager);
        // this._lmProviderMap[LmProviderOllama.ID] = new LmProviderOllama(databaseManager);
    }

// 	async def chat(self,
//         request: CreateChatRequest,
//         aif_session_id: str,
//         aif_agent_uri: str,
//   ) -> AsyncIterable[str]:
//       try:
//           request_info = process_aif_agent_uri(self.database_manager, aif_agent_uri, request.system_prompt)

//           runnable = self._get_chat_runnable(
//               input=request.input,
//               aif_session_id=aif_session_id,
//               request_info=request_info,
//               outputFormat=request.outputFormat,
//           )

//           # if request_info has functions, invoke the request and wait for the response because LM may send back a tool call
//           if not request_info.functions:
//               response = ""

//               # iterable = runnable.astream(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
//               iterable = runnable.astream(request.input)
//               async for chunk in iterable:
//                   response = response + chunk.content
//                   yield chunk.content

//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)
//           else:
//               # For function calling, we need the full response to process the tools
//               # invoke_result = runnable.invoke(request.input, config={"callbacks": [DebugPromptHandler()]})	# for debugging
//               invoke_result = runnable.invoke(request.input)

//               response = ""
//               # Special case from Anthropic response: invoke_result.content is a list, find the content from the first item
//               if type(invoke_result.content) == list and len(invoke_result.content) > 0:
//                   responseText = invoke_result.content[0]["text"]
//               elif invoke_result.content:
//                   responseText = invoke_result.content
//               else:
//                   responseText = ""

//               if len(responseText) > 0:
//                   response += responseText
//                   yield responseText + RESPONSE_LINEBREAK + RESPONSE_LINEBREAK

//               tool_result = processToolsResponse(invoke_result, request_info.functions)
//               if type(tool_result) != str:
//                   raise HTTPException(status_code=400, detail="Tool response should be a string")
//               response += tool_result
//               yield tool_result

//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aif_session_id, aif_agent_uri=aif_agent_uri, role=ChatRole.ASSISTANT, content=response)

//       except Exception as e:
//           if isinstance(e, HTTPException):
//               yield e.detail
//           elif isinstance(e, ValueError):
//               yield str(e)
//           else:
//               yield "Sorry, something went wrong"

    public chat(
        aif_session_id: string,
        aif_agent_uri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        requestFileInfoList: types.api.ChatHistoryMessageFile[],
    ): Observable<string> {
        // const lmProvider = this._lmProviderMap[aif_agent_uri];
        // if (!lmProvider) {
        //     throw new Error(`No LM provider found for aif_agent_uri: ${aif_agent_uri}`);
        // }

        runEmbedding(input).then(reponse => {
            console.log(`Embedding response: ${reponse}`);
        });


        // return lmProvider.chat(request, aif_session_id);
        return new Observable<string>((subscriber) => {
            runLm(input).then(reponse => {
                subscriber.next(reponse as any);
                subscriber.complete();
            }).catch(err => {
                subscriber.error(err);
            });
        });
    }

    public listAgents(): types.api.ListAgentsResponse {
        const agents = this.databaseManager.listAgents();
        return { agents };
    }

    public createAgent(request: types.api.CreateAgentRequest): types.api.CreateOrUpdateAgentResponse {
        const uuidValue = uuid();
        const agentUri = AifUtils.createAifAgentUri(uuidValue);
        const agent = new types.database.AgentMetadata(
            uuidValue,
            request.name || uuidValue,
            agentUri,
            request.base_model_uri,
            request.system_prompt || "",
            request.rag_asset_ids || [],
            request.function_asset_ids || []
        );
        this.databaseManager.saveDbEntity(agent);
        return { id: agent.id, uri: agent.agent_uri };
    }

    public updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse {
        if (!id) {
            throw new HttpException(400, "Agent id is required");
        }
        const agent = this.databaseManager.updateAgent(id, request);
        return { id: agent.id, uri: agent.agent_uri };
    }

    public deleteAgent(id: string): void {
        this.databaseManager.deleteAgent(id);
    }

    public listEmbeddings(): types.api.ListEmbeddingsResponse {
        const embeddings = this.databaseManager.listEmbeddingsMetadata();
        return { embeddings };
    }

    public async createEmbedding(
        afBaseModelUri: string | undefined,
        files: types.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        if (!afBaseModelUri || afBaseModelUri.length === 0 || !files || files.length === 0) {
            throw new HttpException(400, "afBaseModelUri and files are required");
        }

        const llm = this._getEmbeddingLanguageModel(afBaseModelUri);
        if (!llm) {
            throw new HttpException(400, "No language model found for the given uri");
        }

        return AssetUtils.createEmbeddings(this.databaseManager, llm, afBaseModelUri, files, name);
    }

    public async updateEmbedding(
        aifEmbeddingAssetId: string | undefined,
        files: types.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        if (!aifEmbeddingAssetId || aifEmbeddingAssetId.length === 0) {
            throw new HttpException(400, "Embedding id is required");
        }

        const embeddingMetadata = this.databaseManager.getEmbeddingsMetadata(aifEmbeddingAssetId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = this._getEmbeddingLanguageModel(embeddingMetadata.basemodel_uri);
        if (!llm) {
            throw new HttpException(400, "No language model found for the given uri");
        }

        return AssetUtils.updateEmbeddings(this.databaseManager, llm, embeddingMetadata, files, name);
    }

    private _getEmbeddingLanguageModel(aifUri: string): Embeddings | null {
        for (const lmProvider of Object.values(this._lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseEmbeddingsModel(aifUri);
            }
        }

        return null;
    }
}

export default LmManager;
