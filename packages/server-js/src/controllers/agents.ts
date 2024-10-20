import * as express from "express";
import { consts } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";
import ResponseUtils from "../utils/ResponseUtils";
import RouterUtils from "../utils/RouterUtils";

export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // List all agents
    router.get(`${consts.ADMIN_CTRL_PREFIX}/agents/`, (req, res) => {
        ResponseUtils.handler(res, async () => lmManager.listAgents());
    });

    // Create a new agent
    router.post(
        `${consts.ADMIN_CTRL_PREFIX}/agents/`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => ResponseUtils.handler(res, async () => lmManager.createAgent(req.body)),
    );

    // Update an agent
    router.put(
        `${consts.ADMIN_CTRL_PREFIX}/agents/:agentId`,
        RouterUtils.middlewares.jsonParser,
        (req, res) => ResponseUtils.handler(res, async () => lmManager.updateAgent(req.params.agentId, req.body)),
    );

    // Delete an agent
    router.delete(
        `${consts.ADMIN_CTRL_PREFIX}/agents/:agentId`,
        (req, res) => {
            ResponseUtils.handler(res, async () => {
                return await lmManager.deleteAgent(req.params.agentId);
            });
        }
    );
}
