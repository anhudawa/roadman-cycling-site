import fs from "fs";
import path from "path";
import type { GeneratedContent, ReciprocalEdit } from "../types.js";

/**
 * Inject reciprocal links into existing episode files.
 * Returns the list of edits made (for inclusion in the PR).
 */
export function injectReciprocalLinks(
  newEpisodeSlug: string,
  newEpisodeTitle: string,
  linkedSlugs: string[],
  podcastDir: string,
  dryRun: boolean
): ReciprocalEdit[] {
  const edits: ReciprocalEdit[] = [];

  for (const targetSlug of linkedSlugs) {
    const targetPath = path.join(podcastDir, `${targetSlug}.mdx`);
    if (!fs.existsSync(targetPath)) continue;

    let content = fs.readFileSync(targetPath, "utf-8");

    // Check if already links to the new episode
    if (content.includes(`/podcast/${newEpisodeSlug}`)) continue;

    const linkLine = `\n- [${newEpisodeTitle}](/podcast/${newEpisodeSlug})`;

    // Look for existing related section
    const relatedMatch = content.match(
      /^(## (?:You Might Also Like|Related Episodes?|Related))\s*$/m
    );

    if (relatedMatch) {
      // Append to existing section — find the end of the section
      const sectionStart = content.indexOf(relatedMatch[0]);
      const nextHeadingMatch = content
        .slice(sectionStart + relatedMatch[0].length)
        .match(/^## /m);

      if (nextHeadingMatch && nextHeadingMatch.index !== undefined) {
        const insertPos = sectionStart + relatedMatch[0].length + nextHeadingMatch.index;
        content =
          content.slice(0, insertPos).trimEnd() + linkLine + "\n\n" + content.slice(insertPos);
      } else {
        // Section is at the end of the file
        content = content.trimEnd() + linkLine + "\n";
      }

      edits.push({
        targetSlug,
        linkAdded: `/podcast/${newEpisodeSlug}`,
        sectionModified: relatedMatch[1],
      });
    } else {
      // No related section exists — add one before the transcript section if present
      const transcriptMatch = content.match(/^## Transcript/m);
      if (transcriptMatch && transcriptMatch.index !== undefined) {
        const insertPos = transcriptMatch.index;
        const newSection = `## You Might Also Like${linkLine}\n\n`;
        content = content.slice(0, insertPos) + newSection + content.slice(insertPos);
      } else {
        // Append at the end
        content = content.trimEnd() + `\n\n## You Might Also Like${linkLine}\n`;
      }

      edits.push({
        targetSlug,
        linkAdded: `/podcast/${newEpisodeSlug}`,
        sectionModified: "## You Might Also Like (created)",
      });
    }

    if (!dryRun) {
      fs.writeFileSync(targetPath, content);
    } else {
      console.log(`  [dry-run] Would edit ${targetSlug}.mdx — add link to ${newEpisodeSlug}`);
    }
  }

  return edits;
}
