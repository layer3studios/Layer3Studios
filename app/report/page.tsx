import type { Metadata } from "next";
import { company } from "@/brand";
import SampleReport from "@/components/report/SampleReport";

export const metadata: Metadata = {
  title: `Sample report — ${company.name}`,
  description: "One free review, anonymised and published with permission: the summary, the three things to fix first, every finding with its evidence and fix, and what we did not do.",
};

export default function Page() {
  return <SampleReport />;
}
