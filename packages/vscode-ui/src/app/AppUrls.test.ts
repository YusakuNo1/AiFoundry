import AppUrils from "./AppUrls";

test("buildPageUrl", () => {
    expect(AppUrils.buildPageUrl(AppUrils.AifRoute.AgentDetailsPage, ["id-001"])).toBe("/agents/id-001");
    expect(AppUrils.buildPageUrl(AppUrils.AifRoute.EmbeddingDetailsPage, ["id-002"])).toBe("/embeddings/id-002");
    expect(AppUrils.buildPageUrl(AppUrils.AifRoute.FunctionDetailsPage, ["id-003"])).toBe("/functions/id-003");
    expect(AppUrils.buildPageUrl(AppUrils.AifRoute.ModelPlaygroundPage, [])).toBe("/modelPlayground");
    expect(AppUrils.buildPageUrl(AppUrils.AifRoute.LmProviderUpdatePage, ["id-004"])).toBe("/updateLmProvider/id-004");
    expect(() => AppUrils.buildPageUrl(AppUrils.AifRoute.AgentDetailsPage, [])).toThrow();
});
