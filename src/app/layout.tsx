import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Willem Dinkelspiel",
  description: "My own corner of the internet",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Script
        defer
        data-domain="keii.dev"
        src="https://plausible.keii.dev/js/script.js"
      />
      <body className="bg-[#f4f4f4]">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
