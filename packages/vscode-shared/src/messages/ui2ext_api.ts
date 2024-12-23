import { TextFormat } from '../api/types/chat';
import { UploadFileInfo } from '../misc/common';
import { UpdateLmProviderInfoRequest, UpdateLmProviderModelRequest } from '../api/types/languageModels';
import * as shared from "./shared";

const MessageApiTypes = [
    "chat:history:get",
    "chat:sendMessage",
    "api:updateLmProviderInfo",
    "api:updateLmProviderModel",
    "api:listLmProviders",
    "api:getAgents",
    "api:getEmbeddings",
    "api:listFunctions",
    "api:download:model",
    "api:delete:model",
    "api:setup:lmProvider",
] as const;
type MessageApiType = typeof MessageApiTypes[number];
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
        files: UploadFileInfo[];
    };
};
export type MessageApiUpdateLmProviderInfo = MessageApi & {
    type: "api:updateLmProviderInfo",
    data: UpdateLmProviderInfoRequest;
};
export type MessageApiUpdateLmProviderModel = MessageApi & {
    type: "api:updateLmProviderModel",
    data: UpdateLmProviderModelRequest;
};
export type MessageApiListLmProviders = MessageApi & {
    type: "api:listLmProviders",
    data: {};
};
export type MessageApiGetAgents = MessageApi & {
    type: "api:getAgents",
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
export type MessageApiDownloadModel = MessageApi & {
    type: "api:download:model",
    data: {
        modelUri: string;
    };
};
export type MessageApiDeleteModel = MessageApi & {
    type: "api:delete:model",
    data: {
        modelUri: string;
    };
};
export type MessageApiSetupLmProvider = MessageApi & {
    type: "api:setup:lmProvider",
    data: {
        id: string;
    };
};
