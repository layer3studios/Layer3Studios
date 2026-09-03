import type { Metadata } from "next";
import { disclosure, company } from "@/brand";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: `Responsible disclosure — ${company.name}`,
  description: disclosure.intro,
};

export default function Page() {
  return <LegalPage page={disclosure} />;
}
