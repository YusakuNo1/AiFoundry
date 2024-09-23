
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

// function createAgentMetadata(id: string, agent_uri: string, request: types.api.CreateAgentRequest) {
//     const agentMetadata = new AgentMetadata();
//     agentMetadata.id = id;
//     agentMetadata.agent_uri = agent_uri;
//     agentMetadata.name = request.name || '';
//     agentMetadata.base_model_uri = request.base_model_uri;
//     agentMetadata.system_prompt = request.system_prompt || '';
//     agentMetadata.rag_asset_ids = request.rag_asset_ids || [];
//     agentMetadata.function_asset_ids = request.function_asset_ids || [];
//     return agentMetadata;
// }
