import { FunctionMetadata } from '../api/functions';
import type { EmbeddingMetadata } from '../database/EmbeddingMetadata';
import { TextFormat } from '../api/chat';
import { LmProviderInfoResponse } from '../api/languageModels';
import { SystemMenuItem } from '../menu';
import { FileInfo, FileSelection } from '../store/serverData';
import * as shared from "./shared";

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
export type MessageStoreAppendChatAssistantMessage = shared.IMessage & IStoreUpdate & {
    type: "appendChatAssistantMessage",
    data: {
        aifSessionId: string;
        content: string;
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
export type MessageStoreUpdateLastChatAssistantMessage = shared.IMessage & IStoreUpdate & {
    type: "updateLastChatAssistantMessage",
    data: {
        aifSessionId: string;
        content: string;
        contentTextFormat: TextFormat;
    };
}
export type MessageStoreUpdateSystemMenuItemMap = shared.IMessage & IStoreUpdate & {
    type: "updateSystemMenuItemMap",
    data: {
        systemMenuItemMap: Record<string, SystemMenuItem>;
    };
}
export type MessageStoreUpdateLmProviders = shared.IMessage & IStoreUpdate & {
    type: "updateLmProviders",
    data: {
        lmProviders: LmProviderInfoResponse[];
    };
}
export type MessageStoreUpdateEmbeddings = shared.IMessage & IStoreUpdate & {
    type: "updateEmbeddings",
    data: {
        embeddings: EmbeddingMetadata[];
    };
}
export type MessageStoreUpdateFunctions = shared.IMessage & IStoreUpdate & {
    type: "updateFunctions",
    data: {
        functions: FunctionMetadata[];
    };
}
export type MessageStoreUpdateFileSelection = shared.IMessage & IStoreUpdate & {
    type: "updateFileSelection",
    data: FileSelection<FileInfo>;
}
export type MessageStoreClearFileSelection = shared.IMessage & IStoreUpdate & {
    type: "clearFileSelection",
    data: null;
}
