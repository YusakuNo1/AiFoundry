import ServerConfig from "../config/ServerConfig";
import { HttpException } from "../exceptions";
import { ApiOutStream } from "../types/ApiOutStream";

namespace OllamaUtils {
    export function getHost(): string {
        // Ollama is running in the host machine, however, we prefer host.docker.internal because we only recommend running the server within a Docker container.
        return ServerConfig.useLocalServer ? "http://localhost:11434" : "http://host.docker.internal:11434";
    }

    export async function isHealthy(): Promise<boolean> {
        try {
            const result = await fetch(getHost());
            return result.status === 200;
        } catch (error) {
            return false;
        }
    }

    export async function startOllamaServer(out: ApiOutStream): Promise<void> {
        const healthy = await isHealthy();
        if (healthy) {
            return;
        }

        out.write("Ollama server is not running. Starting Ollama server...");
        _startOllamaServer(out);
        out.end();
    }

    export async function listDownloadedModels(): Promise<string[]> {
        const endpoint = `${getHost()}/api/tags`;
        const response = await (await fetch(endpoint)).json();
        return (response as any).models.map((model) => model.name);
    }

    export function downloadModel(modelName: string, out: ApiOutStream): void {
        const endpoint = `${getHost()}/api/pull`;
        fetch(endpoint, {
            method: "POST",
            body: JSON.stringify({ name: modelName, stream: true }),
        }).then((response) => {
            if (!response || response.status !== 200) {
                out.error(`Failed to download model ${modelName}`);
                return null;
            } else {
                return response.text();
            }
        }).then((text) => {
            if (text !== null) {
                out.end();
            }
        });
    }

    export function deleteModel(modelName: string, out: ApiOutStream): void {
        const endpoint = `${getHost()}/api/delete`;
        fetch(endpoint, {
            method: "DELETE",
            body: JSON.stringify({ name: modelName }),
        }).then((response) => {
            if (!response || response.status !== 200) {
                out.error(`Failed to delete model ${modelName}`);
                return null;
            } else {
                return response.text();
            }
        }).then((text) => {
            if (text !== null) {
                out.end();
            }
        });
    }
}

function _startOllamaServer(out: ApiOutStream): void {
    let command: string | undefined;
    
    if (process.platform === "win32") {
        out.write("\nError: not implemented");
    } else if (process.platform === "darwin") {
        command = `osascript -e 'tell app "Terminal"
do script "ollama serve"
end tell'`;
    } else if (process.platform === "linux") {
        out.write("\nError: not implemented");
    }

    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
        if (error) {
            out.error(`Failed to start Ollama server: ${error}`);
            return;
        } else {
            out.write("Ollama server is running.", "success");
        }      
    });
}

export default OllamaUtils;
