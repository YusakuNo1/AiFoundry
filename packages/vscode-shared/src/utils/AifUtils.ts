namespace AifUtils {
    const AIF_PROTOCOL = "aif://";
    const AIF_AGENTS_PREFIX = `${AIF_PROTOCOL}agents/`;

    export function createAifAgentUri(uuid: string) {
        return `${AIF_AGENTS_PREFIX}${uuid}`;
    }

    export function isAifAgentUri(uri: string) {
        return uri.startsWith(AIF_AGENTS_PREFIX);
    }

    export function getAgentId(agentUri: string): string | null {
        if (!isAifAgentUri(agentUri)) {
            return null;
        } else {
            return agentUri.substring(AIF_AGENTS_PREFIX.length);
        }
    }
}

export default AifUtils;
