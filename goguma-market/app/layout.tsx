import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "고구마마켓 - 우리 동네 중고거래",
  description: "가깝고 따뜻한 당신 근처의 고구마마켓",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}
