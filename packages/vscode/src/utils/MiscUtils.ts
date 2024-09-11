namespace MiscUtils {
    export type PromiseFn = () => Promise<boolean>;

    export async function retryPromise(
        promiseFn: PromiseFn | PromiseFn[],
        maxRetries: number,
        interval: number,
    ): Promise<boolean> {
        if (!Array.isArray(promiseFn)) {
            promiseFn = [promiseFn];
        }

        let result = false;
        for (let j = 0; j < promiseFn.length; j++) {
            result = await _retryPromise(promiseFn[j], maxRetries, interval);
            if (!result) {
                return false;
            }
        }

        return result;
    }

    async function _retryPromise(
        promiseFn: PromiseFn,
        maxRetries: number,
        interval: number,
    ): Promise<boolean> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await promiseFn();
                if (result) {
                    return true;
                }
            } catch (error) {
                // Do nothing here
            }

            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        return false;
    }
}

export default MiscUtils;
