import { types } from "aifoundry-vscode-shared";

export function createMessageApiUpdateLmProviderInfo(
    messageApiType: "api:updateLmProviderInfo",
    lmProviderId: string,
    weight: number | null,
    properties: Record<string, string>,
): types.MessageApiUpdateLmProviderInfo {
    const request: types.api.UpdateLmProviderInfoRequest = {
        id: lmProviderId,
        weight: weight ?? undefined,
        properties,
    };

    const message: types.MessageApiUpdateLmProviderInfo = {
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
): types.MessageApiUpdateLmProviderModel {
    const request: types.api.UpdateLmProviderModelRequest = {
        id: lmProviderId,
        modelUri,
        selected,
    };

    const message: types.MessageApiUpdateLmProviderModel = {
        aifMessageType: "api",
        type: messageApiType,
        data: request,
    };
    return message;
}
