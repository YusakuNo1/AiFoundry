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
}

export default ApiUtils;
