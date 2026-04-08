"use client";

export function CsvExportButton({
  charges,
}: {
  charges: { id: string; description: string | null; amount: number; currency: string; created: number }[];
}) {
  function handleExport() {
    const headers = "Description,Amount,Currency,Date\n";
    const rows = charges
      .map((c) => {
        const amount = (c.amount / 100).toFixed(2);
        const date = new Date(c.created * 1000).toISOString().split("T")[0];
        const desc = c.description ?? "Stripe charge";
        return `"${desc}",${amount},${c.currency.toUpperCase()},${date}`;
      })
      .join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadman-revenue-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={charges.length === 0}
      className="px-3 py-1.5 bg-white/5 text-foreground-muted hover:text-off-white hover:bg-white/10 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors border border-white/10"
    >
      Export CSV
    </button>
  );
}
