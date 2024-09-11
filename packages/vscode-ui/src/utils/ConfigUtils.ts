import { consts } from "aifoundry-vscode-shared";

namespace ConfigUtils {
    export function getConfig(item: consts.AifConfig) {
        const key = `${consts.AifConfigKeyPrefix}${item}`;
        return document.getElementById("root")?.getAttribute(key);
    }
}
export default ConfigUtils;
