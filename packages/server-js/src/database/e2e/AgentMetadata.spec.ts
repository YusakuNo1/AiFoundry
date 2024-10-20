import { api, database } from "aifoundry-vscode-shared";
import DatabaseManager from "../DatabaseManager";
import { removeDatabaseFile } from "./testUtils";

const testDatabaseName = 'agents-test.db';

describe('AgentMetadata', () => {
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        jest.clearAllMocks();
        databaseManager = new DatabaseManager();
        databaseManager.setup(testDatabaseName);
    });

    afterEach(() => {
        removeDatabaseFile(testDatabaseName);
    });

    it('should be saved and loaded successfully', () => {
        for (const index of ["test-1", "test-2", "test-3"]) {
            const agentMetadata = createAgentMetadata(index);
            databaseManager.saveDbEntity(agentMetadata);
        }

        const agents = databaseManager.listAgents();
        expect(agents).toHaveLength(3);
    });

    it('should update string type fields successfully', () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        databaseManager.saveDbEntity(agentMetadata);

        const stringFieldsToUpdate: string[] = ['name', 'basemodelUri', 'systemPrompt'];
        for (const field of stringFieldsToUpdate) {
            const updatedAgentMetadata: api.UpdateAgentRequest = {
                agentUri: `mock_agent_${agentId}_uri`,
                [field]: `New ${field}`,
            }

            databaseManager.updateAgent(agentId, updatedAgentMetadata);
            const updatedAgent = databaseManager.getAgent(agentId);
            expect(updatedAgent![field]).toBe(`New ${field}`);
        }
    });

    it('should update array type fields successfully', () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        databaseManager.saveDbEntity(agentMetadata);

        const arrayFieldsToUpdate: string[] = ['ragAssetIds', 'functionAssetIds'];
        for (const field of arrayFieldsToUpdate) {
            const updatedAgentMetadata: api.UpdateAgentRequest = {
                agentUri: `mock_agent_${agentId}_uri`,
                [field]: ['Item1', 'Item2'],
            }

            databaseManager.updateAgent(agentId, updatedAgentMetadata);
            const updatedAgent = databaseManager.getAgent(agentId);
            expect(updatedAgent![field]).toEqual(['Item1', 'Item2']);
        }
    });

    it('should delete agent successfully', () => {
        const agentId = "test";
        const agentMetadata = createAgentMetadata(agentId);
        databaseManager.saveDbEntity(agentMetadata);

        databaseManager.deleteAgent(agentId);
        const deletedAgent = databaseManager.getAgent(agentId);
        expect(deletedAgent).toBeNull();
    });
});

function createAgentMetadata(id: string) {
    return new database.AgentMetadata(
        id,
        `Mock agent name ${id}`,
        `mock_agent_${id}_uri`,
        `Mock system ${id} prompt`,
        `mock_base_model_${id}_uri`,
        ['1', '2'],
        ['1', '2', '3']
    );
}
