import { brandIcon } from "@/lib/pwa/brand-icon";

export const dynamic = "force-static";
export const contentType = "image/png";

export function GET(): Promise<Response> {
  return Promise.resolve(brandIcon(192, true));
}
