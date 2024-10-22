import type { database } from 'aifoundry-vscode-shared';
import type DatabaseManager from '../database/DatabaseManager';

function createMockDatabaseManager(supportUserDefinedModels: boolean = false, modelMap: Record<string, database.LmProviderBaseModelInfo> = {}): DatabaseManager {
    const databaseManager = {
        saveDbEntity: jest.fn(),
        // getDbEntity: jest.fn().mockImplementation(() => { throw new Error('Not implemented') }),
        // deleteDbEntity: jest.fn().mockImplementation(() => { throw new Error('Not implemented') }),
        // listDbEntities: jest.fn().mockImplementation(() => { throw new Error('Not implemented') }),
        getLmProviderInfo: jest.fn().mockReturnValue({
            id: 'mock-id',
            name: 'mock-name',
            description: 'mock-description',
            weight: 0,
            properties: {},
            supportUserDefinedModels,
            isLocal: true,
            modelMap,
        }),
    } as unknown as DatabaseManager;
    return databaseManager;    
}

export { createMockDatabaseManager };
