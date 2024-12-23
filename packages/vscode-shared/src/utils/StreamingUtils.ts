import { Observable } from 'rxjs';
import { ApiOutStreamMessage } from '../api/types';

namespace StreamingUtils {
    // Not used in the codebase for now
    export function createErrorObservable(message: string | ApiOutStreamMessage) {
        message = (typeof message === "string") ? {
            type: "error",
            message,
        } : message;

        return new Observable<string>((subscriber) => {
            subscriber.next(JSON.stringify(message));
        });
    }

    // Not used in the codebase for now
    export function convertReadableStreamToObservable(reader: ReadableStreamDefaultReader<Uint8Array> | undefined): Observable<string> {
        if (!reader) {
            return new Observable<string>((subscriber) => {
                subscriber.error("No readable stream");
            });
        }

        return new Observable<string>((subscriber) => {
            async function run() {
                let decoder = new TextDecoder("utf-8");
                while (true) {
                    const result: any = await reader!.read();
                    if (result.done) {
                        break;
                    }

                    if (typeof(result.value) === 'string') {
                        // Maybe this is not a valid case...
                        subscriber.next(result.value);
                    } else {
                        subscriber.next(decoder.decode(result.value));
                    }
                }
                subscriber.complete();
            }

            run().catch((ex) => {
                // As the streaming started, we can only send error message but not send it as an error to subscriber
                subscriber.next(`Error: ${ex}`);
                subscriber.complete();
            });
        });
    }
}

export default StreamingUtils;
