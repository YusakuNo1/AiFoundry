import DatabaseManager from "../DatabaseManager";
import { removeDatabaseFile } from "./testUtils";

const testDatabaseName = 'baseLmProvider-test.db';

describe('baseLmProvider', () => {
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        jest.clearAllMocks();
        databaseManager = new DatabaseManager();
        databaseManager.setup(testDatabaseName);
    });

    afterEach(() => {
        removeDatabaseFile(testDatabaseName);
    });

    // it('should save and load credentials successfully', () => {
    //     databaseManager.saveLmProviderCredentials('test-providerId', 'test-apiKey', { testKey1: 'testValue1', testKey2: 'testValue2' });
    //     const credentials = databaseManager.getLmProviderCredentials('test-providerId');
    //     expect(credentials?.id).toBe('test-providerId');
    //     expect(credentials?.apiKey).toBe('test-apiKey');
    //     expect(credentials?.properties).toEqual({ testKey1: 'testValue1', testKey2: 'testValue2' });
    // });

    // it ('should list all LmProvider info', () => {
    //     databaseManager.saveLmProviderInfo('test-provider1', 'test-provider1-name', 10, ['testConversationModel1', 'testVisionModel', 'testToolsModel1', 'testToolsModel2'], ['testEmbeddingModel1', 'testEmbeddingModel2'], ['testVisionModel'], ['testToolsModel1', 'testToolsModel2']);
    //     databaseManager.saveLmProviderInfo('test-provider2', 'test-provider2-name', 20, ['testConversationModel2', 'testVisionModel1', 'testVisionModel2', 'testToolsModel'], ['testEmbeddingModel'], ['testVisionModel1', 'testVisionModel2'], ['testToolsModel']);
    //     const lmProviders = databaseManager.listLmProviderInfo();
    //     expect(lmProviders).toHaveLength(2);
    //     expect(lmProviders[0].id).toBe('test-provider1');
    //     expect(lmProviders[0].name).toBe('test-provider1-name');
    //     expect(lmProviders[0].weight).toBe(10);
    //     expect(lmProviders[0].selectedConversationModels).toEqual(['testConversationModel1', 'testVisionModel', 'testToolsModel1', 'testToolsModel2']);
    //     expect(lmProviders[0].selectedEmbeddingModels).toEqual(['testEmbeddingModel1', 'testEmbeddingModel2']);
    //     expect(lmProviders[0].selectedVisionModels).toEqual(['testVisionModel']);
    //     expect(lmProviders[0].selectedToolsModels).toEqual(['testToolsModel1', 'testToolsModel2']);
    //     expect(lmProviders[1].id).toBe('test-provider2');
    //     expect(lmProviders[1].name).toBe('test-provider2-name');
    //     expect(lmProviders[1].weight).toBe(20);
    //     expect(lmProviders[1].selectedConversationModels).toEqual(['testConversationModel2', 'testVisionModel1', 'testVisionModel2', 'testToolsModel']);
    //     expect(lmProviders[1].selectedEmbeddingModels).toEqual(['testEmbeddingModel']);
    //     expect(lmProviders[1].selectedVisionModels).toEqual(['testVisionModel1', 'testVisionModel2']);
    // });
});
