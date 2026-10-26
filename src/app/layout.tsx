import type { Metadata } from "next";
import { Commissioner, Young_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const heading = Young_Serif({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Commissioner({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Iturrieta",
  description: "Sagardotegia in the Aramaio valley.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
