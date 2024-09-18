import { Observable } from 'rxjs';
import { consts, types } from 'aifoundry-vscode-shared';
import { APIConfig } from "./config";
import CookiesUtils from "./CookiesUtils";


namespace ChatAPI {
    export function chat(
        input: string,
        files: File[],
        outputFormat: types.api.TextFormat,
        aifSessionId: string | null,
        aifAgentUri: string,
    ): Observable<string> {
        const endpoint = `${APIConfig.getApiEndpoint()}/chat/?outputFormat=${outputFormat}`;
        const headers = new Headers();
        if (aifSessionId) {
            headers.append("Cookie", `${consts.COOKIE_AIF_SESSION_ID}=${aifSessionId}`);
        }
        headers.append(consts.HEADER_AIF_AGENT_URI, aifAgentUri);

        const formData = new FormData();
        formData.append("input", input);      

        // Read files from FileList object "files", and then append them to formData
        if (files) {
            for (const file of files) {
                formData.append("files", file);
            }
        }

        return new Observable<string>((subscriber) => {
            fetch(endpoint, {
                method: "POST",
                headers: headers,
                body: formData,
            }).then(async (response) => {
                function outputError(message: string) {
                    subscriber.next(consts.Markup.ErrorPrefix);
                    subscriber.next(message);
                    subscriber.complete();
                }

                if (!response.ok || !response.body || !response.headers) {
                    outputError("Failed to send chat message");
                    return;
                }
    
                const aifSessionId = CookiesUtils.getCookieFromHeaders(response.headers.getSetCookie(), consts.COOKIE_AIF_SESSION_ID);
                if (aifSessionId) {
                    subscriber.next(consts.Markup.Varialbe.Create(consts.COOKIE_AIF_SESSION_ID, aifSessionId));
                }

                const reader = response.body.getReader();
                if (!reader) {
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
