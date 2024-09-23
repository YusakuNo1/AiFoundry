
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

@Entity({ name: 'embeddingmetadata' })
export class EmbeddingMetadata implements IEntity {
    @PrimaryColumn()
    id: string

    @Column()
    name: string

    @Column()
    vs_provider: string

    @Column()
    basemodel_uri: string
}
