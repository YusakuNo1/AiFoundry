namespace AppUrls {
    export enum AifRoute {
        AgentDetailsPage = "agents/:agentId",
        EmbeddingDetailsPage = "embeddings/:embeddingId",
        FunctionDetailsPage = "functions/:functionId",
        ModelPlaygroundPage = "modelPlayground",
        LmProviderUpdatePage = "updateLmProvider/:lmProviderId",
    }

    export const AifRoutePathParams: Record<AifRoute, string[]> = {
        [AifRoute.AgentDetailsPage]: [":agentId"],
        [AifRoute.EmbeddingDetailsPage]: [":embeddingId"],
        [AifRoute.FunctionDetailsPage]: [":functionId"],
        [AifRoute.ModelPlaygroundPage]: [],
        [AifRoute.LmProviderUpdatePage]: [":lmProviderId"],
    };

    export function buildPageUrl(route: AifRoute, params: string[]) {
        if (params.length !== AifRoutePathParams[route].length) {
            throw new Error(`Invalid number of parameters for route ${route}`);
        }

        let pageUrl = route as string;
        for (let i = 0; i < params.length; i++) {
            pageUrl = pageUrl.replace(AifRoutePathParams[route][i], params[i]);
        }
        return `/${pageUrl}`;
    }
}

export default AppUrls;
