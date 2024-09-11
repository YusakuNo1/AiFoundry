/**
 * Markup for the string in stream
 * 
 * Examples:
 *   https://gist.github.com/cseeman/8f3bfaec084c5c4259626ddd9e516c61
 */

import { COOKIE_AIF_SESSION_ID } from "./misc";

export namespace Markup {
    export const ErrorPrefix = "> [!CAUTION]";

    export namespace Varialbe {
        export const Keys = [COOKIE_AIF_SESSION_ID] as const;
        export type Key = typeof Keys[number];

        export const Create = (key: Key, value: string) => `<${key}>${value}</${key}>`;

        export const GetKeyValue = (s: string): { key: string, value: string } | null => {
            const match = /<([^>]+)>([^<]+)<\/\1>/g.exec(s);
            if (match) {
                return { key: match[1], value: match[2] };
            }
            return null;
        }    
    }
}
