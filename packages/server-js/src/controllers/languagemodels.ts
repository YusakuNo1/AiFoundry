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

    router.get(`${consts.ADMIN_CTRL_PREFIX}/languagemodels/providers`, (req, res) => {
        ResponseUtils.handler(res, lmManager.listLmProviders);
    });
}

//     @router.post(ADMIN_CTRL_PREFIX + "/languagemodels/providers", tags=["languagemodels"])
//     async def updateLmProvider(
//         request: UpdateLmProviderRequest,
//     ) -> ListLmProvidersResponse:
//         return exceptionHandler(lambda: llm_manager.updateLmProvider(request))
