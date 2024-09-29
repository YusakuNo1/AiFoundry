// import { Embeddings } from '@langchain/core/embeddings';
// import { OllamaEmbeddings } from "@langchain/ollama";
// import DatabaseManager from '../database/DatabaseManager';
// import LmBaseProvider from './LmBaseProvider';
// import { HttpException } from '../exceptions';

// class LmProviderOllama extends LmBaseProvider {
//     public static readonly ID = "ollama";

//     constructor(databaseManager: DatabaseManager) {
//         super(databaseManager, {
//             id: LmProviderOllama.ID,
//             name: "Ollama",
//             description: null,
//             jsonFileName: "model_info/ollama_models.json",
//             keyPrefix: "OLLAMA_",
//             apiKeyDescription: null,
//             apiKeyHint: null,
//             supportUserDefinedModels: false,
//         });
//     }

//     public getBaseEmbeddingsModel(aifUri: string): Embeddings {
//         const lmInfo = this._parseLmUri(aifUri);
//         const credentials = this._databaseManager.getLmProviderCredentials(this.id);
//         if (!lmInfo || !credentials) {
//             throw new HttpException(400, "Invalid uri or credentials not found");
//         }

//         const llm = new OllamaEmbeddings({
//             model: lmInfo.modelName,
//         });

//         return llm;
//     }
// }

// export default LmProviderOllama;
export const a = 0;
