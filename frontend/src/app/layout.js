import "./globals.css"; // Ensure this file exists

export const metadata = {
  title: "My Next.js App",
  description: "A Next.js 15 app with TailwindCSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}