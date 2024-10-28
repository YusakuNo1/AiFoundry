import { EmbeddingEntity } from "../api/types/embeddings";
import * as shared from "./shared";

export const MessageEditInfoEmbeddingsTypes = [
    'UpdateEmbeddingName',
    'UpdateEmbeddingDoc',
    'DeleteEmbedding',
    "UpdateEmbeddingSearchTopK",
] as const;
export type MessageEditInfoEmbeddingsType = typeof MessageEditInfoEmbeddingsTypes[number];
export const MessageEditInfoAgentsTypes = ['agent:update:name', 'agent:update:systemPrompt', 'agent:delete', "agent:updateRagAssets"] as const;
export type MessageEditInfoAgentsType = typeof MessageEditInfoAgentsTypes[number];
export const MessageEditInfoFunctionsTypes = ['function:update:name', 'function:openfile'] as const;
export type MessageEditInfoFunctionsType = typeof MessageEditInfoFunctionsTypes[number];

type MessageEditInfoType = MessageEditInfoEmbeddingsType | MessageEditInfoAgentsType | MessageEditInfoFunctionsType;
export type MessageEditInfo = shared.IMessage & {
    aifMessageType: 'editInfo',
    type: MessageEditInfoType,
};

type MessageEditInfoEmbeddings = MessageEditInfo & { type: MessageEditInfoEmbeddingsType };
export type MessageEditInfoEmbeddingName = MessageEditInfoEmbeddings & {
    data: {
        name: string;
        aifEmbeddingAssetId: string;
    };
};
export type MessageEditInfoEmbeddingUpdateDoc = MessageEditInfoEmbeddings & {
    data: {
        aifEmbeddingAssetId: string;
    };
};
export type MessageEditInfoDeleteEmbedding = MessageEditInfoEmbeddings & {
    data: {
        aifEmbeddingAssetId: string;
    };
};
export type MessageEditInfoEmbeddingSearchTopK = MessageEditInfoEmbeddings & {
    data: {
        aifEmbeddingAssetId: string;
        searchTopK: number;
    };
};

type MessageEditInfoAgents = MessageEditInfo & { type: MessageEditInfoAgentsType };
export type MessageEditInfoAgentName = MessageEditInfoAgents & {
    data: {
        name: string;
        id: string;
    };
};
export type MessageEditInfoAgentsystemPrompt = MessageEditInfoAgents & {
    data: {
        systemPrompt: string;
        id: string;
    };
};
export type MessageEditInfoDeleteAgent = MessageEditInfoAgents & {
    data: {
        id: string;
    };
};
export type MessageEditInfoAgentUpdateRagAssets = MessageEditInfoAgents & {
    data: {
        agentUri: string;
        ragAssetIds: string[];
    };
};

type MessageEditInfoFunctions = MessageEditInfo & { type: MessageEditInfoFunctionsType };
export type MessageEditInfoFunctionUpdateName = MessageEditInfoFunctions & {
    data: {
        name: string;
        id: string;
    };
};
export type MessageEditInfoFunctionOpenFile = MessageEditInfoFunctions & {
    data: {
        uri: string;
    };
};
