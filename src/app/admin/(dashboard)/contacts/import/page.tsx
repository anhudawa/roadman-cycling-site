import Link from "next/link";
import { requireAuth } from "@/lib/admin/auth";
import { ImportCsvClient } from "./_components/ImportCsvClient";

export const dynamic = "force-dynamic";

export default async function ImportContactsPage() {
  await requireAuth();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl text-off-white tracking-wider">IMPORT CSV</h1>
          <p className="text-sm text-foreground-muted mt-1">
            Upload a CSV to create or update contacts. Map your columns, then import.
          </p>
        </div>
        <Link
          href="/admin/contacts"
          className="px-3 py-2 text-xs font-heading tracking-wider uppercase bg-background-elevated border border-white/10 text-off-white rounded hover:border-coral/40 transition-colors"
        >
          Back to Contacts
        </Link>
      </div>

      <ImportCsvClient />
    </div>
  );
}
