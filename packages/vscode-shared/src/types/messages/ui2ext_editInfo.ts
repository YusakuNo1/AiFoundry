import * as shared from "./shared";

export const MessageEditInfoEmbeddingsTypes = ['UpdateEmbeddingName', 'UpdateEmbeddingDoc', 'DeleteEmbedding'] as const;
export type MessageEditInfoEmbeddingsType = typeof MessageEditInfoEmbeddingsTypes[number];
export const MessageEditInfoAgentsTypes = ['agent:update:name', 'agent:update:systemPrompt', 'agent:delete'] as const;
export type MessageEditInfoAgentsType = typeof MessageEditInfoAgentsTypes[number];
export const MessageEditInfoFunctionsTypes = ['function:update:name', 'function:openfile'] as const;
export type MessageEditInfoFunctionsType = typeof MessageEditInfoFunctionsTypes[number];

export type MessageEditInfoType = MessageEditInfoEmbeddingsType | MessageEditInfoAgentsType | MessageEditInfoFunctionsType;
export type MessageEditInfo = shared.IMessage & {
    aifMessageType: 'editInfo',
    type: MessageEditInfoType,
};

export type MessageEditInfoEmbeddings = MessageEditInfo & { type: MessageEditInfoEmbeddingsType };
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

export type MessageEditInfoAgents = MessageEditInfo & { type: MessageEditInfoAgentsType };
export type MessageEditInfoAgentName = MessageEditInfoAgents & {
    data: {
        name: string;
        id: string;
    };
};
export type MessageEditInfoAgentsystemPrompt = MessageEditInfoAgents & {
    data: {
        system_prompt: string;
        id: string;
    };
};
export type MessageEditInfodeleteAgent = MessageEditInfoAgents & {
    data: {
        id: string;
    };
};


export type MessageEditInfoFunctions = MessageEditInfo & { type: MessageEditInfoFunctionsType };
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
