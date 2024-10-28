import { Observable } from 'rxjs';
import { Config } from './config';
import { Markup } from "../../consts/Markup";
import { TextFormat } from "../types/chat";
import { COOKIE_AIF_SESSION_ID, HEADER_AIF_AGENT_URI } from '../../consts/misc';
import CookiesUtils from "./CookiesUtils";

namespace ChatAPI {
    export function chat(
        input: string,
        files: File[],
        outputFormat: TextFormat,
        aifSessionId: string | null,
        aifAgentUri: string,
    ): Observable<string> {
        const endpoint = `${Config.getApiEndpoint()}/chat/?outputFormat=${outputFormat}`;
        const headers = new Headers();
        if (aifSessionId) {
            headers.append("Cookie", `${COOKIE_AIF_SESSION_ID}=${aifSessionId}`);
        }
        headers.append(HEADER_AIF_AGENT_URI, aifAgentUri);

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
                if (!response.ok || !response.body || !response.headers) {
                    subscriber.error("Failed to get chat message response");
                    subscriber.complete();
                    return;
                }
    
                const aifSessionId = CookiesUtils.getCookieFromHeaders(response.headers.getSetCookie(), COOKIE_AIF_SESSION_ID);
                if (aifSessionId) {
                    subscriber.next(Markup.Varialbe.Create(COOKIE_AIF_SESSION_ID, aifSessionId));
                }

                const reader = response.body.getReader();
                if (!reader) {
                    subscriber.error("Failed to get chat message response");
                    subscriber.complete();
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
            }).catch((error) => {
                subscriber.error(`Failed to get chat message response: ${error}`);
                subscriber.complete();
            });
        });
    }
}

export default ChatAPI;
