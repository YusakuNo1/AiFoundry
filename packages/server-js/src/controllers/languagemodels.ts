import * as express from "express";
import { consts, types, StreamingUtils } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";
import { HttpException } from "../exceptions";
import { ApiOutputCtrl } from "../types/ApiOutput";


export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // Setup language model provider, for example, download Ollama to the host environment
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/setup`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            try {
                const request: types.api.SetupLmProviderRequest = req.body;
                lmManager.setupLmProvider(request, new ApiOutputCtrl(res));    
            } catch (err) {
                ResponseUtils.handleException(res, err);
            }
        });

    // Get language model by feature filter, e.g. "embedding", "conversational"
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/filter/:filter`, (req, res) => {
        ResponseUtils.handler<types.api.ListLanguageModelsResponse>(res, async () => {
            const filter = req.params.filter as types.api.LlmFeature;
            if (types.api.LlmFeatures.indexOf(filter) === -1) {
                throw new HttpException(400, "Invalid filter");
            } else {
                return lmManager.listLanguageModels(filter);
            }
        });
    });

    // Download language model
    router.post(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/:lmproviderid/:id`, (req, res) => {
        try {
            lmManager.downloadLanguageModel(req.params.lmproviderid, req.params.id).then(readableStream => {
                const sub = StreamingUtils.convertReadableStreamToObservable(readableStream as any);
                ResponseUtils.handleStreamingResponse(res, sub);
            });
        } catch (err) {
            ResponseUtils.handleException(res, err);
        }
    });

    // Delete language model
    router.delete(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/:lmproviderid/:id`, (req, res) => {
        ResponseUtils.handler<types.api.DeleteLanguageModelResponse>(
            res,
            async () => lmManager.deleteLanguageModel(req.params.lmproviderid, req.params.id),
        );
    });

    // List language model provider
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`, (req, res) => {
        const force = req.query[consts.QUERY_PARAM_FORCE] === "true";
        ResponseUtils.handler<types.api.ListLmProvidersResponse>(
            res,
            async () => lmManager.listLmProviders(force),
            ResponseUtils.maskListLmProvidersResponse,
        );
    });

    // Update language model provider
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            ResponseUtils.handler<types.api.UpdateLmProviderResponse>(
                res,
                async () => lmManager.updateLmProviderInfo(req.body as types.api.UpdateLmProviderInfoRequest),
                ResponseUtils.maskUpdateLmProviderResponse,
            );
        }
    );

    // Update language model provider model configuration
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/models`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            ResponseUtils.handler<types.api.UpdateLmProviderResponse>(
                res,
                async () => lmManager.updateLmProviderModel(req.body as types.api.UpdateLmProviderModelRequest),
                ResponseUtils.maskUpdateLmProviderResponse,
            );
        }
    );
}
