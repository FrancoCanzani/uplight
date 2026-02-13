import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Uplight Documentation",
    template: "%s | Uplight Docs",
  },
  description:
    "Learn how to monitor your services, track incidents, and stay on top of your uptime with Uplight.",
};

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
        Uplight
      </span>
    }
    projectLink="https://github.com/francocanzani/uplight"
  />
);

const footer = (
  <Footer>
    {new Date().getFullYear()} © Uplight. All rights reserved.
  </Footer>
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head faviconGlyph="⚡" />
      <body className={`${sans.variable} ${mono.variable}`}>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/francocanzani/uplight/tree/main/apps/docs"
          footer={footer}
          darkMode={false}
          editLink={null}
          feedback={{ content: null }}
          toc={{ float: false, title: "Contents", backToTop: null }}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
