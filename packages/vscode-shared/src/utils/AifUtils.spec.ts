import AifUtils from "./AifUtils";
import { AIF_PROTOCOL } from "../consts/misc";

describe("AifUtils", () => {
    it("createAifUri", () => {
        expect(AifUtils.createAifUri(AIF_PROTOCOL, AifUtils.AifUriCategory.Agents, ["mock-agent-id"])).toBe("aif://agents/mock-agent-id");
        expect(AifUtils.createAifUri(AIF_PROTOCOL, AifUtils.AifUriCategory.Models, ["mock-model-id", "8b"], { "version": "mock-version" })).toBe("aif://models/mock-model-id/8b?version=mock-version");
    });

    it("getAgentId", () => {
        expect(AifUtils.getAgentId("aif://agents/mock-agent-id")).toBe("mock-agent-id");
        expect(AifUtils.getAgentId("aif://models/mock-model-name")).toBe(null);
    });

    it("extractAiUri", () => {
        expect(AifUtils.extractAiUri("aif://agents/mock-agent-id")).toEqual({
            category: AifUtils.AifUriCategory.Agents,
            parts: ["mock-agent-id"],
            parameters: {},
        });

        expect(AifUtils.extractAiUri("aif://models/mock-model-id/8b?version=mock-version")).toEqual({
            category: AifUtils.AifUriCategory.Models,
            parts: ["mock-model-id", "8b"],
            parameters: { "version": "mock-version" },
        });
    });
});
