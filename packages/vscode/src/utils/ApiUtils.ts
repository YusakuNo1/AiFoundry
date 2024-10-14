namespace ApiUtils {
    export function processApiResponse<T>(response: Response): Promise<T> {
        if (response.status === 200 || response.status === 201 || response.status === 204) {
            return response.json() as Promise<T>;
        } else {
            return response.text().then((text) => {
                return Promise.reject(text);
            });
        }
    }

    export function handleApiErrorResponse(response: string | Error, showErrorMessage: any): void {
        if (typeof response === "string") {
            const error = JSON.parse(response);
            showErrorMessage(error.error);
        } else {
            showErrorMessage(response.message ?? response);
        }
    }

    export function apiPoller<T>(apiCall: () => Promise<T>, isSuccess: (res: T) => boolean, interval: number, maxAttempts: number): Promise<T> {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            function failureHandler(error: any) {
                attempts++;
                if (attempts >= maxAttempts) {
                    reject(error);
                } else {
                    setTimeout(poll, interval);
                }
            }

            const poll = async () => {
                try {
                    const response = await apiCall();
                    if (isSuccess(response)) {
                        resolve(response);
                    } else {
                        failureHandler("Max attempts reached");
                    }
                } catch (error) {
                    failureHandler(error);
                }
            };
            poll();
        });
    }
}

export default ApiUtils;
