import * as express from "express";
import { HttpException } from "../exceptions";

namespace ResponseUtils {
    export async function handler(response: express.Response, func: Function) {
        try {
            const result = await func();
            response.json(result);
        } catch (ex) {
            handleException(response, ex);
        }
    }

    export function handleException(response: express.Response, ex: any) {
        if (ex instanceof HttpException) {
            response.status(ex.status).json({ error: ex.message });
        } else {
            response.status(500).json({ error: "Unknown error: " + ex });
        }
    }
}

export default ResponseUtils;
