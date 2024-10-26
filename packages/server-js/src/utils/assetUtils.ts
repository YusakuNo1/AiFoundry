import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuid } from "uuid";
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { SaveableVectorStore } from '@langchain/core/vectorstores';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { api, database, type misc } from 'aifoundry-vscode-shared';
import DatabaseManager from "../database/DatabaseManager";
import Config from '../config';
import ServerConfig from '../config/ServerConfig';
import FileUtils from './FileUtils';


namespace AssetUtils {
    export function getAssetsPath(): string {
        const homedir = os.homedir();
        const projectFolder = ServerConfig.useLocalServer ? Config.AIFOUNDRY_LOCAL_SERVER_FOLDER_NAME : ""
        return path.join(homedir, projectFolder, Config.ASSETS_FOLDER_NAME);
    }

    export function getFunctionsAssetPath() {
        return path.join(getAssetsPath(), Config.FUNCTIONS_FOLDER_NAME);
    }

    export function getEmbeddingsAssetPath() {
        return path.join(getAssetsPath(), Config.EMBEDDINGS_FOLDER_NAME);
    }

    export async function createEmbedding(
        databaseManager: DatabaseManager,
        llm: Embeddings,
        request: api.CreateEmbeddingRequest,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        const assetId = uuid();
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, assetId);
        const aifVsProvider = Config.VECTOR_STORE_PROVIDER;
        const files = request.files ?? [];

        const name: string = request.name ?? files.map(f => f.fileName).join("-");
        const fileNames: string[] = files.map(f => f.fileName);
        const splitterParams: misc.SplitterParams = request.splitterParams ?? {
            splitterType: Config.LanguageModelRag.SPLITTER_TYPE,
            chunkSize: Config.LanguageModelRag.CHUNK_SIZE,
            chunkOverlap: Config.LanguageModelRag.CHUNK_OVERLAP,
        };

        const metadata = new database.EmbeddingEntity(
            assetId,
            name,
            aifVsProvider,
            request.basemodelUri,
            request.description,
            fileNames,
            splitterParams,
            Config.LanguageModelRag.SEARCH_K,
        );

        const documents = await FileUtils.convertToDocuments(files, splitterParams);
        if (aifVsProvider === "faiss") {
            const vectorStore = await FaissStore.fromDocuments(documents, llm);
            await vectorStore.save(storePath);
            databaseManager.saveDbEntity(metadata);
        } else if (aifVsProvider === "chroma") {
            throw new Error("Not implemented");
        } else {
            throw new Error("Invalid vector store provider");
        }

        return { id: assetId, name };
    }

    export async function updateEmbeddings(
        databaseManager: DatabaseManager,
        llm: Embeddings,
        embeddingMetadata: database.EmbeddingEntity,
        request: api.UpdateEmbeddingRequest,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingMetadata.id);

        let shouldSave = false;
        if (request.files && request.files.length > 0) {
            const documents = await FileUtils.convertToDocuments(request.files, embeddingMetadata.splitterParams);
            if (documents.length > 0) {
                let vectorStore: SaveableVectorStore | null = null;
                if (embeddingMetadata.vectorStoreProvider === "faiss") {
                    vectorStore = await FaissStore.load(storePath, llm);
                    await vectorStore.addDocuments(documents);
                    await vectorStore.save(storePath);
                } else if (embeddingMetadata.vectorStoreProvider === "chroma") {
                    throw new Error("Not implemented");
                } else {
                    throw new Error("Invalid vector store provider");
                }    
            }

            const fileNames: string[] = request.files.map(f => f.fileName);
            for (const fileName of fileNames) {
                if (!embeddingMetadata.fileNames.includes(fileName)) {
                    embeddingMetadata.fileNames.push(fileName);
                }
            }
            shouldSave = true;
        }

        if (request.name) {
            embeddingMetadata.name = request.name;
            shouldSave = true;
        }

        if (request.description) {
            embeddingMetadata.description = request.description;
            shouldSave = true;
        }

        if (request.searchTopK) {
            embeddingMetadata.searchTopK = request.searchTopK;
            shouldSave = true;
        }

        if (shouldSave) {
            databaseManager.saveDbEntity(embeddingMetadata);
        }

        return { id: embeddingMetadata.id, name: embeddingMetadata.name };
    }

    export async function deleteEmbedding(
        databaseManager: DatabaseManager,
        id: string,
    ): Promise<api.DeleteEmbeddingResponse> {
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, id);
        fs.rmSync(storePath, { recursive: true });
        databaseManager.deleteDbEntity(database.EmbeddingEntity.name, id);
        return { id };
    }
}

export default AssetUtils;
