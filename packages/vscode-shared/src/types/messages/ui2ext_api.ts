import { TextFormat } from '../api/chat';
import { UpdateLmProviderRequest } from '../api/languageModels';
import * as shared from "./shared";

export const MessageApiTypes = [
    "chat:history:get",
    "chat:sendMessage",
    "api:updateLmProvider",
    "api:updateLmProvider:modelSelection",
    "api:listLmProviders",
    "api:getEmbeddings",
    "api:listFunctions",
] as const;
export type MessageApiType = typeof MessageApiTypes[number];
export type MessageApi = shared.IMessage & {
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
        aifSessionId: string | null;
        aifAgentUri: string;
        contentTextFormat: TextFormat;
        input: string;
        // files: RequestFileInfo[] | null; // It's much more efficient to put file loading logic in the extension side but not in the UI side
    };
};
export type MessageApiUpdateLmProvider = MessageApi & {
    type: "api:updateLmProvider" | "api:updateLmProvider:modelSelection",
    data: UpdateLmProviderRequest;
};
export type MessageApiListLmProviders = MessageApi & {
    type: "api:listLmProviders",
    data: {};
};
export type MessageApiGetEmbeddings = MessageApi & {
    type: "api:getEmbeddings",
    data: {};
};
export type MessageApiListFunctions = MessageApi & {
    type: "api:listFunctions",
    data: {};
};
