import { ListEmbeddingsResponse, CreateOrUpdateEmbeddingsResponse } from "aifoundry-vscode-shared/dist/api/types/embeddings";
import { ADMIN_CTRL_PREFIX, HEADER_AIF_BASEMODEL_URI, HEADER_AIF_EMBEDDING_ASSET_ID } from "aifoundry-vscode-shared/dist/consts/misc";
import { Config } from "./config";
import ApiUtils from "./ApiUtils";

namespace EmbeddingsAPI {
    export async function getEmbeddings(): Promise<ListEmbeddingsResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/embeddings`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<ListEmbeddingsResponse>);
    }

    export async function createEmbedding(
        aifBasemodelUri: string,
        files: File[],
        name?: string,
    ): Promise<CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(true, aifBasemodelUri, files, name);
    }

    export async function updateEmbedding(
        aifEmbeddingAssetId: string,
        files: File[],
        name?: string,
        searchTopK?: number,
    ): Promise<CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(false, aifEmbeddingAssetId, files, name, searchTopK);
    }

    export async function deleteEmbedding(
        aifEmbeddingAssetId: string,
    ): Promise<void> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/embeddings/${aifEmbeddingAssetId}`;

        return fetch(endpoint, {
            method: "DELETE",
        })
            .then(ApiUtils.processApiResponse<void>);
    }

    async function _createOrUpdateEmbedding(
        isCreate: boolean,
        aifBasemodelUriOrAifEmbeddingAssetId: string,
        files: File[],
        name?: string,
        searchTopK?: number,
    ): Promise<CreateOrUpdateEmbeddingsResponse> {
        const endpoint = `${Config.getApiEndpoint()}${ADMIN_CTRL_PREFIX}/embeddings/`;

        const formData = new FormData() as any;
        for (const file of files) {
            formData.append("files", file as any);
        }

        if (name) {
            formData.append("name", name);
        }

        if (searchTopK) {
            formData.append("searchTopK", searchTopK.toString());
        }

        const headers = new Headers();

        if (isCreate) {
            headers.append(HEADER_AIF_BASEMODEL_URI, aifBasemodelUriOrAifEmbeddingAssetId);
        } else {
            headers.append(HEADER_AIF_EMBEDDING_ASSET_ID, aifBasemodelUriOrAifEmbeddingAssetId);
        }

        return fetch(endpoint, {
            method: isCreate ? "POST" : "PUT",
            headers: headers,
            body: formData,
        })
            .then(ApiUtils.processApiResponse<CreateOrUpdateEmbeddingsResponse>);
    }
}

export default EmbeddingsAPI;
