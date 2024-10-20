import { type api, type messages } from "aifoundry-vscode-shared";

export function createMessageApiUpdateLmProviderInfo(
    messageApiType: "api:updateLmProviderInfo",
    lmProviderId: string,
    weight: number | null,
    properties: Record<string, string>,
): messages.MessageApiUpdateLmProviderInfo {
    const request: api.UpdateLmProviderInfoRequest = {
        id: lmProviderId,
        weight: weight ?? undefined,
        properties,
    };

    const message: messages.MessageApiUpdateLmProviderInfo = {
        aifMessageType: "api",
        type: messageApiType,
        data: request,
    };
    return message;
}

export function createMessageApiUpdateLmProviderModel(
    messageApiType: "api:updateLmProviderModel",
    lmProviderId: string,
    modelUri: string,
    selected: boolean,
): messages.MessageApiUpdateLmProviderModel {
    const request: api.UpdateLmProviderModelRequest = {
        id: lmProviderId,
        modelUri,
        selected,
    };

    const message: messages.MessageApiUpdateLmProviderModel = {
        aifMessageType: "api",
        type: messageApiType,
        data: request,
    };
    return message;
}
