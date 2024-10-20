import type { AgentEntity } from "../database/AgentEntity";

export type ListAgentsResponse = {
	agents: AgentEntity[];
};

export type CreateAgentRequest = Partial<Omit<AgentEntity, 'id' | 'agentUri'>> & Pick<AgentEntity, 'basemodelUri'>;

export type UpdateAgentRequest = Partial<Omit<AgentEntity, "id">> & Pick<AgentEntity, "agentUri">;

export type CreateOrUpdateAgentResponse = {
    id: string,
    uri: string,
}

export type DeleteAgentResponse = {
    id: string,
}
