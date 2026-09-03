import type { Metadata } from "next";
import { terms, company } from "@/brand";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: `Terms — ${company.name}`,
  description: terms.intro,
};

export default function Page() {
  return <LegalPage page={terms} />;
}
