"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Award, Settings, LogOut, ArrowLeftRight } from "lucide-react";
export default function DashboardNav() {
 const pathname = usePathname();
 const links = [{href:"/dashboard",label:"My track",icon:BookOpen},{href:"/dashboard/certificates",label:"Certificates",icon:Award},{href:"/dashboard/settings",label:"Settings",icon:Settings},{href:"/onboarding?switch=1",label:"Switch track",icon:ArrowLeftRight}];
 return <aside className="zi-dashboard-sidebar"><Link href="/" className="zi-brand" aria-label="ZeroIntern home"><Image src="/icon.png" alt="" width={36} height={36} priority /><span>ZeroIntern</span></Link><p className="zi-eyebrow">Your workspace</p><nav aria-label="Dashboard navigation">{links.map(({href,label,icon:Icon}) => {const active = href === "/dashboard" ? !pathname.startsWith("/dashboard/certificates") && !pathname.startsWith("/dashboard/settings") : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={18} aria-hidden="true" />{label}</Link>;})}</nav><form action="/api/auth/logout" method="post"><button className="zi-btn zi-btn-secondary"><LogOut size={16} aria-hidden="true" />Sign out</button></form></aside>;
}
