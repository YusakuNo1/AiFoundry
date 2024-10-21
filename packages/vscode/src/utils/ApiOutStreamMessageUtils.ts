import type * as express from "express";
import * as vscode from "vscode";
import type { api } from "aifoundry-vscode-shared";

namespace ApiOutStreamMessageUtils {
    export function show(message: api.ApiOutStreamMessage) {
        if (message.type === "info" || message.type === "success") {
            vscode.window.showInformationMessage(message.message);
        } else if (message.type === "warning") {
            vscode.window.showWarningMessage(message.message);
        } else if (message.type === "error") {
            vscode.window.showErrorMessage(message.message);
        }
    }

    export async function handleResponse(status: number, reader: any): Promise<void> {
        if (!reader) {
            show({ type: "error", message: "Failed to read the response." });
            return;
        }

        return new Promise((resolve) => {
            (async function run() {
                const decoder = new TextDecoder("utf-8");
                let done = false;
                while (!done) {
                    const result: any = await reader!.read();
                    if (result.done) {
                        done = result.done;
                        break;
                    }
    
                    try {
                        const responseString = typeof(result.value) === 'string' ? result.value : decoder.decode(result.value);
                        const json = JSON.parse(responseString);
                        if (status === 200) {
                            show(json);
                        } else {
                            show({ type: "error", message: json.error });
                        }
                    } catch (ex) {
                        show({ type: "error", message: `Failed to parse the response: ${ex}` });
                    }
                }

                resolve();
            })();    
        });
    }
}

export default ApiOutStreamMessageUtils;
