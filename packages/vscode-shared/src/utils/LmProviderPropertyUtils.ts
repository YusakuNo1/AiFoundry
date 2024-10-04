import { AIF_PROTOCOL, LmProviderPropValueType } from './consts';
import { LM_PROVIDER_PROP_VALUE_MASK } from '../consts/config';

namespace LmProviderPropertyUtils {
    export function getValueFromValueUri(valueUri: string): string {
        const uri = new URL(valueUri);

        if (uri.protocol !== AIF_PROTOCOL) {
            throw new Error(`Invalid value URI: ${valueUri}`);
        }

        switch (uri.host) {
            case LmProviderPropValueType.Plain:
                return uri.pathname.substring(1);
            case LmProviderPropValueType.Secret:
                return LM_PROVIDER_PROP_VALUE_MASK;
            default:
                throw new Error(`Unsupported value type: ${uri.host}`);
        }
    }
}

export default LmProviderPropertyUtils;
