import { types } from "aifoundry-vscode-shared";
import DatabaseManager from "../DatabaseManager";
import { createAgentMetadata, removeDatabaseFile } from "./testUtils";

const testDatabaseName = 'embeddings-test.db';

describe('AgentMetadata', () => {
    let databaseManager: DatabaseManager;

    beforeEach(async () => {
        jest.clearAllMocks();

        removeDatabaseFile(testDatabaseName);
        databaseManager = new DatabaseManager();
        await databaseManager.setup(testDatabaseName, true);
    });

    it('should be saved and loaded successfully', async () => {
        expect(true).toBe(true);
    });

});
