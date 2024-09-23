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
        for (const index of ["test-1", "test-2", "test-3"]) {
            const agentMetadata = createAgentMetadata(index);
            await databaseManager.saveDbModel(agentMetadata);
        }

        const agents = await databaseManager.listAgents();
        expect(agents).toHaveLength(3);
    });

    it('should update string type fields successfully', async () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        await databaseManager.saveDbModel(agentMetadata);

        const stringFieldsToUpdate: string[] = ['name', 'base_model_uri', 'system_prompt'];
        for (const field of stringFieldsToUpdate) {
            const updatedAgentMetadata: types.api.UpdateAgentRequest = {
                agent_uri: `mock_agent_${agentId}_uri`,
                [field]: `New ${field}`,
            }

            await databaseManager.updateAgent(agentId, updatedAgentMetadata);
            const updatedAgent = await databaseManager.getAgent(agentId);
            expect(updatedAgent![field]).toBe(`New ${field}`);
        }
    });

    it('should update array type fields successfully', async () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        await databaseManager.saveDbModel(agentMetadata);

        const arrayFieldsToUpdate: string[] = ['rag_asset_ids', 'function_asset_ids'];
        for (const field of arrayFieldsToUpdate) {
            const updatedAgentMetadata: types.api.UpdateAgentRequest = {
                agent_uri: `mock_agent_${agentId}_uri`,
                [field]: ['Item1', 'Item2'],
            }

            await databaseManager.updateAgent(agentId, updatedAgentMetadata);
            const updatedAgent = await databaseManager.getAgent(agentId);
            expect(updatedAgent![field]).toEqual(['Item1', 'Item2']);
        }
    });

    it('should delete agent successfully', async () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        await databaseManager.saveDbModel(agentMetadata);

        await databaseManager.deleteAgent(agentId);
        const deletedAgent = await databaseManager.getAgent(agentId);
        expect(deletedAgent).toBeNull();
    });
});
