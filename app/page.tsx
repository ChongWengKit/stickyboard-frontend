"use client";

import { useState, useRef } from "react";
import { useNotes, type Note } from "./context/notesContext";
import BoardBackground from "./BoardBackground";
import ChatBot from "./components/ChatBot";
import toast from "react-hot-toast";

export default function Board() {
  const { board } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [submitting, setSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);


  const handleBgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClickPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDescription("");
    setSelectedColor("#ffffff");
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    const newNote: Omit<Note, "id"> = {
      x: clickPos.x,
      y: clickPos.y,
      description: description,
      color: selectedColor,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save note");
      }
      toast.success(json.message)
      setShowModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-5 w-80"
          >
            <textarea
              className="w-full h-24 border text-gray-900 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Write your note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 border-2 border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600">{selectedColor}</span>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-4 py-1.5 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 text-sm rounded-md bg-blue-800 text-white hover:bg-blue-900 transition disabled:opacity-50"
                onClick={handleConfirm}
                disabled={submitting || description.trim() === ""}
              >
                {submitting ? "Placing..." : "Place"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}