import type * as express from 'express';
import type { api } from 'aifoundry-vscode-shared';
import { HttpException } from '../exceptions';

export class ApiOutStream {
    constructor(private res: express.Response) {
    }

    write(_message: string | api.ApiOutStreamMessage, type: api.ApiOutStreamMessageType = "info") {
        const message: api.ApiOutStreamMessage = (typeof _message === "string") ? {
            type,
            message: _message,
        } : _message;
        this.res.write(JSON.stringify(message));
    }

    error(message: string) {
        if (this.res.headersSent) {
            this.write("Failed to handle the request", "error");
            return;
        } else {
            throw new HttpException(500, "Unknown error: " + message);
        }
    }

    end() {
        this.res.end();
    }
}
