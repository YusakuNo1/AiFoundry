import { ModelDef } from './types';

const modelDef: ModelDef = {
    version: 1,
    models: [
        {
            "title": "gpt-4o",
            "description": "High-intelligence flagship model for complex, multi-step tasks. GPT-4o is cheaper and faster than GPT-4 Turbo. https://platform.openai.com/docs/models/gpt-4o",
            "tags": [
            ]
        },
        {
            "title": "gpt-4o-mini",
            "description": "Affordable and intelligent small model for fast, lightweight tasks. GPT-4o mini is cheaper and more capable than GPT-3.5 Turbo. https://platform.openai.com/docs/models/gpt-4o-mini",
            "tags": [
            ]
        },
        {
            "title": "gpt-4-turbo",
            "description": "The latest GPT-4 Turbo model with vision capabilities. Vision requests can now use JSON mode and function calling. https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
            "tags": [
            ]
        },
        {
            "title": "gpt-4",
            "description": "https://platform.openai.com/docs/models/gpt-4-turbo-and-gpt-4",
            "tags": [
            ]
        },
        {
            "title": "gpt-3.5-turbo",
            "description": "The latest GPT-3.5 Turbo model with higher accuracy at responding in requested formats. https://platform.openai.com/docs/models/gpt-3-5-turbo",
            "tags": [
            ]
        },
        {
            "title": "text-embedding-3-large",
            "description": "Most capable embedding model for both english and non-english tasks. https://platform.openai.com/docs/models/embeddings",
            "tags": [
                "embedding"
            ]
        },
        {
            "title": "text-embedding-3-small",
            "description": "Increased performance over 2nd generation ada embedding model. https://platform.openai.com/docs/models/embeddings",
            "tags": [
                "embedding"
            ]
        },
        {
            "title": "text-embedding-ada-002",
            "description": "Most capable 2nd generation embedding model, replacing 16 first generation models. https://platform.openai.com/docs/models/embeddings",
            "tags": [
                "embedding"
            ]
        }
    ]
};

export default modelDef;
