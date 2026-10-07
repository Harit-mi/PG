import { Space_Grotesk, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "PGPlus // The Cyber-Physical Operating System for Indian Living Spaces",
  description: "Eliminate empty bed revenue leaks, automate WhatsApp rent collections, and orchestrate multi-branch PGs on autopilot.",
  keywords: "PGPlus software, hostel management India, rent collection app, WhatsApp rent reminder, PG owner app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PGPlus",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${sora.variable} ${jetbrains.variable}`}>
      <head>
                        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

