"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function SiteChrome({ navbar, footer, children }: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return <>
    {!isDashboard && pathname !== "/onboarding" && navbar}
    <div id="main-content">{children}</div>
    {pathname === "/" && footer}
  </>;
}
