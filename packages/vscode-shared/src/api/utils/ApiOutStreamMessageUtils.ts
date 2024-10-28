import { ApiOutStreamMessage } from "../types/types";

namespace ApiOutStreamMessageUtils {
    const messageFuncMap: Record<string, (message: string) => void> = {};

    export function registerMessageFunc(type: string, func: (message: string) => void) {
        messageFuncMap[type] = func;
    }

    export function show(message: ApiOutStreamMessage) {
        if (messageFuncMap[message.type]) {
            messageFuncMap[message.type](message.message);
        }
    }

    export async function handleResponse(status: number, reader: any): Promise<void> {
        if (!reader) {
            show({ type: "error", message: "Failed to read the response." });
            return;
        }

        return new Promise((resolve) => {
            (async function run() {
                const decoder = new TextDecoder("utf-8");
                let done = false;
                while (!done) {
                    const result: any = await reader!.read();
                    if (result.done) {
                        done = result.done;
                        break;
                    }
    
                    try {
                        const responseString = typeof(result.value) === 'string' ? result.value : decoder.decode(result.value);
                        const json = JSON.parse(responseString);
                        if (status === 200) {
                            show(json);
                        } else {
                            show({ type: "error", message: json.error });
                        }
                    } catch (ex) {
                        show({ type: "error", message: `Failed to parse the response: ${ex}` });
                    }
                }

                resolve();
            })();    
        });
    }
}

export default ApiOutStreamMessageUtils;
