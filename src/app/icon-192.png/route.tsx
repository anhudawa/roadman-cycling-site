import { brandIcon } from "@/lib/pwa/brand-icon";

export const dynamic = "force-static";

export function GET(): Promise<Response> {
  return Promise.resolve(brandIcon(192, false));
}
