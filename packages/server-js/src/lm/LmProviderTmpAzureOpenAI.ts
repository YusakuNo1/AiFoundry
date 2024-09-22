// import { AzureOpenAI } from 'openai';
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// import { MessageContent } from '@langchain/core';

const AZURE_OPENAI_API_DEPLOYMENT_NAME_LLM = "gpt-4o";
const AZURE_OPENAI_API_DEPLOYMENT_NAME_EMBEDDING = "text-embedding-3-small";

function runLm(input: string): Promise<string> {
    const model = new AzureChatOpenAI({
        temperature: 0.9,
        azureOpenAIBasePath: `https://${process.env.AZURE_OPENAI_API_BASE}/openai/deployments/`,
        azureOpenAIApiDeploymentName: AZURE_OPENAI_API_DEPLOYMENT_NAME_LLM,
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        // apiKey: AZURE_OPENAI_API_KEY,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    });

    return model
        .invoke(input)
        .then(response => response.content as string) // TODO: this is MessageContent from @langchain/core, but for some reason this type can't be detected yet
        // .then(console.log)
        // .catch(console.log)
        // .finally(() => {
        //     console.group('-------- END OF THE AZURE VIA LANGCHAIN PACKAGE');
        //     console.groupEnd();
        // });
}

async function runEmbedding(input: string): Promise<string> {
    const embeddings = new AzureOpenAIEmbeddings({
        azureOpenAIBasePath: `https://${process.env.AZURE_OPENAI_API_BASE}/openai/deployments/`,
        azureOpenAIApiDeploymentName: AZURE_OPENAI_API_DEPLOYMENT_NAME_EMBEDDING,
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        maxRetries: 1,
    });

    const text = "LangChain is the framework for building context-aware reasoning applications";

    const vectorstore = await MemoryVectorStore.fromDocuments(
        [{ pageContent: text, metadata: {} }],
        embeddings
    );

    // Use the vector store as a retriever that returns a single document
    const retriever = vectorstore.asRetriever(1);

    // Retrieve the most similar text
    const retrievedDocuments = await retriever.invoke("What is LangChain?");

    return retrievedDocuments[0].pageContent;
}

export { runLm, runEmbedding };
