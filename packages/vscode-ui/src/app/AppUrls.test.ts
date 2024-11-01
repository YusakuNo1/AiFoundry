import AppUrls from "./AppUrls";

test("buildPageUrl", () => {
    expect(AppUrls.buildPageUrl(AppUrls.AifRoute.AgentDetailsPage, ["id-001"])).toBe("/agents/id-001");
    expect(AppUrls.buildPageUrl(AppUrls.AifRoute.EmbeddingDetailsPage, ["id-002"])).toBe("/embeddings/id-002");
    expect(AppUrls.buildPageUrl(AppUrls.AifRoute.FunctionDetailsPage, ["id-003"])).toBe("/functions/id-003");
    expect(AppUrls.buildPageUrl(AppUrls.AifRoute.ModelPlaygroundPage, [])).toBe("/modelPlayground");
    expect(AppUrls.buildPageUrl(AppUrls.AifRoute.LmProviderUpdatePage, ["id-004"])).toBe("/updateLmProvider/id-004");
    expect(() => AppUrls.buildPageUrl(AppUrls.AifRoute.AgentDetailsPage, [])).toThrow();
});
