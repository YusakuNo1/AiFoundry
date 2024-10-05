import { AIF_PROTOCOL } from './consts';

namespace AifUtils {
    export enum AifUriCategory {
        Agents = "agents",
        Models = "models",
    }
    const AifUriCategories = Object.values(AifUriCategory);

    export function createAifUri(category: AifUriCategory, parts: string | string[], parameters?: Record<string, string>) {
        const partsString = typeof parts === "string" ? [parts] : parts;
        const paramString = (parameters && Object.keys(parameters).length > 0) ? "?" + Object.entries(parameters).map(([key, value]) => `${key}=${value}`).join("&") : "";
        return `${AIF_PROTOCOL}://${category}/${partsString.join("/")}${paramString}`;
    }

    export function getAgentId(agentUri: string): string | null {
        const extracted = extractAiUri(agentUri);
        if (!extracted || extracted.category !== AifUriCategory.Agents) {
            return null;
        } else {
            return extracted.parts[0];
        }
    }

    export function extractAiUri(uri: string): null | { category: AifUriCategory, parts: string[], parameters: Record<string, string> } {
        const [prefix, rest] = uri.split("://");
        if (prefix !== AIF_PROTOCOL) {
            return null;
        }

        const [category, ...parts] = rest.split("/");
        if (!AifUriCategories.includes(category as AifUriCategory) || parts.length === 0) {
            return null;
        }

        const [partsString, paramString] = parts.join("/").split("?");
        const parameters = paramString ? Object.fromEntries(new URLSearchParams(paramString).entries()) : {};
        return { category: category as AifUriCategory, parts: partsString.split("/"), parameters };
    }
}

export default AifUtils;
