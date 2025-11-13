import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M2 Split - Система распределения комиссий",
  description: "Платформа для управления выплатами и распределением комиссий в сделках с недвижимостью",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
