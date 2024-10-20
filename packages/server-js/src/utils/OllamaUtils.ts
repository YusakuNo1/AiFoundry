import ServerConfig from "../config/ServerConfig";
import { ApiOutputCtrl } from "../types/ApiOutput";

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

    export async function startOllamaServer(out: ApiOutputCtrl): Promise<void> {
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

    export async function downloadModel(modelName: string): Promise<any> {
        const endpoint = `${getHost()}/api/pull`;
        return await fetch(
            endpoint,
            {
                method: "POST",
                body: JSON.stringify({ name: modelName, stream: true }),
            },
        );
    }

    export async function deleteModel(modelName: string): Promise<void> {
        const endpoint = `${getHost()}/api/delete`;
        await fetch(
            endpoint,
            {
                method: "DELETE",
                body: JSON.stringify({ name: modelName }),
            },
        );
    }
}

function _startOllamaServer(out: ApiOutputCtrl): void {
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
