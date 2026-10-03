import type { Metadata } from "next";
import { Bree_Serif, Baloo_2 } from "next/font/google";
import "./globals.css";

const bree = Bree_Serif({ variable: "--font-bree", weight: "400", subsets: ["latin"] });
const logoFace = Baloo_2({ variable: "--font-logo-face", weight: ["700", "800"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Government of Punjab-eStamping Vendor Portal",
  description: "Stamp vendor portal. A learning project, not affiliated with any government body.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bree.variable} ${logoFace.variable} antialiased`}>{children}</body>
    </html>
  );
}
