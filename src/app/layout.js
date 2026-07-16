import { Poppins, Anton, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "PG Owner | Manage Your Properties",
  description: "Comprehensive PG Management System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PG Owner",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${anton.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

