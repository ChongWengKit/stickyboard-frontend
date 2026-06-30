import type { Metadata } from "next";
import "./globals.css";
import { NotesProvider } from "./context/notesContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "StickyBoard",
  description: "A global place to just place your sticky notes",
};

export default function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-screen w-screen flex flex-col overflow-hidden">
        <NotesProvider>
          {children}
          <Toaster position="top-right" />
        </NotesProvider>
      </body>
    </html>
  );
}