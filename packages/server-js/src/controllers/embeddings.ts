import * as express from "express";
import { type api, consts, misc } from 'aifoundry-vscode-shared';
import Config from "../config";
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";

export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // List all embeddings
    router.get(`${consts.ADMIN_CTRL_PREFIX}/embeddings/`, (req, res) => {
        ResponseUtils.handler(res, async () => lmManager.listEmbeddings());
    });

    // Create a new embedding
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/embeddings/`,
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(misc.AcceptedFileInfoEmbedding),
        (req, res) => {
            const request: api.CreateEmbeddingRequest = {
                basemodelUri: req.headers[Config.HEADER_AIF_BASEMODEL_URI] as string,
                files: req["files"],
                name: req.body?.name,
                description: req.body?.description ?? "",
                splitterParams: req.body?.splitterParams,
            }
            ResponseUtils.handler(res, async () => lmManager.createEmbedding(request));
        }
    );

    // Update an embedding
    router.put(
        `${consts.ADMIN_CTRL_PREFIX}/embeddings/`,
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(misc.AcceptedFileInfoEmbedding),
        (req, res) => {
            const request: api.UpdateEmbeddingRequest = {
                id: req.headers[Config.HEADER_AIF_EMBEDDING_ASSET_ID] as string,
                files: req["files"],
                name: req.body?.name,
                description: req.body?.description,
                searchTopK: req.body?.searchTopK ? parseInt(req.body.searchTopK) : undefined,
            }
            ResponseUtils.handler(res, async () => lmManager.updateEmbedding(request));
        }
    );

    // Delete an embedding
    router.delete(`${consts.ADMIN_CTRL_PREFIX}/embeddings/:embeddingId`, (req, res) => {
        ResponseUtils.handler(res, async () => lmManager.deleteEmbedding(req.params.embeddingId));
    });
}
