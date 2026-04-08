"use client";

export function CsvExportButton({ leads }: { leads: { email: string; date: string; source: string }[] }) {
  function handleExport() {
    const headers = "Email,Date,Source\n";
    const rows = leads.map((l) => `"${l.email}","${l.date}","${l.source}"`).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roadman-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={leads.length === 0}
      className="px-3 py-1.5 bg-white/5 text-foreground-muted hover:text-off-white hover:bg-white/10 disabled:opacity-50 text-xs font-medium rounded-lg transition-colors border border-white/10"
    >
      Export CSV
    </button>
  );
}
