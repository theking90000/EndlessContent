import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GetCumulatedCost, getTokenUsage } from "./api/utils";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Endless Content - AI Generated Blog",
  description: "A blog powered by AI to generate endless content",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50 text-black">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link prefetch={false} href="/">
                  <h1 className="text-xl font-bold text-gray-900">Endless Content</h1>
                  </Link>
                </div>
                <div className="flex items-center">
                  <Link prefetch={false} href="/usage" className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200">Usage</Link>
                </div>
              </div>
            </div>
          </nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

