import type { Metadata } from "next";
import { privacy, company } from "@/brand";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: `Privacy — ${company.name}`,
  description: privacy.intro,
};

export default function Page() {
  return <LegalPage page={privacy} />;
}
