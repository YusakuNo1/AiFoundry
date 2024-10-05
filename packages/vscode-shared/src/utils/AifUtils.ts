import { AIF_PROTOCOL } from '../consts/misc';

namespace AifUtils {
    export enum AifUriCategory {
        Agents = "agents",
        Models = "models",
    }
    const AifUriCategories = Object.values(AifUriCategory);

    export function createAifUri(protocol: string, category: AifUriCategory, parts: string | string[], parameters?: Record<string, string>) {
        const partsString = typeof parts === "string" ? [parts] : parts;
        const paramString = (parameters && Object.keys(parameters).length > 0) ? "?" + Object.entries(parameters).map(([key, value]) => `${key}=${value}`).join("&") : "";
        return `${protocol}://${category}/${partsString.join("/")}${paramString}`;
    }

    export function getAgentId(agentUri: string): string | null {
        // Agent is only available for AIF_PROTOCOL
        const extracted = extractAiUri(AIF_PROTOCOL, agentUri);
        if (!extracted || extracted.category !== AifUriCategory.Agents) {
            return null;
        } else {
            return extracted.parts[0];
        }
    }

    export function getModelNameAndVersion(allowProtocol: string, modelUri: string): { modelName: string, version: string | null } | null {
        const extracted = extractAiUri(allowProtocol, modelUri);
        if (!extracted || extracted.category !== AifUriCategory.Models) {
            return null;
        } else {
            const [modelName, version] = extracted.parts;
            return { modelName, version: version || null };
        }
    }

    export function extractAiUri(allowProtocol: string, uri: string): null | { protocol: string, category: AifUriCategory, parts: string[], parameters: Record<string, string> } {
        const [protocol, rest] = uri.split("://");
        if (protocol !== allowProtocol) {
            return null;
        }

        const [category, ...parts] = rest.split("/");
        if (!AifUriCategories.includes(category as AifUriCategory) || parts.length === 0) {
            return null;
        }

        const [partsString, paramString] = parts.join("/").split("?");
        const parameters = paramString ? Object.fromEntries(new URLSearchParams(paramString).entries()) : {};
        return { protocol, category: category as AifUriCategory, parts: partsString.split("/"), parameters };
    }
}

export default AifUtils;
