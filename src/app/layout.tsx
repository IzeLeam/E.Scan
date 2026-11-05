import type { Metadata, Viewport } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E.Scan",
  description: "Consultez le prix et le stock d'un produit E.Leclerc en scannant son code-barres.",
  icons: { apple: "/logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#102542",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
      <body className="flex min-h-svh flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
