import * as express from "express";
import { AifUtils, consts, type types } from 'aifoundry-vscode-shared';
import { HttpException } from "../exceptions";

namespace ResponseUtils {
    export async function handler<ResponseType>(response: express.Response, func: () => Promise<ResponseType>, maskFunc?: (response: ResponseType) => ResponseType) {
        try {
            const result = await func();
            if (maskFunc) {
                response.json(maskFunc(result));
            } else {
                response.json(result);
            }
        } catch (ex) {
            handleException(response, ex);
        }
    }

    export function handleException(response: express.Response, ex: any) {
        if (ex instanceof HttpException) {
            response.status(ex.status).json({ error: ex.message });
        } else {
            response.status(500).json({ error: "Unknown error: " + ex });
        }
    }

    export function maskListLmProvidersResponse(response: types.api.ListLmProvidersResponse): types.api.ListLmProvidersResponse {
        response.providers.forEach((provider) => {
            Object.values(provider.properties).forEach(_maskLmProviderProperty);
        });
        return response;
    }

    export function maskUpdateLmProviderResponse(response: types.api.UpdateLmProviderResponse): types.api.UpdateLmProviderResponse {
        Object.values(response.properties).forEach(_maskLmProviderProperty);
        return response;
    }

    function _maskLmProviderProperty(property: types.api.LmProviderProperty): types.api.LmProviderProperty {
        const uriInfo = AifUtils.extractAiUri(null, property.valueUri ?? "");
        if (property.isSecret && uriInfo && uriInfo.parts.length === 2) {
            uriInfo.parts[1] = consts.LM_PROVIDER_PROP_VALUE_MASK.repeat(uriInfo.parts[1].length);
            property.valueUri = AifUtils.createAifUri(uriInfo.protocol, AifUtils.AifUriCategory.Values, uriInfo.parts);
        }
        return property;
    }
}

export default ResponseUtils;
