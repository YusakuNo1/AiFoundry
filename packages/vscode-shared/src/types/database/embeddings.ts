
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

@Entity({ name: 'embeddingmetadata' })
export class EmbeddingMetadata implements IEntity {
    @PrimaryColumn('text')
    id: string

    @Column('text',{nullable:true})
    name: string

    @Column('text',{nullable:true})
    vs_provider: string

    @Column('text',{nullable:true})
    basemodel_uri: string
}
