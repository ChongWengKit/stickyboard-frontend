"use client";

import { useNotes, type Note } from "../context/notesContext";

export default function SnapshotPage() {
  const { board } = useNotes();

  return (
    <div className="relative w-[3000px] h-[2000px]">
      <style>{`
        body {
          background: transparent !important;
        }
      `}</style>
      {board.notes?.map((note: Note) => (
        <div
          key={note.id}
          className="sticky-note absolute p-3 rounded-lg shadow-lg"
          style={{
            left: note.x,
            top: note.y,
            backgroundColor: note.color,
          }}
        >
          <p className="text-sm text-gray-900 font-medium break-words whitespace-pre-wrap">{note.description}</p>
        </div>
      ))}
    </div>
  );
}