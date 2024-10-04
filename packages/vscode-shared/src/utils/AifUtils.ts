import { AIF_AGENTS_PREFIX } from './consts';

namespace AifUtils {
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
