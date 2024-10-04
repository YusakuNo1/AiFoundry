import { types } from 'aifoundry-vscode-shared';
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

    export function convertTagToLmFeature(tags: string[]): types.api.LlmFeature[] {
        const features: types.api.LlmFeature[] = []

        if (tags.includes("embedding")) {
            features.push("embedding");
        } else {
            features.push("conversational");

            if (tags.includes("vision")) {
                features.push("vision");
            }

            if (tags.includes("tools")) {
                features.push("tools");
            }
        }

        return features;
    }
}

export default OllamaUtils;
