import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GetCumulatedCost, getTokenUsage } from "./api/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Endless Content - AI Generated Blog",
  description: "A blog powered by AI to generate endless content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Endless Content</h1>
                </div>
                <div className="flex items-center">
                  <Usage />
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

async function Usage() {
  const usage = await getTokenUsage(new Date());

  const cost = GetCumulatedCost(usage);

  return <span className="text-gray-900">
    Tokens: {cost.input}/{cost.output} {cost.cost}$
  </span>
} 