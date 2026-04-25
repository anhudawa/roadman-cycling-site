import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { RuleBuilder } from "../_components/RuleBuilder";

export const dynamic = "force-dynamic";

export default async function NewAutomationPage() {
  await requireAuth();
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/automations" className="text-xs text-foreground-subtle hover:text-accent">
          $Üê Automations
        </Link>
        <h1 className="font-heading text-2xl text-off-white tracking-wider uppercase mt-2">
          New Automation Rule
        </h1>
      </div>
      <RuleBuilder mode="create" />
    </div>
  );
}
