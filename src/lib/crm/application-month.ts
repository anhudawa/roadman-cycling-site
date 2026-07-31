const APPLICATION_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isApplicationMonth(value: unknown): value is string {
  return (
    typeof value === "string" &&
    APPLICATION_MONTH_PATTERN.test(value)
  );
}

export function formatApplicationMonth(value: string): string {
  if (!isApplicationMonth(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
