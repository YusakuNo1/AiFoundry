import * as express from "express";
import { consts, types } from 'aifoundry-vscode-shared';
import Config from "../config";
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";

export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // List all embeddings
    router.get(`${consts.ADMIN_CTRL_PREFIX}/embeddings/`, (req, res) => {
        ResponseUtils.handler(res, lmManager.listEmbeddings);
    });

    // Create a new embedding
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/embeddings/`,
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(types.AcceptedFileInfoEmbedding),
        (req, res) => {
            ResponseUtils.handler(res, () => lmManager.createEmbedding(req.headers[Config.HEADER_AIF_BASEMODEL_URI] as string, req["files"], req.body?.name));
        }
    );

    // Update an embedding
    router.put(
        `${consts.ADMIN_CTRL_PREFIX}/embeddings/`,
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(types.AcceptedFileInfoEmbedding),
        (req, res) => {
            ResponseUtils.handler(res, () => lmManager.updateEmbedding(req.headers[Config.HEADER_AIF_EMBEDDING_ASSET_ID] as string, req["files"], req.body?.name));
        }
    );

    // Delete an embedding
    router.delete(`${consts.ADMIN_CTRL_PREFIX}/embeddings/:embeddingId`, (req, res) => {
        ResponseUtils.handler(res, () => lmManager.deleteEmbedding(req.params.embeddingId));
    });
}
