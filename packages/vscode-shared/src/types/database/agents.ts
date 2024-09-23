
import { Column, Entity, PrimaryColumn } from "typeorm"
import { IEntity } from "./IEntity"

// AgentMetadata should sync with CreateAgentRequest
@Entity({ name: 'agentmetadata' })
export class AgentMetadata implements IEntity {
    @PrimaryColumn()
    id: string

    @Column()
    agent_uri: string

    @Column()
    name: string

    @Column()
    base_model_uri: string

    @Column({ nullable: true })
    system_prompt: string

    @Column({ type: 'json' })
    rag_asset_ids: string[]

    @Column({ type: 'json' })
    function_asset_ids: string[]
}
