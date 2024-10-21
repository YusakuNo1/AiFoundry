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
}

export default ApiOutStreamMessageUtils;
