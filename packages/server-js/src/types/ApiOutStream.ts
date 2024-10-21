import type * as express from 'express';
import type { api } from 'aifoundry-vscode-shared';

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
        this.write(message, "error");
    }

    end(message?: string) {
        if (message) {
            this.write(message, "success");
        }
        this.res.end();
    }
}
