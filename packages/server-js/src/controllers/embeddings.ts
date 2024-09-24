import * as express from "express";
import { consts } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";

export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // List all embeddings
    router.get(`${consts.ADMIN_CTRL_PREFIX}/embeddings/`, (req, res) => {
        ResponseUtils.handler(res, lmManager.listEmbeddings);
    });

    // Create a new embedding
    router.post(`${consts.ADMIN_CTRL_PREFIX}/embeddings/`, RouterUtils.middlewares.jsonParser, (req, res) => {
        // ResponseUtils.handler(res, () => lmManager.createEmbedding(req.body));
        throw new Error('Not implemented');
    });
}
