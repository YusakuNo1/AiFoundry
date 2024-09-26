
import { Column, Entity, PrimaryColumn } from "typeorm"
import { types } from "aifoundry-vscode-shared"

@Entity({ name: 'lmproviderinfo' })
class LmProviderInfo implements types.database.IEntity {
    @PrimaryColumn('text')
    id: string  // This is the provider id

    @Column('int')
    defaultWeight: number;

    @Column({ type: 'json' })
    selectedEmbeddingModels: string[];

    @Column({ type: 'json' })
    selectedVisionModels: string[];

    @Column({ type: 'json' })
    selectedToolsModels: string[];
}

export default LmProviderInfo;
