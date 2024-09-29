import * as path from 'path';
import { Observable } from 'rxjs';
import { v4 as uuid } from "uuid";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import { AifUtils, consts, types } from 'aifoundry-vscode-shared';
import ILmProvider from './ILmProvider';
import ILmManager from './ILmManager';
import DatabaseManager from '../database/DatabaseManager';
import { runLm, runEmbedding } from '../lm/LmProviderTmpAzureOpenAI';
import { HttpException } from '../exceptions';
import AssetUtils from '../utils/assetUtils';
import LmProviderAzureOpenAI from './LmProviderAzureOpenAI';
import LmManagerUtils from './LmManagerUtils';
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
        this._loadDocFromVectorStore = this._loadDocFromVectorStore.bind(this);

        this._lmProviderMap[LmProviderAzureOpenAI.ID] = new LmProviderAzureOpenAI(databaseManager);
        // this._lmProviderMap[LmProviderOllama.ID] = new LmProviderOllama(databaseManager);
    }

// 	async def chat(self,
//         request: CreateChatRequest,
//         aifSessionId: str,
//         aifAgentUri: str,
//   ) -> AsyncIterable[str]:
//       try:
//           request_info = process_aif_agent_uri(self.database_manager, aifAgentUri, request.systemPrompt)

//           runnable = self._get_chat_runnable(
//               input=request.input,
//               aifSessionId=aifSessionId,
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

//               self.database_manager.add_chat_message(id=aifSessionId, aifAgentUri=aifAgentUri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aifSessionId, aifAgentUri=aifAgentUri, role=ChatRole.ASSISTANT, content=response)
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

//               self.database_manager.add_chat_message(id=aifSessionId, aifAgentUri=aifAgentUri, role=ChatRole.USER, content=request.input)
//               self.database_manager.add_chat_message(id=aifSessionId, aifAgentUri=aifAgentUri, role=ChatRole.ASSISTANT, content=response)

//       except Exception as e:
//           if isinstance(e, HTTPException):
//               yield e.detail
//           elif isinstance(e, ValueError):
//               yield str(e)
//           else:
//               yield "Sorry, something went wrong"

    public chat(
        aifSessionId: string,
        aifAgentUri: string,
        outputFormat: types.api.TextFormat,
        input: string,
        files: types.UploadFileInfo[],
    ): Observable<string> {
        async function test() {
            try {
                const embeddingResponse = await runEmbedding(input);
                console.log(`Embedding response: ${embeddingResponse}`);    

                const chatResponse = await runLm(input);
                console.log(`Chat response: ${chatResponse}`);
            } catch (error) {
                console.error(error);
            }
        }
        // test();


        
        const agentId = AifUtils.getAgentId(aifAgentUri);
        if (!agentId) {
            throw new HttpException(400, "Invalid agent uri");
        }

        const agentMetadata = this.databaseManager.getAgent(agentId);
        if (!agentMetadata) {
            throw new HttpException(404, "Agent not found");
        }
        const llm = this._getBaseChatModel(agentMetadata.basemodelUri);

        const docPromises = agentMetadata.ragAssetIds.map((assetId) => this._loadDocFromVectorStore(input, assetId));
        const vectorStorePromises = agentMetadata.ragAssetIds.map((assetId) => this._getVectorStore(assetId));
        
        

        const systemPrompt = `
Answer the question only based on the given context. Do not add any additional information. Answer in a short sentence.
        
Context: {context}
`;
        const prompt = ChatPromptTemplate.fromMessages([
            // ["human", "Tell me a short joke about {input}"],
            ["system", systemPrompt],
            ["human", "{question}"],
        ]);
        const outputParser = new StringOutputParser();
          
        return new Observable<string>((subscriber) => {
            async function run() {
                const vectorStores = await Promise.all(vectorStorePromises);
                const vectorStore = vectorStores[0];
                const retriever = vectorStore.asRetriever(1);
                const doc = await vectorStore.similaritySearch(input, 1);
                const docs = await Promise.all(docPromises);
                const docContents = docs.map((doc) => doc[0].pageContent);


                // const setupAndRetrieval = RunnableMap.from({
                //     context: new RunnableLambda({
                //         func: (input: string) => {
                //             return docContents.join("\n");
                //             // return doc[0].pageContent;
                //             // return retriever.invoke(input).then((response) => {
                //             //     return response[0].pageContent;
                //             // })
                //         },
                //     }).withConfig({ runName: "contextRetriever" }),
                //     question: new RunnablePassthrough(),
                // });
                // const chain = setupAndRetrieval.pipe(prompt).pipe(llm).pipe(outputParser);


                const ragRunnable = RunnableMap.from({
                    context: new RunnableLambda({
                        func: () => {
                            return docContents.join("\n");
                        },
                    }).withConfig({ runName: "contextRetriever" }),
                    question: new RunnablePassthrough(),
                });
                const chain = ragRunnable.pipe(prompt).pipe(llm).pipe(outputParser);




                // const ragRunnable = RunnableMap.from({
                //     context: new RunnableLambda({
                //         func: () => {
                //             return Promise.all(vectorStorePromises).then(vectorStores => vectorStores.map(vectorStore => vectorStore.similaritySearch(input, 1))).then(docs) docContents.join("\n");
                //         },
                //     }).withConfig({ runName: "contextRetriever" }),
                //     question: new RunnablePassthrough(),
                // });
                // const chain = ragRunnable.pipe(prompt).pipe(llm).pipe(outputParser);



                const response = await chain.invoke(input);

                subscriber.next(response);
                subscriber.complete();
            }

            run().catch((ex) => {
                // As the streaming started, we can only send error message but not send it as an error to subscriber
                subscriber.next(`Error: ${ex}`);
                subscriber.complete();
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
            request.basemodelUri ?? "",
            request.systemPrompt ?? "",
            request.ragAssetIds ?? [],
            request.functionAssetIds ?? []
        );
        this.databaseManager.saveDbEntity(agent);
        return { id: agent.id, uri: agent.agentUri };
    }

    public updateAgent(id: string, request: types.api.UpdateAgentRequest): types.api.CreateOrUpdateAgentResponse {
        if (!id) {
            throw new HttpException(400, "Agent id is required");
        }
        const agent = this.databaseManager.updateAgent(id, request);
        return { id: agent.id, uri: agent.agentUri };
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

        const llm = this._getBaseEmbeddingsModel(afBaseModelUri);
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

        const llm = this._getBaseEmbeddingsModel(embeddingMetadata.basemodelUri);
        return AssetUtils.updateEmbeddings(this.databaseManager, llm, embeddingMetadata, files, name);
    }

    private _getBaseEmbeddingsModel(aifUri: string): Embeddings {
        for (const lmProvider of Object.values(this._lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseEmbeddingsModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    private _getBaseChatModel(aifUri: string): BaseChatModel {
        for (const lmProvider of Object.values(this._lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseLanguageModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    private async _loadDocFromVectorStore(
        input: string,
        embeddingId: string,
    ) {
        const embeddingMetadata = this.databaseManager.getEmbeddingsMetadata(embeddingId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = this._getBaseEmbeddingsModel(embeddingMetadata.basemodelUri);

        const assetsPath = AssetUtils.getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingId);
        const vectorStore = await FaissStore.load(storePath, llm);
        const document = await vectorStore.similaritySearch(input, 1);
        return document;
    }

    private async _getVectorStore(
        embeddingId: string,
    ) {
        const embeddingMetadata = this.databaseManager.getEmbeddingsMetadata(embeddingId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = this._getBaseEmbeddingsModel(embeddingMetadata.basemodelUri);

        const assetsPath = AssetUtils.getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingId);
        const vectorStore = await FaissStore.load(storePath, llm);
        return vectorStore;
    }
}

export default LmManager;
