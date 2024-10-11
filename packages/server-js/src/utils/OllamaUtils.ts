import * as express from "express";
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

    export async function listDownloadedModels(): Promise<string[]> {
        const endpoint = `${getHost()}/api/tags`;
        const response = await (await fetch(endpoint)).json();
        return (response as any).models.map((model) => model.name);
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

export default OllamaUtils;
