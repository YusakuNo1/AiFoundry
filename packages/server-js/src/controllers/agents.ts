import * as express from "express";
import { consts } from 'aifoundry-vscode-shared';
import ILmManager from "../lm/ILmManager";


export function registerAdminRoutes(router: express.Router, lmManager: ILmManager) {
    // List all agents
    router.get(`${consts.ADMIN_CTRL_PREFIX}/agents/`, (req, res) => {
        lmManager.listAgents().then(agents => {
            res.json(agents);
        }).catch(err => {
            res.status(500).json({ error: err.message });
        });
    });
}
