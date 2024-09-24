import type { AgentMetadata } from "../database/agents";

export type ListAgentsResponse = {
	agents: AgentMetadata[];
};

export type CreateAgentRequest = Partial<Omit<AgentMetadata, 'id' | 'agent_uri'>> & Pick<AgentMetadata, 'base_model_uri'>;

export type UpdateAgentRequest = Partial<Omit<AgentMetadata, "id">> & Pick<AgentMetadata, "agent_uri">;

export type CreateOrUpdateAgentResponse = {
    id: string,
    uri: string,
}
