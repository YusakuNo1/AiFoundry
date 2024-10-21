import * as express from "express";
import { api, consts, StreamingUtils } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";
import { HttpException } from "../exceptions";
import { ApiOutStream } from "../types/ApiOutStream";


export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // Setup language model provider, for example, download Ollama to the host environment
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/setup`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            try {
                const request: api.SetupLmProviderRequest = req.body;
                lmManager.setupLmProvider(request, new ApiOutStream(res));    
            } catch (err) {
                ResponseUtils.handleException(res, err);
            }
        });

    // Get language model by feature filter, e.g. "embedding", "conversational"
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/filter/:filter`, (req, res) => {
        ResponseUtils.handler<api.ListLanguageModelsResponse>(res, async () => {
            const filter = req.params.filter as api.LlmFeature;
            if (api.LlmFeatures.indexOf(filter) === -1) {
                throw new HttpException(400, "Invalid filter");
            } else {
                return lmManager.listLanguageModels(filter);
            }
        });
    });

    // Download language model
    router.post(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/:lmproviderid/:id`, (req, res) => {
        try {
            lmManager.downloadLocalLanguageModel(req.params.lmproviderid, req.params.id, new ApiOutStream(res));
        } catch (err) {
            ResponseUtils.handleException(res, err);
        }
    });

    // Delete language model
    router.delete(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/crud/:lmproviderid/:id`, (req, res) => {
        try {
            lmManager.deleteLocalLanguageModel(req.params.lmproviderid, req.params.id, new ApiOutStream(res));
        } catch (err) {
            ResponseUtils.handleException(res, err);
        }
    });

    // List language model provider
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`, (req, res) => {
        const force = req.query[consts.QUERY_PARAM_FORCE] === "true";
        ResponseUtils.handler<api.ListLmProvidersResponse>(
            res,
            async () => lmManager.listLmProviders(force),
            ResponseUtils.maskListLmProvidersResponse,
        );
    });

    // Get language model provider by id
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/:id`, (req, res) => {
        const force = req.query[consts.QUERY_PARAM_FORCE] === "true";
        ResponseUtils.handler<api.LmProviderInfoResponse>(
            res,
            async () => lmManager.getLmProvider(req.params.id, force),
            ResponseUtils.maskGetLmProviderInfoResponse,
        );
    });
    
    // Update language model provider
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            ResponseUtils.handler<api.UpdateLmProviderResponse>(
                res,
                async () => lmManager.updateLmProviderInfo(req.body as api.UpdateLmProviderInfoRequest),
                ResponseUtils.maskUpdateLmProviderResponse,
            );
        }
    );

    // Update language model provider model configuration
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers/models`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => {
            ResponseUtils.handler<api.UpdateLmProviderResponse>(
                res,
                async () => lmManager.updateLmProviderModel(req.body as api.UpdateLmProviderModelRequest),
                ResponseUtils.maskUpdateLmProviderResponse,
            );
        }
    );
}
