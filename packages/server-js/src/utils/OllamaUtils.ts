import ServerConfig from "../config/ServerConfig";

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
}

export default OllamaUtils;
