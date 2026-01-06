"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-ts-border bg-ts-bg-main">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-ts-primary">
              TradeScope
            </h3>
            <p className="mt-3 text-sm text-ts-text-muted max-w-xs">
              A modern crypto trading platform for learning, analyzing,
              and executing trades with confidence.
            </p>
          </div>

          {/* Product */}
          <FooterColumn
            title="Product"
            links={[
              { label: "Markets", href: "/markets" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Paper Trading", href: "/paper-trading" },
              { label: "Pricing", href: "/pricing" },
            ]}
          />

          {/* Company */}
          <FooterColumn
            title="Company"
            links={[
              { label: "About Us", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Careers", href: "/careers" },
              { label: "Contact", href: "/contact" },
            ]}
          />

          {/* Legal */}
          <FooterColumn
            title="Legal"
            links={[
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Risk Disclosure", href: "/risk" },
            ]}
          />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-ts-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ts-text-muted">
            © {new Date().getFullYear()} TradeScope. All rights reserved.
          </p>

          <p className="text-xs text-ts-text-muted text-center md:text-right max-w-md">
            Trading cryptocurrencies involves risk. Trade responsibly and
            only invest what you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ================= SUB COMPONENT ================= */

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-ts-text-muted hover:text-ts-text-main transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
