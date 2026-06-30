"use client";

import Image from "next/image";
import { useNotes } from "./context/notesContext";

export default function BoardBackground() {
  const { board } = useNotes();

  return (
    <div className="absolute inset-0 -z-10 bg-neutral-700">
      {board.background && (
        <Image
          src={board.background}
          alt="Board background"
          width={3000}
          height={2000}
          priority
          style={{ objectFit: "fill" }}
        />
      )}
    </div>
  );
}