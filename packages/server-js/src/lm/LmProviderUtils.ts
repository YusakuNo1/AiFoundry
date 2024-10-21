import type { api } from "aifoundry-vscode-shared";
import { AifUtils } from "aifoundry-vscode-shared";
import { ModelDef } from '../config/model_info/types';

namespace LmProviderUtils {
    export function createModelMap(modelDef: ModelDef, lmProviderId: string): Record<string, api.LmProviderBaseModelInfo> {
        const modelMap: Record<string, api.LmProviderBaseModelInfo> = {};
        const models = modelDef.models;
        for (const model of models) {
            const modelInfo: api.LmProviderBaseModelInfo = {
                uri: AifUtils.createAifUri(lmProviderId, AifUtils.AifUriCategory.Models, model.title),
                name: model.title,
                providerId: lmProviderId,
                features: convertTagToLmFeature(model.tags),
                isUserDefined: false,
            }
            modelMap[model.title] = modelInfo;
        }

        return modelMap;
    }

    export function convertTagToLmFeature(tags: string[]): api.LlmFeature[] {
        const features: api.LlmFeature[] = []

        if (tags.includes("embedding")) {
            features.push("embedding");
        } else {
            features.push("conversational");

            if (tags.includes("vision")) {
                features.push("vision");
            }

            if (tags.includes("tools")) {
                features.push("tools");
            }
        }

        return features;
    }
}

export default LmProviderUtils;
