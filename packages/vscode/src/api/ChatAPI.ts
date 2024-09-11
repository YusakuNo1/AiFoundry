import { Observable } from 'rxjs';
import { consts, types } from 'aifoundry-vscode-shared';
import { APIConfig } from "./config";
import CookiesUtils from "./CookiesUtils";
import ApiUtils from "../utils/ApiUtils";


namespace ChatAPI {
    export function chat(
        isStream: boolean,
        aifSessionId: string | null,
        aifAgentUri: string,
        content: string,
        outputFormat: types.api.TextFormat,
    ): Observable<string> {
        const endpoint = `${APIConfig.getApiEndpoint()}/chat/${isStream ? "stream/" : ""}`;
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        if (aifSessionId) {
            headers.append("Cookie", `${consts.COOKIE_AIF_SESSION_ID}=${aifSessionId}`);
        }
        headers.append(consts.HEADER_AIF_AGENT_URI, aifAgentUri);

        const body = {
            input: content,
            outputFormat,
        };

        return new Observable<string>((subscriber) => {
            fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            }).then(async (response) => {
                function outputError(message: string) {
                    subscriber.next(consts.Markup.ErrorPrefix);
                    subscriber.next(message);
                    subscriber.complete();
                }

                if (!response.ok || !response.body || !response.headers) {
                    // throw new Error("Failed to send chat message");
                    outputError("Failed to send chat message");
                    return;
                }
    
                const aifSessionId = CookiesUtils.getCookieFromHeaders(response.headers.getSetCookie(), consts.COOKIE_AIF_SESSION_ID);
                if (aifSessionId) {
                    subscriber.next(consts.Markup.Varialbe.Create(consts.COOKIE_AIF_SESSION_ID, aifSessionId));
                }

                const reader = response.body.getReader();
                if (!reader) {
                    // throw new Error("Failed to send chat message");
                    outputError("Failed to send chat message");
                    return;
                }
    
                const textDecoder = new TextDecoder();
    
                let value, done;
                do {
                    ({value, done} = await reader.read());
                    value = value ? textDecoder.decode(value) : "";
                    subscriber.next(value);
                } while(!done);

                subscriber.complete();
            });
        });
    }
}

export default ChatAPI;
