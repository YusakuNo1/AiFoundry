import * as express from "express";
import { consts, types } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import { HttpException } from "../exceptions";


export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/`, (req, res) => {
    //     ResponseUtils.handler(res, lmManager.listLanguagemodels);
    // });

    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/filter/:filter`, (req, res) => {
        ResponseUtils.handler(res, () => {
            const filter = req.params.filter as types.api.LlmFeature;
            if (types.api.LlmFeatures.indexOf(filter) === -1) {
                throw new HttpException(400, "Invalid filter");
            } else {
                return lmManager.listLanguageModels(filter);
            }
        });
    });

    // List language model provider
    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`, (req, res) => {
        ResponseUtils.handler(res, lmManager.listLmProviders);
    });

    // Update language model provider
    router.post(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`, (req, res) => {
        ResponseUtils.handler(res, () => lmManager.updateLmProvider(req.body as types.api.UpdateLmProviderRequest));
    });
}
