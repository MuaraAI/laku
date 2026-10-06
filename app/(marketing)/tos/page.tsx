import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { legalCommon, routes, tos } from "@/constants/id";

export const metadata: Metadata = { title: tos.metaTitle };

export default function TosPage() {
  return <LegalPage doc={tos} other={{ href: routes.privacy, label: legalCommon.other.tos }} />;
}
