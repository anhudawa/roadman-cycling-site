import type { Metadata } from "next";
import { SCLayoutClient } from "./SCLayoutClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function SCLayout({ children }: { children: React.ReactNode }) {
  return <SCLayoutClient>{children}</SCLayoutClient>;
}
