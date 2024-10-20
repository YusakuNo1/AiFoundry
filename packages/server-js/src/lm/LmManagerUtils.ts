import * as path from 'path';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Embeddings } from '@langchain/core/embeddings';
import { AIMessage, BaseMessage, HumanMessage, MessageContentComplex, SystemMessage } from "@langchain/core/messages";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BaseMessagePromptTemplate, ChatPromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import {
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
} from "@langchain/core/runnables";
import { api, type database, type misc } from "aifoundry-vscode-shared";
import LmBaseProvider from './LmBaseProvider';
import DatabaseManager from "../database/DatabaseManager";
import { HttpException } from '../exceptions';
import AssetUtils from '../utils/assetUtils';

namespace LmManagerUtils {
    export async function getBaseEmbeddingsModel(
        lmProviderMap: Record<string, LmBaseProvider>,
        aifUri: string,
    ): Promise<Embeddings> {
        for (const lmProvider of Object.values(lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseEmbeddingsModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    export async function getBaseChatModel(
        lmProviderMap: Record<string, LmBaseProvider>,
        aifUri: string,
    ): Promise<BaseChatModel> {
        for (const lmProvider of Object.values(lmProviderMap)) {
            if (lmProvider.canHandle(aifUri)) {
                return lmProvider.getBaseLanguageModel(aifUri);
            }
        }

        throw new HttpException(400, "No model found for the given uri");
    }

    export async function loadDocFromVectorStore(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, LmBaseProvider>,
        input: string,
        embeddingId: string,
    ) {
        const embeddingMetadata = databaseManager.getEmbeddingsMetadata(embeddingId);
        if (!embeddingMetadata) {
            throw new HttpException(404, "Embedding not found");
        }

        const llm = await getBaseEmbeddingsModel(lmProviderMap, embeddingMetadata.basemodelUri);

        const assetsPath = AssetUtils.getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingId);
        const vectorStore = await FaissStore.load(storePath, llm);
        const document = await vectorStore.similaritySearch(input, 1);
        return document;
    }

    export async function getChain(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, LmBaseProvider>,
        aifSessionId: string,
        agentId: string,
        input: string,
        inputMessageContent: database.ChatHistoryMessageContent,
        outputFormat: api.TextFormat,
    ) {
        const agentMetadata = databaseManager.getAgent(agentId);
        if (!agentMetadata) {
            throw new HttpException(404, "Agent not found");
        }

        const llm = await LmManagerUtils.getBaseChatModel(lmProviderMap, agentMetadata.basemodelUri);
        const prompt = await _getPrompt(databaseManager, lmProviderMap, aifSessionId, agentMetadata, input, inputMessageContent, outputFormat);
        const outputParser = new StringOutputParser();
        return prompt.pipe(llm).pipe(outputParser);
    }

    async function _getRagContext(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, LmBaseProvider>,
        agentMetadata: database.AgentEntity,
        input: string,
    ) {
        const docPromises = agentMetadata.ragAssetIds.map((assetId) => LmManagerUtils.loadDocFromVectorStore(databaseManager, lmProviderMap, input, assetId));
        const docs = await Promise.all(docPromises);
        const docContents = docs.map((doc) => doc[0].pageContent);
        return docContents.join("\n");
    }

    async function _getPrompt(
        databaseManager: DatabaseManager,
        lmProviderMap: Record<string, LmBaseProvider>,
        aifSessionId: string,
        agentMetadata: database.AgentEntity,
        input: string,
        inputMessageContent: database.ChatHistoryMessageContent,
        outputFormat: api.TextFormat,
    ) {
        const chatHistory = databaseManager.getChatHistory(aifSessionId);
        let _systemPromptString = `
${agentMetadata.systemPrompt}
${api.TextFormatPrompts[outputFormat] ?? ""}`;

        if (agentMetadata.ragAssetIds.length > 0) {
            const ragContext = await _getRagContext(databaseManager, lmProviderMap, agentMetadata, input);
            _systemPromptString = `${_systemPromptString}\nContext: ${ragContext}`;
        }

        const messages: BaseMessage[] = [];
        messages.push(new SystemMessage(_systemPromptString));

        for (const chatMessage of ((chatHistory?.messages as database.ChatHistoryMessage[]) ?? [])) {
            if (chatMessage.role === api.ChatRole.USER) {
                messages.push(new HumanMessage({ content: chatMessage.content }));
            } else if (chatMessage.role === api.ChatRole.ASSISTANT) {
                messages.push(new AIMessage({ content: chatMessage.content }));
            }
        }

        messages.push(new HumanMessage({ content: inputMessageContent }));
        const prompt = ChatPromptTemplate.fromMessages(messages);
        return prompt;
    }

    export function createMessageContent(input: string, files?: misc.UploadFileInfo[]): database.ChatHistoryMessageContent {
        const messageContent: database.ChatHistoryMessageContent = [{
            type: "text",
            text: input,
        }];

        for (const file of (files ?? [])) {
            messageContent.push({
                type: "image_url",
                image_url: {
                    url: `${file.dataUrlPrefix}${file.data}`,
                },
            });
        }

        return messageContent;
    }
}

export default LmManagerUtils;
