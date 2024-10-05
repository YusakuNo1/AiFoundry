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
}

export default ApiUtils;
