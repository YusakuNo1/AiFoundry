import type { database } from 'aifoundry-vscode-shared';
import type DatabaseManager from '../database/DatabaseManager';
import LmBaseProvider from './LmBaseProvider';
import TestLmProvider from '../testutils/TestLmProvider';
import { createMockDatabaseManager } from '../testutils/mocks';

describe('LmBaseProvider', () => {
    let lmBaseProvider: LmBaseProvider;
    let databaseManager: DatabaseManager

    beforeEach(async () => {
        jest.clearAllMocks();
        databaseManager = createMockDatabaseManager();
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
    });

    it('should return id and name', async () => {
        expect(lmBaseProvider.id).toBe("mock-id");
        expect(lmBaseProvider.name).toBe("mock-name");
    });

    it('should return canHandle', () => {
        expect(lmBaseProvider.canHandle('test')).toBeFalsy();
    });

    it("should return isLocal", () => {
        expect(lmBaseProvider.isLocal).toBeTruthy();
    });

    it('should return listLanguageModels', () => {
        expect(lmBaseProvider.listLanguageModels('all')).toEqual([]);
    });

    it('should return getLmProviderInfo', async () => {
        const result = await lmBaseProvider.getLmProviderInfo(true);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(result).toEqual({ id: 'mock-id', name: 'mock-name', description: 'mock-description', weight: 0, properties: {}, supportUserDefinedModels: false, isLocal: true, modelMap: {}, status: "available" });
    });

    it('should return init', async () => {
        await lmBaseProvider.init();
        expect(lmBaseProvider.id).toBe("mock-id");
        expect(lmBaseProvider.name).toBe("mock-name");
    });

    it('should return isHealthy', async () => {
        const result = await lmBaseProvider.isHealthy();
        expect(result).toBeTruthy();
    });

    it('should return getBaseEmbeddingsModel', async () => {
        const model = await lmBaseProvider.getBaseEmbeddingsModel('test');
        expect(model).toEqual({ "key": "mock-embedding" });
    });

    it('should return getBaseLanguageModel', async () => {
        const model = await lmBaseProvider.getBaseLanguageModel('test');
        expect(model).toEqual({ "key": "mock-chat-model" });
    });

    it('should select updateLmProviderModel for local model provider to update model with URI successfully', async () => {
        const modelInfo: database.LmProviderBaseModelInfo = {
            uri: "mock-id://models/mock-name",
            name: "mock-name",
            providerId: "mock-id",
            features: ["vision"],
            isUserDefined: false
        }
        databaseManager = createMockDatabaseManager(false, { "mock-name": modelInfo });
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
        const updateLmProviderResponse = await lmBaseProvider.updateLmProviderModel("mock-id://models/mock-name?feature=tools", true);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(updateLmProviderResponse.id).toEqual('mock-id');
        const updatedModelInfo = Object.values(updateLmProviderResponse.modelMap)[0] as database.LmProviderBaseModelLocalInfo;
        expect(updatedModelInfo.uri).toEqual("mock-id://models/mock-name");
        expect(updatedModelInfo.features).toEqual(["vision", "tools"]);
        expect(updatedModelInfo.isDownloaded).toEqual(true);
    });

    it('should select updateLmProviderModel for local model provider to add new model with URI and provider flag supportUserDefinedModels successfully', async () => {
        const modelInfo: database.LmProviderBaseModelLocalInfo = {
            uri: "mock-id://models/mock-name",
            name: "mock-name",
            providerId: "mock-id",
            features: ["vision"],
            isUserDefined: false,
            isDownloaded: true,
        }
        databaseManager = createMockDatabaseManager(true, { "mock-name": modelInfo });
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
        const updateLmProviderResponse = await lmBaseProvider.updateLmProviderModel("mock-id://models/mock-name2?feature=tools", true);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(updateLmProviderResponse.id).toEqual('mock-id');

        const modelInfo0 = Object.values(updateLmProviderResponse.modelMap)[0] as database.LmProviderBaseModelLocalInfo;
        expect(modelInfo0.uri).toEqual("mock-id://models/mock-name");
        expect(modelInfo0.features).toEqual(["vision"]);
        expect(modelInfo0.isDownloaded).toEqual(true);
        const modelInfo1 = Object.values(updateLmProviderResponse.modelMap)[1] as database.LmProviderBaseModelLocalInfo;
        expect(modelInfo1.uri).toEqual("mock-id://models/mock-name2");
        expect(modelInfo1.features).toEqual(["tools"]);
        expect(modelInfo1.isDownloaded).toEqual(false);
    });

    it('should deselect updateLmProviderModel for local model provider successfully', async () => {
        const modelInfo: database.LmProviderBaseModelLocalInfo = {
            uri: "mock-id://models/mock-name",
            name: "mock-name",
            providerId: "mock-id",
            features: ["vision"],
            isUserDefined: false,
            isDownloaded: true,
        }
        databaseManager = createMockDatabaseManager(false, { "mock-name": modelInfo });
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
        const updateLmProviderResponse = await lmBaseProvider.updateLmProviderModel("mock-id://models/mock-name?feature=vision", false);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(updateLmProviderResponse.id).toEqual('mock-id');
        expect(Object.values(updateLmProviderResponse.modelMap).length === 1);

        const modelInfo0 = Object.values(updateLmProviderResponse.modelMap)[0] as database.LmProviderBaseModelLocalInfo;
        expect(modelInfo0.uri).toEqual("mock-id://models/mock-name");
        expect(modelInfo0.features).toEqual([]);
        expect(modelInfo0.isDownloaded).toEqual(true);
    });

    it('should deselect updateLmProviderModel for local model provider with user defined flag successfully', async () => {
        const modelInfo: database.LmProviderBaseModelLocalInfo = {
            uri: "mock-id://models/mock-name",
            name: "mock-name",
            providerId: "mock-id",
            features: ["vision"],
            isUserDefined: true,
            isDownloaded: true,
        }
        databaseManager = createMockDatabaseManager(true, { "mock-name": modelInfo });
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
        const updateLmProviderResponse = await lmBaseProvider.updateLmProviderModel("mock-id://models/mock-name?feature=vision", false);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(updateLmProviderResponse.id).toEqual('mock-id');
        expect(Object.values(updateLmProviderResponse.modelMap).length === 0);
    });

    it('should deselect updateLmProviderModel for local model provider failed', async () => {
        const modelInfo: database.LmProviderBaseModelLocalInfo = {
            uri: "mock-id://models/mock-name",
            name: "mock-name",
            providerId: "mock-id",
            features: ["vision"],
            isUserDefined: false,
            isDownloaded: true,
        }
        databaseManager = createMockDatabaseManager(true, { "mock-name": modelInfo });
        lmBaseProvider = new TestLmProvider(databaseManager, true);
        await lmBaseProvider.init();
        const updateLmProviderResponse = await lmBaseProvider.updateLmProviderModel("mock-id://models/mock-name2?feature=vision", false);
        expect(databaseManager.saveDbEntity).toBeCalledTimes(1);
        expect(updateLmProviderResponse.id).toEqual('mock-id');
        expect(Object.values(updateLmProviderResponse.modelMap).length === 1);

        const modelInfo0 = Object.values(updateLmProviderResponse.modelMap)[0] as database.LmProviderBaseModelLocalInfo;
        expect(modelInfo0.uri).toEqual("mock-id://models/mock-name");
        expect(modelInfo0.features).toEqual(["vision"]);
        expect(modelInfo0.isDownloaded).toEqual(true);
    });
});
