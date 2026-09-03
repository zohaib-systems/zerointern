import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb" className="text-sm text-zinc-400"><ol className="flex flex-wrap items-center gap-2">{items.map((item, index) => <li key={item.label} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href} className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-300">{item.label}</Link> : <span aria-current="page" className="text-zinc-200">{item.label}</span>}</li>)}</ol></nav>;
}
