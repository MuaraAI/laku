import type { Metadata } from "next";
import LegalPage from "@/components/landing/LegalPage";
import { legalCommon, privacy, routes } from "@/constants/id";

export const metadata: Metadata = { title: privacy.metaTitle };

export default function PrivacyPage() {
  return <LegalPage doc={privacy} other={{ href: routes.tos, label: legalCommon.other.privacy }} />;
}
