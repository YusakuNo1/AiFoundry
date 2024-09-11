import { FunctionMetadata } from './api/functions';
import { EmbeddingInfo } from './api/embeddings';
import { AgentInfo } from './api/agents';
import { SystemMenuItem } from './api/system';
import { TextFormat } from './api/chat';
import { UpdateLmProviderRequest, LmProviderInfo } from './api/languageModels';


export type IMessage = {
    aifMessageType: "webapp:ready" | "setPageType" | "hostMsg" | "editInfo" | "api" | "store:update";
}


// Set page message (extension to UI)

export type IPageContextPageType = "home" | "embeddings" | "agents" | "modelPlayground" | "functions" | "updateLmProvider";
export type IPageContext = {
    pageType: IPageContextPageType;
};

export type PageContextHome = IPageContext;
export type PageContextEmbeddings = IPageContext & { data: EmbeddingInfo };
export type PageContextAgentDetails = IPageContext & { data: AgentInfo };
export type PageContextModelPlayground = IPageContext & { data: {
    aifAgentUri: string,
    outputFormat: TextFormat,
} };
export type PageContextFunctions = IPageContext & { data: FunctionMetadata };
export type PageContextUpdateLmProvider = IPageContext & { data: { lmProviderId: string } };
export type PageContext = PageContextEmbeddings | PageContextAgentDetails | PageContextModelPlayground;

export type MessageSetPageContextHome = IMessage & PageContextHome;
export type MessageSetPageContextEmbeddings = IMessage & PageContextEmbeddings;
export type MessageSetPageContextAgentDetails = IMessage & PageContextAgentDetails;
export type MessageSetPageContextModelPlayground = IMessage & PageContextModelPlayground;
export type MessageSetPageContextFunctions = IMessage & PageContextFunctions;
export type MessageSetPageContextUpdateLmProvider = IMessage & PageContextUpdateLmProvider;
export type MessageSetPageContext =
    MessageSetPageContextHome |
    MessageSetPageContextEmbeddings |
    MessageSetPageContextAgentDetails |
    MessageSetPageContextModelPlayground |
    MessageSetPageContextFunctions |
    MessageSetPageContextUpdateLmProvider
;

// Update Redux store message (extension to UI)

export const IStoreUpdateTypes = [
    "appendChatAssistantMessage",
    "appendToLastChatAssistantMessage",
    "updateLastChatAssistantMessage",
    "updateSystemMenuItemMap",
    "updateLmProviders",
    "updateEmbeddings",
    "updateFunctions",
] as const;
export type IStoreUpdateType = typeof IStoreUpdateTypes[number];
export type IStoreUpdate = {
    aifMessageType: "store:update";
    type: IStoreUpdateType;
}
export type MessageStoreUpdateChatHistoryMessage = IMessage & IStoreUpdate & {
    type: "appendChatAssistantMessage",
    data: {
        aifSessionId: string;
        content: string;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreAppendToLastChatAssistantMessage = IMessage & IStoreUpdate & {
    type: "appendToLastChatAssistantMessage",
    data: {
        aifSessionId: string;
        chunk: string;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreUpdateLastChatAssistantMessage = IMessage & IStoreUpdate & {
    type: "updateLastChatAssistantMessage",
    data: {
        aifSessionId: string;
        content: string;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreUpdateSystemMenuItemMap = IMessage & IStoreUpdate & {
    type: "updateSystemMenuItemMap",
    data: {
        systemMenuItemMap: Record<string, SystemMenuItem>;
    };
}
export type MessageStoreUpdateLmProviders = IMessage & IStoreUpdate & {
    type: "updateLmProviders",
    data: {
        lmProviders: LmProviderInfo[];
    };
}
export type MessageStoreUpdateEmbeddings = IMessage & IStoreUpdate & {
    type: "updateEmbeddings",
    data: {
        embeddings: EmbeddingInfo[];
    };
}
export type MessageStoreUpdateFunctions = IMessage & IStoreUpdate & {
    type: "updateFunctions",
    data: {
        functions: FunctionMetadata[];
    };
}


// Host messages (UI to extension)

export const MessageHostMsgTypes = ['executeCommand', "showMessage"] as const;
export type MessageHostMsg = IMessage & {
    aifMessageType: "hostMsg",
    type: typeof MessageHostMsgTypes[number],
};
export type MessageHostMsgExecuteCommand = MessageHostMsg & {
    type: 'executeCommand',
    data: {
        command: 'AiFoundry.installDocker' |
            'AiFoundry.startDockerApp' |
            'AiFoundry.startDockerServer' |
            'AiFoundry.startDockerDevContainer' |
            'AiFoundry.refreshMainView' |
            'AiFoundry.refreshAllViews', // List of available commands
        args: Record<string, any>,
    }
}
export type MessageHostMsgShowMessage = MessageHostMsg & {
    type: 'showMessage',
    data: {
        type: "error" | "warning" | "info",
        message: string,
    }
}


// API messages (UI to extension)

export const MessageApiTypes = ['chat:history:get', 'chat:sendMessage', "updateLmProvider", "listLmProviders", "getEmbeddings", "listFunctions"] as const;
export type MessageApiType = typeof MessageApiTypes[number];
export type MessageApi = IMessage & {
    aifMessageType: "api",
    type: MessageApiType,
};
export type MessageApiGetChatHistory = MessageApi & {
    type: 'chat:history:get',
    data: {
        id: string;
    };
};
export type MessageApiChatSendMessage = MessageApi & {
    type: 'chat:sendMessage',
    data: {
        isStream: boolean;
        aifSessionId: string | null;
        aifAgentUri: string;
        contentTextFormat: TextFormat;
        content: string;
    };
};
export type MessageApiUpdateLmProvider = MessageApi & {
    type: 'updateLmProvider',
    data: UpdateLmProviderRequest;
};
export type MessageApiListLmProviders = MessageApi & {
    type: 'listLmProviders',
    data: {};
};
export type MessageApiGetEmbeddings = MessageApi & {
    type: 'getEmbeddings',
    data: {};
};
export type MessageApiListFunctions = MessageApi & {
    type: 'listFunctions',
    data: {};
};


// Edit info message (UI to extension)

export type MessageEditInfo = IMessage & {
    aifMessageType: 'editInfo',
};

export const MessageEditInfoEmbeddingsTypes = ['UpdateEmbeddingName', 'UpdateEmbeddingDoc', 'DeleteEmbedding'] as const;
export type MessageEditInfoEmbeddingsType = typeof MessageEditInfoEmbeddingsTypes[number];
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


export const MessageEditInfoAgentsTypes = ['agent:update:name', 'agent:update:systemPrompt', 'agent:delete'] as const;
export type MessageEditInfoAgentsType = typeof MessageEditInfoAgentsTypes[number];
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


export const MessageEditInfoFunctionsTypes = ['function:update:name', 'function:openfile'] as const;
export type MessageEditInfoFunctionsType = typeof MessageEditInfoFunctionsTypes[number];
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
