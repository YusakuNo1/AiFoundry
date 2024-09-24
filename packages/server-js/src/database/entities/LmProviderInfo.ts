
import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity({ name: 'lmproviderinfo' })
class LmProviderInfo {
    @PrimaryColumn()
    id: string

    @Column()
    defaultWeight: number;

    @Column({ type: 'json' })
    selectedEmbeddingModels: string[];

    @Column({ type: 'json' })
    selectedVisionModels: string[];

    @Column({ type: 'json' })
    selectedToolsModels: string[];
}

export default LmProviderInfo;
