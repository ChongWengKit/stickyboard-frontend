"use client";

import { useState, useRef } from "react";
import { useNotes, type Note } from "./context/NotesContext";
import BoardBackground from "./BoardBackground";
import ChatBot from "./components/ChatBot";
import AddNoteModal from "./components/AddNoteModal";

export default function Board() {
  const { board } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowModal(true);
  };

  return (
    <div className="overflow-auto">
      <div
        ref={boardRef}
        className="relative overflow-hidden"
        style={{ width: 3000, height: 2000 }}
        onClick={handleBgClick}
      >
        <BoardBackground />
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

      <ChatBot isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

      <AddNoteModal
        show={showModal}
        clickPos={clickPos}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}