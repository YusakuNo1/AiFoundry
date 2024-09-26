import { types } from "aifoundry-vscode-shared";
import DatabaseManager from "../DatabaseManager";
import LmProviderCredentials from "../entities/LmProviderCredentials";
import { createAgentMetadata, removeDatabaseFile } from "./testUtils";

const testDatabaseName = 'baseLmProvider-test.db';

describe('baseLmProvider', () => {
    let databaseManager: DatabaseManager;

    beforeEach(async () => {
        jest.clearAllMocks();

        removeDatabaseFile(testDatabaseName);
        databaseManager = new DatabaseManager();
        await databaseManager.setup(testDatabaseName, true);
    });

    it('should save and load credentials successfully', async () => {
        databaseManager.saveLmProviderCredentials('test-providerId', 'test-apiKey', { testKey1: 'testValue1', testKey2: 'testValue2' });
        const credentials = await databaseManager.getLmProviderCredentials('test-providerId');
        expect(credentials?.id).toBe('test-providerId');
        expect(credentials?.apiKey).toBe('test-apiKey');
        expect(credentials?.properties).toEqual({ testKey1: 'testValue1', testKey2: 'testValue2' });
    });

});
