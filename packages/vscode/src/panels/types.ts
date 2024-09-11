import { IViewProvider } from '../viewProviders/base';

namespace AifPanelTypes {
	export type ViewProviderMap = {
		main: IViewProvider,
		embeddings: IViewProvider,
		agents: IViewProvider,
		functions: IViewProvider,
	}
}

export default AifPanelTypes;
