import type { AgentMetadata } from "../database/AgentMetadata";

export type ListAgentsResponse = {
	agents: AgentMetadata[];
};

export type CreateAgentRequest = Partial<Omit<AgentMetadata, 'id' | 'agentUri'>> & Pick<AgentMetadata, 'basemodelUri'>;

export type UpdateAgentRequest = Partial<Omit<AgentMetadata, "id">> & Pick<AgentMetadata, "agentUri">;

export type CreateOrUpdateAgentResponse = {
    id: string,
    uri: string,
}
