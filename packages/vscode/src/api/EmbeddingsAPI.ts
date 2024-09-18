import { Uri, workspace } from "vscode";
import type { types } from 'aifoundry-vscode-shared';
import { APIConfig } from "./config";
import { File } from "buffer";
import { consts } from 'aifoundry-vscode-shared';
import ApiUtils from "../utils/ApiUtils";
import FileUtils from "../utils/FileUtils";


let formData = new FormData();

namespace EmbeddingsAPI {
    export async function getEmbeddings(): Promise<types.api.ListEmbeddingsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings`;
        return fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(ApiUtils.processApiResponse<types.api.ListEmbeddingsResponse>);
    }

    export async function createEmbedding(
        aifBasemodelUri: string,
        fileUriList: Uri[]
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(true, aifBasemodelUri, fileUriList);
    }

    export async function updateEmbedding(
        aifEmbeddingAssetId: string,
        fileUriList: Uri[],
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        return _createOrUpdateEmbedding(false, aifEmbeddingAssetId, fileUriList);
    }

    export async function updateEmbeddingName(
        aifEmbeddingAssetId: string,
        name: string,
    ): Promise<void> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings/`;

        const headers = new Headers();
        headers.append(consts.HEADER_AIF_EMBEDDING_ASSET_ID, aifEmbeddingAssetId);
        headers.append("Content-Type", "application/json");
        const body = { name };

        return fetch(endpoint, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(body),
        })
            .then(ApiUtils.processApiResponse<void>);
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
        fileUriList: Uri[]
    ): Promise<types.api.CreateOrUpdateEmbeddingsResponse> {
        const endpoint = `${APIConfig.getApiEndpoint()}${consts.ADMIN_CTRL_PREFIX}/embeddings/files/`;

        formData = new FormData();
        for (const fileUri of fileUriList) {
            const file = FileUtils.getFile(fileUri);
            formData.append("files", file as any);
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
            .then(ApiUtils.processApiResponse<types.api.CreateOrUpdateEmbeddingsResponse>);
    }
}

export default EmbeddingsAPI;
