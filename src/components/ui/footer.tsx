import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type SocialLink = {
  name: string;
  href: string;
};

type FooterLink = {
  name: string;
  Icon: LucideIcon;
  href?: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type FooterProps = {
  brand: {
    name: string;
    description: string;
  };
  socialLinks: SocialLink[];
  columns: FooterColumn[];
  copyright?: string;
};

export default function Footer({ brand, socialLinks, columns, copyright }: FooterProps) {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Brand — 4 cols on lg */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <span className="text-xl font-serif font-bold text-[#E8748A]">{brand.name}</span>
              <p className="mt-2 text-sm text-stone-500 leading-relaxed max-w-xs">{brand.description}</p>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 text-xs font-medium hover:bg-[#fde8ec] hover:text-[#E8748A] transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns — 8 cols on lg, 2-col sm → 4-col lg grid inside */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => {
                    const href = link.href ?? "#";
                    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
                    const sharedClass = "flex items-center gap-2 text-sm text-stone-500 hover:text-[#E8748A] transition-colors group";
                    const icon = <link.Icon className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#E8748A] transition-colors flex-shrink-0" />;
                    return (
                      <li key={link.name}>
                        {isExternal ? (
                          <a href={href} className={sharedClass} target="_blank" rel="noopener noreferrer">
                            {icon}{link.name}
                          </a>
                        ) : (
                          <Link href={href} className={sharedClass}>
                            {icon}{link.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {copyright && (
          <div className="mt-10 pt-6 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center">{copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}
