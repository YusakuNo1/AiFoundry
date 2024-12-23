import { database } from "aifoundry-vscode-shared";
import DatabaseManager from "../DatabaseManager";
import { removeDatabaseFile } from "./testUtils";

const testDatabaseName = 'embeddings-test.db';

describe('AgentEntity', () => {
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        jest.clearAllMocks();
        databaseManager = new DatabaseManager();
        databaseManager.setup(testDatabaseName);
    });

    afterEach(() => {
        removeDatabaseFile(testDatabaseName);
    });

    it('should be saved and loaded the list successfully', () => {
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-1"));
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-2"));
        const embeddings = databaseManager.listEmbeddingsMetadata();
        expect(embeddings).toHaveLength(2);
        expect(embeddings[0].id).toBe("test-1");
        expect(embeddings[0].name).toBe("embedding-test-1");
        expect(embeddings[0].vectorStoreProvider).toBe("vectorStoreProvider-test-1");
        expect(embeddings[0].basemodelUri).toBe("basemodelUri-test-1");
        expect(embeddings[1].id).toBe("test-2");
        expect(embeddings[1].name).toBe("embedding-test-2");
        expect(embeddings[1].vectorStoreProvider).toBe("vectorStoreProvider-test-2");
        expect(embeddings[1].basemodelUri).toBe("basemodelUri-test-2");
    });

    it('should be saved and loaded successfully', () => {
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-1"));
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-2"));
        const embedding = databaseManager.getEmbeddingsMetadata("test-2");
        expect(embedding.id).toBe("test-2");
        expect(embedding.name).toBe("embedding-test-2");
        expect(embedding.vectorStoreProvider).toBe("vectorStoreProvider-test-2");
        expect(embedding.basemodelUri).toBe("basemodelUri-test-2");
    });

    it('should delete successfully', () => {
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-1"));
        databaseManager.saveDbEntity(createEmbeddingMetadata("test-2"));
        databaseManager.deleteEmbeddingsMetadata("test-1");
        const embeddings = databaseManager.listEmbeddingsMetadata();
        expect(embeddings).toHaveLength(1);
        expect(embeddings[0].id).toBe("test-2");

        const result = databaseManager.deleteEmbeddingsMetadata("test-1");
        expect(result).toBeFalsy();
    });
});

function createEmbeddingMetadata(id: string) {
    return new database.EmbeddingEntity(
        id,
        `embedding-${id}`,
        `vectorStoreProvider-${id}`,
        `basemodelUri-${id}`,
    );
}
