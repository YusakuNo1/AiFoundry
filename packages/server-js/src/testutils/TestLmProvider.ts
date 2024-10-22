
import type DatabaseManager from '../database/DatabaseManager';
import LmBaseProvider from '../lm/LmBaseProvider';

class TestLmProvider extends LmBaseProvider {
    private _isHealthy: boolean;

    public constructor(databaseManager: DatabaseManager, isHealthy: boolean) {
        super(databaseManager);
        this._isHealthy = isHealthy;
    }

    protected async _getInitInfo(): Promise<any> {
        return {
            id: 'test-id',
            name: 'test-name',
            description: 'test-description',
            weight: 0,
            properties: {},
            supportUserDefinedModels: false,
            isLocal: true,
            modelMap: {},
        };
    }

    public async isHealthy(): Promise<boolean> {
        return this._isHealthy;
    }

    public async getBaseEmbeddingsModel(aifUri: string): Promise<any> {
        return { "key": "mock-embedding" };
    }

    public async getBaseLanguageModel(aifUri: string): Promise<any> {
        return { "key": "mock-chat-model" };
    }

    protected async _updateLmProviderRuntimeInfo(lmProviderInfo: any): Promise<void> {
        // Do nothing by default
    }
}

export default TestLmProvider;
