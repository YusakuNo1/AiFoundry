import { LmProviderProperty } from "../database/LmProviderEntity";
import AifUtils from "./AifUtils";

namespace LmProviderPropertyUtils {
    export async function getPropertyValue(property: LmProviderProperty | undefined): Promise<string | null> {
        if (!property) {
            return null;
        }

        const valueUriInfo = AifUtils.extractAiUri(null, property.valueUri ?? "");
        const category = valueUriInfo?.category;
        if (category !== AifUtils.AifUriCategory.Values || valueUriInfo?.parts.length !== 2) {
            return null;
        }

        const valueType = valueUriInfo.parts[0];
        const value = valueUriInfo.parts[1];

        if (valueType !== AifUtils.AifUriValueType.Secret && valueType !== AifUtils.AifUriValueType.Plain) {
            return null;
        }

        return value;
    }
}

export default LmProviderPropertyUtils;
