import { Observable } from 'rxjs';
import { types } from 'aifoundry-vscode-shared';

interface ILmManager {
    chat(request: types.api.ChatRequest, aif_session_id: string, aif_agent_uri: string): Observable<string>;
}

export default ILmManager;
