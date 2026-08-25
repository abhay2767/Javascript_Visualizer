import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JavaScript Code Visualizer",
  description: "Understand JavaScript by watching your code execute.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
