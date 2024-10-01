import * as path from 'path';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Embeddings } from '@langchain/core/embeddings';
import { AIMessage, BaseMessage, HumanMessage, MessageContentComplex, SystemMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import { types } from "aifoundry-vscode-shared";
import ILmProvider from './ILmProvider';
import DatabaseManager from "../database/DatabaseManager";
import { HttpException } from '../exceptions';
import AssetUtils from '../utils/assetUtils';

namespace LmManagerUtils {
    export function getBaseEmbeddingsModel(
        lmProviderMap: Record<string, ILmProvider>,
        aifUri: string,
    ): Embeddings {
        for (const lmProvider of Object.values(lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseEmbeddingsModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    export function getBaseChatModel(
        lmProviderMap: Record<string, ILmProvider>,
        aifUri: string,
    ): BaseChatModel {
        for (const lmProvider of Object.values(lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseLanguageModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    export async function loadDocFromVectorStore(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, ILmProvider>,
        input: string,
        embeddingId: string,
    ) {
        const embeddingMetadata = databaseManager.getEmbeddingsMetadata(embeddingId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = getBaseEmbeddingsModel(lmProviderMap, embeddingMetadata.basemodelUri);

        const assetsPath = AssetUtils.getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingId);
        const vectorStore = await FaissStore.load(storePath, llm);
        const document = await vectorStore.similaritySearch(input, 1);
        return document;
    }

    export function getChain(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, ILmProvider>,
        aifSessionId: string,
        agentId: string,
        input: string,
        files: types.UploadFileInfo[],
        outputFormat: types.api.TextFormat,
    ) {
        const agentMetadata = databaseManager.getAgent(agentId);
        if (!agentMetadata) {
            throw new HttpException(404, "Agent not found");
        }

        const llm = LmManagerUtils.getBaseChatModel(lmProviderMap, agentMetadata.basemodelUri);
        const hasRAG = agentMetadata.ragAssetIds.length > 0;
        const prompt = _getPrompt(databaseManager, aifSessionId, agentMetadata, input, files, outputFormat);
        const outputParser = new StringOutputParser();

        if (hasRAG) {
            const docPromises = agentMetadata.ragAssetIds.map((assetId) => LmManagerUtils.loadDocFromVectorStore(databaseManager, lmProviderMap, input, assetId));
            const ragRunnable = RunnableMap.from({
                context: new RunnableLambda({
                    func: async () => {
                        const docs = await Promise.all(docPromises);
                        const docContents = docs.map((doc) => doc[0].pageContent);
                        return docContents.join("\n");
                    },
                }).withConfig({ runName: "contextRetriever" }),
                question: new RunnablePassthrough(),
            });
            return ragRunnable.pipe(prompt).pipe(llm).pipe(outputParser);
        } else {
            return prompt.pipe(llm).pipe(outputParser);
        }
    }

    function _getPrompt(
        databaseManager: DatabaseManager,
        aifSessionId: string,
        agentMetadata: types.database.AgentMetadata,
        input: string,
        files: types.UploadFileInfo[],
        outputFormat: types.api.TextFormat,
    ) {
        const chatHistory = databaseManager.getChatHistory(aifSessionId);
        const hasRAG = agentMetadata.ragAssetIds.length > 0;
        const _systemPrompt = !hasRAG ? agentMetadata.systemPrompt : `
${agentMetadata.systemPrompt}
${types.api.TextFormatPrompts[outputFormat] ?? ""}
Answer the question only based on the given context. Do not add any additional information. Answer in a short sentence.        
Context: {context}`;

        const messages: BaseMessage[] = [];
        messages.push(new SystemMessage(_systemPrompt));

        for (const chatMessage of ((chatHistory?.messages as types.database.ChatHistoryMessage[]) ?? [])) {
            if (chatMessage.role === types.api.ChatRole.USER) {
                messages.push(new HumanMessage(chatMessage.content));
            } else if (chatMessage.role === types.api.ChatRole.ASSISTANT) {
                messages.push(new AIMessage(chatMessage.content));
            }
        }

        const messageContent: MessageContentComplex[] = [{
            type: "text",
            text: input,
        }];

        for (const file of files) {
            messageContent.push({
                type: "image_url",
                image_url: {
                    url: `${file.dataUrlPrefix}${file.data}`,
                },
            });
        }

        messages.push(new HumanMessage({ content: messageContent }));
        const prompt = ChatPromptTemplate.fromMessages(messages);
        return prompt;
    }
}

export default LmManagerUtils;
