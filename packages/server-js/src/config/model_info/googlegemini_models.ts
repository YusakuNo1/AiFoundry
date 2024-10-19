import { ModelDef } from './types';

const modelDef: ModelDef = {
    version: 1,
    models: [
        {
            "title": "gemini-1.5-flash",
            "description": "Fast and versatile performance across a diverse variety of tasks. https://ai.google.dev/gemini-api/docs/models/gemini",
            "tags": [
                "tools"
            ]
        },
        {
            "title": "gemini-1.5-pro",
            "description": "Complex reasoning tasks such as code and text generation, text editing, problem solving, data extraction and generation. https://ai.google.dev/gemini-api/docs/models/gemini",
            "tags": [
                "tools"
            ]
        },
        {
            "title": "gemini-1.0-pro",
            "description": "Natural language tasks, multi-turn text and code chat, and code generation. https://ai.google.dev/gemini-api/docs/models/gemini",
            "tags": [
            ]
        },
        {
            "title": "text-embedding-004",
            "description": "Measuring the relatedness of text strings. https://ai.google.dev/gemini-api/docs/models/gemini",
            "tags": [
                "embedding"
            ]
        }
    ]
};

export default modelDef;
