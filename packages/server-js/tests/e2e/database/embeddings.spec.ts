import { types } from "aifoundry-vscode-shared";
import DatabaseManager from "../../../src/database/DatabaseManager";
import { createAgentMetadata, removeDatabaseFile } from "../testUtils";

const testDatabaseName = 'test.db';

describe('AgentMetadata', () => {
    let databaseManager: DatabaseManager;

    beforeEach(async () => {
        jest.clearAllMocks();

        removeDatabaseFile(testDatabaseName);
        databaseManager = new DatabaseManager();
        await databaseManager.setup(testDatabaseName, true);
    });

    it('should be saved and loaded successfully', async () => {
    });

});
