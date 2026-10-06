import type { ReactNode } from "react";
import { BrandProvider } from "./BrandDialog";
import Header from "./Header";
import { LakuSprite } from "./primitives";
import { Footer } from "./Sections";

/** Header + footer frame shared by the landing and the legal pages. */
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <BrandProvider>
      <LakuSprite />
      <Header />
      {children}
      <Footer />
    </BrandProvider>
  );
}
