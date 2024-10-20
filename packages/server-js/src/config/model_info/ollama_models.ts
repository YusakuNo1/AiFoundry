import { ModelDef } from './types';

const modelDef: ModelDef = {
    version: 1,
    models: [
        {
            "title": "llama3.2",
            "description": "Meta's Llama 3.2 goes small with 1B and 3B models.",
            "tags": [
                "tools",
                "1b",
                "3b"
            ]
        },
        {
            "title": "llama3.1",
            "description": "Llama 3.1 is a new state-of-the-art model from Meta available in 8B, 70B and 405B parameter sizes.",
            "tags": [
                "tools",
                "8b",
                "70b",
                "405b"
            ]
        },
        {
            "title": "gemma2",
            "description": "Google Gemma 2 is a high-performing and efficient model available in three sizes: 2B, 9B, and 27B.",
            "tags": [
                "2b",
                "9b",
                "27b"
            ]
        },
        {
            "title": "qwen2.5",
            "description": "Qwen2.5 models are pretrained on Alibaba's latest large-scale dataset, encompassing up to 18 trillion tokens. The model supports up to 128K tokens and has multilingual support.",
            "tags": [
                "tools",
                "0.5b",
                "1.5b",
                "3b",
                "7b",
                "14b",
                "32b",
                "72b"
            ]
        },
        {
            "title": "phi3.5",
            "description": "A lightweight AI model with 3.8 billion parameters with performance overtaking similarly and larger sized models.",
            "tags": [
                "3b"
            ]
        },
        {
            "title": "nemotron-mini",
            "description": "A commercial-friendly small language model by NVIDIA optimized for roleplay, RAG QA, and function calling.",
            "tags": [
                "tools"
            ]
        },
        {
            "title": "mistral-small",
            "description": "Mistral Small is a lightweight model designed for cost-effective use in tasks like translation and summarization.",
            "tags": [
                "tools",
                "22b"
            ]
        },
        {
            "title": "deepseek-coder-v2",
            "description": "An open-source Mixture-of-Experts code language model that achieves performance comparable to GPT4-Turbo in code-specific tasks.",
            "tags": [
                "code",
                "16b",
                "236b"
            ]
        },
        {
            "title": "codegemma",
            "description": "CodeGemma is a collection of powerful, lightweight models that can perform a variety of coding tasks like fill-in-the-middle code completion, code generation, natural language understanding, mathematical reasoning, and instruction following.",
            "tags": [
                "code",
                "2b",
                "7b"
            ]
        },
        {
            "title": "llava",
            "description": "\ud83c\udf0b LLaVA is a novel end-to-end trained large multimodal model that combines a vision encoder and Vicuna for general-purpose visual and language understanding. Updated to version 1.6.",
            "tags": [
                "vision",
                "7b",
                "13b",
                "34b"
            ]
        },
        {
            "title": "codellama",
            "description": "A large language model that can use text prompts to generate and discuss code.",
            "tags": [
                "code",
                "7b",
                "13b",
                "34b",
                "70b"
            ]
        },
        {
            "title": "nomic-embed-text",
            "description": "A high-performing open embedding model with a large token context window.",
            "tags": [
                "embedding"
            ]
        },
        {
            "title": "mxbai-embed-large",
            "description": "State-of-the-art large embedding model from mixedbread.ai",
            "tags": [
                "embedding"
            ]
        },
        {
            "title": "deepseek-coder",
            "description": "DeepSeek Coder is a capable coding model trained on two trillion code and natural language tokens.",
            "tags": [
                "code",
                "1b",
                "7b",
                "33b"
            ]
        },
        {
            "title": "starcoder2",
            "description": "StarCoder2 is the next generation of transparently trained open code LLMs that comes in three sizes: 3B, 7B and 15B parameters.",
            "tags": [
                "code",
                "3b",
                "7b"
            ]
        },
        {
            "title": "llava-llama3",
            "description": "A LLaVA model fine-tuned from Llama 3 Instruct with better scores in several benchmarks.",
            "tags": [
                "vision",
                "8b"
            ]
        },
        {
            "title": "snowflake-arctic-embed",
            "description": "A suite of text embedding models by Snowflake, optimized for performance.",
            "tags": [
                "embedding",
                "22m",
                "33m"
            ]
        },
        {
            "title": "all-minilm",
            "description": "Embedding models on very large sentence level datasets.",
            "tags": [
                "embedding",
                "22m",
                "33m"
            ]
        },
        {
            "title": "bakllava",
            "description": "BakLLaVA is a multimodal model consisting of the Mistral 7B base model augmented with the LLaVA  architecture.",
            "tags": [
                "vision",
                "7b"
            ]
        },
        {
            "title": "moondream",
            "description": "moondream2 is a small vision language model designed to run efficiently on edge devices.",
            "tags": [
                "vision"
            ]
        },
        {
            "title": "llava-phi3",
            "description": "A new small LLaVA model fine-tuned from Phi 3 Mini.",
            "tags": [
                "vision",
                "3b"
            ]
        },
        {
            "title": "bge-m3",
            "description": "BGE-M3 is a new model from BAAI distinguished for its versatility in Multi-Functionality, Multi-Linguality, and Multi-Granularity.",
            "tags": [
                "embedding"
            ]
        }
    ]
};

export default modelDef;
