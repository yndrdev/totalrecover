import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CapitalSure - Universal Construction OS",
  description:
    "Create accountability, schedule certainty, and capital protection for construction projects.",
  keywords: [
    "construction",
    "project management",
    "scheduling",
    "payments",
    "accountability",
  ],
  authors: [{ name: "CapitalSure Team" }],
  creator: "CapitalSure",
  publisher: "CapitalSure",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CapitalSure",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CapitalSure" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3b82f6" />
      </head>
      <body
        className={`${inter.className} font-sans antialiased min-h-screen bg-background text-foreground text-body`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col container-construction">
            <div className="flex-1 grid-construction">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
