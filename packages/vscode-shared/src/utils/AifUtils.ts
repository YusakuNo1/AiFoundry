import { AIF_PROTOCOL } from '../consts/misc';

namespace AifUtils {
    export enum AifUriValueType {
        Plain = "plain",
        Secret = "secret",
    }

    export enum AifUriCategory {
        Agents = "agents",
        Models = "models",
        Values = "values",
    }
    const AifUriCategories = Object.values(AifUriCategory);

    export function createAifUri(protocol: string, category: AifUriCategory, parts: string | string[], parameters?: Record<string, string>) {
        let partsStrings = typeof parts === "string" ? [parts] : parts;
        partsStrings = partsStrings.map(part => encodeURIComponent(part));
        const paramString = (parameters && Object.keys(parameters).length > 0) ? "?" + Object.entries(parameters).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&") : "";
        return `${protocol}://${category}/${partsStrings.join("/")}${paramString}`;
    }

    // When allowProtocol is null, it will not check the protocol
    export function extractAiUri(allowProtocol: string | null, uri: string): null | { protocol: string, category: AifUriCategory, parts: string[], parameters: Record<string, string> } {
        const [protocol, rest] = uri.split("://");
        if (!!allowProtocol && protocol !== allowProtocol) {
            return null;
        }

        let [category, ...tempParts] = rest.split("/");
        if (!AifUriCategories.includes(category as AifUriCategory) || tempParts.length === 0) {
            return null;
        }

        const [partsString, paramString] = tempParts.join("/").split("?");
        const tempParameters = paramString ? Object.fromEntries(new URLSearchParams(paramString).entries()) : {};

        const parts = partsString.split("/").map(part => decodeURIComponent(part));
        const parameters: Record<string, string> = {};
        for (const [key, value] of Object.entries(tempParameters)) {
            parameters[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return { protocol, category: category as AifUriCategory, parts, parameters };
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

    export function getProtocol(uri: string): string | null {
        const [protocol, rest] = uri.split("://");
        if (!rest) {
            // If there is no rest, then it is not a valid uri
            return null;
        } else {
            return protocol;
        }
    }
}

export default AifUtils;
