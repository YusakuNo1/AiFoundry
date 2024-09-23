import * as express from "express";
import { HttpException } from "../exceptions";

namespace ResponseUtils {
    export async function handler(response: express.Response, func: Function) {
        try {
            const result = await func();
            response.json(result);
        } catch (ex) {
            if (ex instanceof HttpException) {
                response.status(ex.status).json({ error: ex.message });
            } else {
                throw new HttpException(500, "Unknown error: " + ex);
            }
        }
    }
}

export default ResponseUtils;
