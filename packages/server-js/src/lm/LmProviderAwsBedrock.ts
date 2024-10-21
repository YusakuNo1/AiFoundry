import * as os from 'os';
import * as fs from 'fs';
import { Embeddings } from '@langchain/core/embeddings';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { BedrockEmbeddings } from "@langchain/aws";
import { AifUtils, consts } from 'aifoundry-vscode-shared';
import LmBaseProvider, { GetInitInfoResponse } from './LmBaseProvider';
import { HttpException } from '../exceptions';

const AWS_FOLDER = ".aws";
const AWS_CREDENTIALS_FILE = `${AWS_FOLDER}/credentials`;
const AWS_CONFIG_FILE = `${AWS_FOLDER}/config`;

class LmProviderAwsBedrock extends LmBaseProvider {
    public static readonly ID = "awsbedrock";

    protected async _getInitInfo(): Promise<GetInitInfoResponse> {
        return {
            id: LmProviderAwsBedrock.ID,
            name: "AWS Bedrock",
            description: "",
            weight: 100,
            supportUserDefinedModels: true,
            isLocal: false,
            modelMap: {},
            properties: {},
        };
    }

    public async isHealthy(): Promise<boolean> {
        const { accessKeyId, secretAccessKey } = await this._getCredentials();
        return !!accessKeyId && !!secretAccessKey;
    }

    public async getBaseEmbeddingsModel(aifUri: string): Promise<Embeddings> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const { accessKeyId, secretAccessKey, sessionToken, region } = this._getCredentials();
        return new BedrockEmbeddings({
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
            },
            region,
            model: lmInfo.modelName,
            maxRetries: 1,
        });
    }

    public async getBaseLanguageModel(aifUri: string): Promise<BaseChatModel> {
        const lmInfo = AifUtils.getModelNameAndVersion(this._info.id, aifUri);
        if (!lmInfo) {
            throw new HttpException(400, `Invalid uri ${aifUri}`);
        }

        const { accessKeyId, secretAccessKey, sessionToken, region } = this._getCredentials();
        return new BedrockChat({
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
            },
            region,
            model: lmInfo.modelName,
        });
    }

    private _getCredentials(): {
        accessKeyId: string,
        secretAccessKey: string,
        sessionToken: string | undefined,
        region: string,
    } {
        try {
            const credentials = fs.readFileSync(`${os.homedir()}/${AWS_CREDENTIALS_FILE}`, 'utf8');
            const accessKeyId = credentials.match(/aws_access_key_id = (.*)/)?.[1];
            const secretAccessKey = credentials.match(/aws_secret_access_key = (.*)/)?.[1];
            const sessionToken = credentials.match(/aws_session_token = (.*)/)?.[1];
    
            const config = fs.readFileSync(`${os.homedir()}/${AWS_CONFIG_FILE}`, 'utf8');
            const region = config.match(/region = (.*)/)?.[1];    

            if (!accessKeyId || !secretAccessKey || !region) {
                throw new HttpException(401, "Invalid AWS credentials");
            }

            return {
                accessKeyId,
                secretAccessKey,
                sessionToken,
                region,
            };
        } catch (e) {
            throw new HttpException(401, "Invalid AWS credentials");
        }
    }
}

export default LmProviderAwsBedrock;
