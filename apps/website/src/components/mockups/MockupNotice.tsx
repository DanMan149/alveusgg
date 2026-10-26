import { type ReactNode } from "react";

import Link from "@/components/content/Link";

import IconArrowRight from "@/icons/IconArrowRight";

// Thin strip shown at the top of every mockup page so reviewers know it isn't live
const MockupNotice = ({ children }: { children?: ReactNode }) => (
  <div className="bg-alveus-green-800 text-alveus-tan">
    <div className="container mx-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 text-sm">
      <p>
        <strong>Design mockup.</strong> Not the live page.
        {children && <> {children}</>}
      </p>
      <Link href="/mockups" dark className="inline-flex items-center gap-1">
        <IconArrowRight className="size-3.5 -scale-x-100" />
        All mockups
      </Link>
    </div>
  </div>
);

export default MockupNotice;
