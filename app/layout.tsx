import type { Metadata } from "next";
import "./globals.css";
import { NotesProvider, type Board } from "./context/notesContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "StickyBoard",
  description: "A global place to just place your sticky notes",
};

async function getBoard(): Promise<Board> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board`, {
      cache: "no-store",
    });
    if (!res.ok) return { notes: [], background: "" };
    const data = await res.json();
    return data.data ?? { notes: [], background: "" };
  } catch {
    return { notes: [], background: "" };
  }
}

export default async function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialBoard = await getBoard();

  return (
    <html lang="en" className="h-full antialiased">
      <body>
        <NotesProvider initialBoard={initialBoard}>
          {children}
          <Toaster position="top-right" />
        </NotesProvider>
      </body>
    </html>
  );
}
