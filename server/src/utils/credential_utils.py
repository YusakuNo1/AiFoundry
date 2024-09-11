CREDENTIAL_MASK = "*****"

def maskCredential(credential: str) -> str | None:
    return CREDENTIAL_MASK if credential else None
