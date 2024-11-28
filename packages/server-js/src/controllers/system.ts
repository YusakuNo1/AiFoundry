import * as express from "express";
import ILmManager from "../languagemodels/ILmManager";


export function registerRoutes(router: express.Router, llmManager: ILmManager) {
    router.get('/status/', (req, res) => {
        res.json({ status: 'ok' });
    });
}
