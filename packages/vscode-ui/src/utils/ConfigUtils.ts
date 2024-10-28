import { consts } from "aifoundry-vscode-shared";

// type Platform = "reactapp" | "vscode-extension";

namespace ConfigUtils {
    export function getConfig(item: consts.AifConfig) {
        const key = `${consts.AifConfigKeyPrefix}${item}`;
        return document.getElementById("root")?.getAttribute(key);
    }

    // export function getPlatform(): Platform {
    //     if (process.env.REACT_APP_AIF_SETUP === "reactapp") {
    //         return "react-app";
    //     } else {
    //         return "vscode-extension";
    //     }
    // }

    export function isAifVsCodeExt() {
        return ConfigUtils.getConfig(consts.AifConfig.mode) === "vscodeext";
    }
}
export default ConfigUtils;
