
import { types } from "aifoundry-vscode-shared"

// For LmProviderCredentials, "id" is the provider id
export class LmProviderCredentials extends types.database.BaseEntity {
    public static readonly ENTITY_NAME = "LmProviderCredentials";

    public get version(): number { return 1 };

    constructor(public id: string, public apiKey: string, public properties: Record<string, string>) {
        super(id);
    }
}
