aif_protocol = "aif://"
aif_agents_prefix = f"{aif_protocol}agents/"

def create_aif_agent_uri(uuid: str):
    return f"{aif_agents_prefix}{uuid}"

def is_aif_agent_uri(uri: str):
    return uri.startswith(aif_agents_prefix)
