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

    export async function createEmbeddings(
        databaseManager: DatabaseManager,
        llm: Embeddings,
        baseModelUri: string,
        files: misc.UploadFileInfo[],
        name: string | undefined,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        const assetId = uuid();
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, assetId);
        const aifVsProvider = Config.VECTOR_STORE_PROVIDER;

        name = name ?? files.map(f => f.fileName).join("-");
        const metadata = new database.EmbeddingMetadata(
            assetId,
            name,
            aifVsProvider,
            baseModelUri,
        );

        const documents = files.map(FileUtils.convertToDocument).filter(d => d !== null) as Document[];
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
        embeddingMetadata: database.EmbeddingMetadata,
        files: misc.UploadFileInfo[] | undefined,
        name: string | undefined,
    ): Promise<api.CreateOrUpdateEmbeddingsResponse> {
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, embeddingMetadata.id);
        const documents = files ? files.map(FileUtils.convertToDocument).filter(d => d !== null) as Document[] : null;

        if (documents) {
            let vectorStore: SaveableVectorStore | null = null;
            if (embeddingMetadata.vs_provider === "faiss") {
                vectorStore = await FaissStore.load(storePath, llm);
                await vectorStore.addDocuments(documents);
                await vectorStore.save(storePath);
            } else if (embeddingMetadata.vs_provider === "chroma") {
                throw new Error("Not implemented");
            } else {
                throw new Error("Invalid vector store provider");
            }    
        }

        if (name) {
            embeddingMetadata.name = name;
            databaseManager.saveDbEntity(embeddingMetadata);
        } else {
            name = embeddingMetadata.name;
        }

        return { id: embeddingMetadata.id, name };
    }

    export async function deleteEmbedding(
        databaseManager: DatabaseManager,
        id: string,
    ): Promise<api.DeleteEmbeddingResponse> {
        const assetsPath = getEmbeddingsAssetPath();
        const storePath = path.join(assetsPath, id);
        fs.rmSync(storePath, { recursive: true });
        databaseManager.deleteDbEntity(database.EmbeddingMetadata.name, id);
        return { id };
    }
}

export default AssetUtils;
