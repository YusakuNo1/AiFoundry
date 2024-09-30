import * as express from "express";
import { v4 as uuid } from "uuid";
import { consts, types } from "aifoundry-vscode-shared";
import ILmManager from "../lm/ILmManager";
import RouterUtils from "../utils/RouterUtils";
import ResponseUtils from "../utils/ResponseUtils";
import { HttpException } from "../exceptions";

export function registerRoutes(router: express.Router, llmManager: ILmManager) {
    router.post(
        '/chat/',
        RouterUtils.middlewares.jsonParser,
        RouterUtils.middlewares.uploadFiles,
        RouterUtils.fileConvertMiddleware(["image"]),
        (req, res) => {
            try {
                // Cannot use ResponseUtils.handler because it's async
                chat(req, res);
            } catch (err) {
                ResponseUtils.handleException(res, err);
            }
        }
    );

    function chat(req, res) {
        const aif_session_id: string = req.cookies.aif_session_id as string || uuid();

        const aif_agent_uri = req.headers["aif-agent-uri"];
        if (!aif_agent_uri || typeof aif_agent_uri !== 'string') {
            throw new HttpException(400, 'Missing aif-agent-uri');
        }

        // Different cases:
        //  1. Exceptions before sending the first 
        //    1.1 Exception within `llmManager.chat`. Handle by `ResponseUtils.handler`. If it's HttpException, follow the instruction; otherwise send HTTP 500
        //    1.2 Exception within `sub.subscribe`. Handle by `ResponseUtils.handleException`. If it's HttpException, follow the instruction; otherwise send HTTP 500
        //  2. Exceptions after sending the first chunk, attach the error message to the response with HTTP 200
        //  3. Exceptions after completing the response, ignore the exception
        const sub = llmManager.chat(
            aif_session_id,
            aif_agent_uri,
            req.query.outputFormat as types.api.TextFormat ?? "plain",
            req.body.input,
            req.files as types.UploadFileInfo[],
        )

        res.status(200).type('text');
        res.cookie(consts.COOKIE_AIF_SESSION_ID, aif_session_id);
        let streamingStarted = false;
        let streamingFinished = false;

        sub.subscribe({
            next: (chunk) => {
                if (!streamingStarted) {
                    streamingStarted = true;
                }
                res.write(chunk);
            },
            complete: () => {
                streamingFinished = true;
                res.end();
            },
            error: (err) => {
                if (!streamingStarted) {
                    // Case 1
                    ResponseUtils.handleException(res, err);
                } else if (!streamingFinished) {
                    // Case 2
                    res.write(err);
                } else {
                    // Case 3, ignore the exception
                }
            },
        });
    }
}
