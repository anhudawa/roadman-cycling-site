import {
  getResearchAssetCatalog,
  type ResearchAssetKind,
} from "@/data/research-assets";

export function listResearchAssets(
  query?: string,
  kind?: ResearchAssetKind,
) {
  const terms = (query ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1);

  const ranked = getResearchAssetCatalog()
    .filter((asset) => !kind || asset.kind === kind)
    .map((asset) => {
      const searchable = [
        asset.name,
        asset.kind,
        asset.summary,
        asset.methodology,
        ...asset.limitations,
      ]
        .join(" ")
        .toLowerCase();
      const matchScore = terms.reduce(
        (score, term) => score + (searchable.includes(term) ? 1 : 0),
        0,
      );
      return { asset, matchScore };
    })
    .filter(({ matchScore }) => terms.length === 0 || matchScore > 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore || a.asset.name.localeCompare(b.asset.name),
    );

  return {
    schemaVersion: 1,
    definition:
      "Typed Roadman Cycling research and evidence assets. Asset kinds define what each source can and cannot support; always preserve the published limitations.",
    query: query ?? null,
    kind: kind ?? null,
    count: ranked.length,
    assets: ranked.map(({ asset }) => asset),
  };
}
