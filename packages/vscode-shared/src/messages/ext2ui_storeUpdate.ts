import { FunctionEntity } from '../api/functions';
import type { AgentEntity } from '../api/agents';
import type { EmbeddingEntity } from '../api/embeddings';
import type { ChatHistoryMessageContent } from '../database/ChatHistoryEntity';
import { TextFormat } from '../api/chat';
import { LmProviderInfoResponse } from '../api/languageModels';
import * as shared from "./shared";

const IStoreUpdateTypes = [
    "appendChatAssistantMessage",
    "appendToLastChatAssistantMessage",
    "updateLastChatAssistantMessage",
    "updateLmProviders",
    "updateAgents",
    "updateEmbeddings",
    "updateFunctions",
] as const;
type IStoreUpdateType = typeof IStoreUpdateTypes[number];
export type IStoreUpdate = {
    aifMessageType: "store:update";
    type: IStoreUpdateType;
}
export type MessageStoreAppendChatAssistantMessage = shared.IMessage & IStoreUpdate & {
    type: "appendChatAssistantMessage",
    data: {
        aifSessionId: string;
        content: ChatHistoryMessageContent;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreAppendToLastChatAssistantMessage = shared.IMessage & IStoreUpdate & {
    type: "appendToLastChatAssistantMessage",
    data: {
        aifSessionId: string;
        chunk: string;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreUpdateLmProviders = shared.IMessage & IStoreUpdate & {
    type: "updateLmProviders",
    data: {
        lmProviders: LmProviderInfoResponse[];
    };
}
export type MessageStoreUpdateAgents = shared.IMessage & IStoreUpdate & {
    type: "updateAgents",
    data: {
        agents: AgentEntity[];
    };
}
export type MessageStoreUpdateEmbeddings = shared.IMessage & IStoreUpdate & {
    type: "updateEmbeddings",
    data: {
        embeddings: EmbeddingEntity[];
    };
}
export type MessageStoreUpdateFunctions = shared.IMessage & IStoreUpdate & {
    type: "updateFunctions",
    data: {
        functions: FunctionEntity[];
    };
}
