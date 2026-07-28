import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSubmissionBySlug } from "@/lib/diagnostic/store";
import { APPLY_METADATA, ApplyPageView } from "../../page";

export const metadata: Metadata = {
  ...APPLY_METADATA,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PersonalisedApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let submission = null;
  try {
    submission = await getSubmissionBySlug(slug);
  } catch {
    redirect("/apply");
  }

  if (!submission) redirect("/apply");

  return <ApplyPageView submission={submission} />;
}
