
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

@Entity({ name: 'agentmetadata' })
export class AgentMetadata implements IEntity {
    @PrimaryColumn('text')
    id: string

    @Column('text',{nullable:true})
    agent_uri: string

    @Column('text',{nullable:true})
    name: string

    @Column('text',{nullable:true})
    base_model_uri: string

    @Column({ nullable: true })
    system_prompt: string

    @Column({ type: 'json' })
    rag_asset_ids: string[]

    @Column({ type: 'json' })
    function_asset_ids: string[]
}
