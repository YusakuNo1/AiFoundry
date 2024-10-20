import { Uri } from "vscode";
import type { api } from 'aifoundry-vscode-shared';
import { APIConfig } from "./config";
import { consts } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";
import FileUtils from "../utils/FileUtils";


let formData = new FormData();

namespace EmbeddingsAPI {
    export async function getEmbeddings(): Promise<api.ListEmbeddingsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<api.ListEmbeddingsResponse>);
    }

    export async function createEmbedding(
        aifBasemodelUri: string,
        fileUriList: Uri[],
        name?: string,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(true, aifBasemodelUri, fileUriList, name);
    }

    export async function updateEmbedding(
        aifEmbeddingAssetId: string,
        fileUriList: Uri[],
        name?: string,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(false, aifEmbeddingAssetId, fileUriList, name);
    }

    export async function deleteEmbedding(
        aifEmbeddingAssetId: string,
    ): Promise<void> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings/${aifEmbeddingAssetId}`;

        return fetch(endpoint, {
            method: "DELETE",
        })
            .then(ApiUtils.processApiResponse<void>);
    }

    async function _createOrUpdateEmbedding(
        isCreate: boolean,
        aifBasemodelUriOrAifEmbeddingAssetId: string,
        fileUriList: Uri[],
        name?: string,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings/`;

        formData = new FormData();
        for (const fileUri of fileUriList) {
            const file = await FileUtils.getFile(fileUri);
            formData.append("files", file as any);
        }

        if (name) {
            formData.append("name", name);
        }

        const headers = new Headers();

        if (isCreate) {
            headers.append(consts.HEADER_AIF_BASEMODEL_URI, aifBasemodelUriOrAifEmbeddingAssetId);
        } else {
            headers.append(consts.HEADER_AIF_EMBEDDING_ASSET_ID, aifBasemodelUriOrAifEmbeddingAssetId);
        }

        return fetch(endpoint, {
            method: isCreate ? "POST" : "PUT",
            headers: headers,
            body: formData,
        })
            .then(ApiUtils.processApiResponse<api.CreateOrUpdateEmbeddingsResponse>);
    }
}

export default EmbeddingsAPI;
