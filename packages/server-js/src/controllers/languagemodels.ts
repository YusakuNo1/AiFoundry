import * as express from "express";
import { consts, types } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";
import { HttpException } from "../exceptions";


export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/`, (req, res) => {
    //     ResponseUtils.handler(res, lmManager.listLanguagemodels);
    // });

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
        ResponseUtils.handler<types.api.DownloadLanguageModelResponse>(
            res,
            async () => lmManager.downloadLanguageModel(req.params.lmproviderid, req.params.id),
        );
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
