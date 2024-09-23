import { AgentMetadata } from "../database/agents";

export type ListAgentsResponse = {
	agents: AgentMetadata[];
};

// CreateAgentRequest should sync with AgentMetadata
export type CreateAgentRequest = {
    base_model_uri: string,
    name?: string,
    system_prompt?: string,
    rag_asset_ids?: string[],
    function_asset_ids?: string[],
}

export type UpdateAgentRequest = {
    agent_uri: string,
    base_model_uri?: string,
    name?: string,
    system_prompt?: string,
    rag_asset_ids?: string[],
    function_asset_ids?: string[],
}

export type CreateOrUpdateAgentResponse = {
    id: string,
    uri: string,
}
