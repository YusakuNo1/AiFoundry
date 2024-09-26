
import { Column, Entity, PrimaryColumn } from "typeorm"
import { types } from "aifoundry-vscode-shared"

@Entity({ name: 'lmprovidercredentials' })
class LmProviderCredentials implements types.database.IEntity {
    @PrimaryColumn('text')
    id: string  // This is the provider id

    @Column('text',{nullable:true})
    apiKey: string;

    @Column({ type: 'json' })
    properties: Record<string, string>;
}

export default LmProviderCredentials;
