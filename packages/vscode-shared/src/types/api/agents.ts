import { AgentMetadata } from "../database/agents";

export type ListAgentsResponse = {
	agents: AgentMetadata[];
};

export type CreateAgentRequest = {
    base_model_uri: string,
    name: string | undefined,
    system_prompt: string | undefined,
    rag_asset_ids: string[] | undefined,
    function_asset_ids: string[] | undefined,
}

export type UpdateAgentRequest = {
    agent_uri: string,
    base_model_uri: string | undefined,
    name: string | undefined,
    system_prompt: string | undefined,
    rag_asset_ids: string[] | undefined,
    function_asset_ids: string[] | undefined,
}

export type CreateOrUpdateAgentResponse = {
    id: string,
    uri: string,
}
