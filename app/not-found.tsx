import type { Metadata } from "next";
import Link from "next/link";
import ErrorScreen from "@/components/errors/ErrorScreen";
import { errorPages, routes } from "@/constants/id";

export const metadata: Metadata = { title: errorPages.notFound.metaTitle };

export default function NotFound() {
  const t = errorPages.notFound;
  return (
    <ErrorScreen
      code={t.code}
      title={t.title}
      body={t.body}
      actions={<Link className="btn btn-primary" href={routes.afterLogin}>{errorPages.dashboard}</Link>}
    />
  );
}
