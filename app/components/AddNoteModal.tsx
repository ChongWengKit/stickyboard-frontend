"use client";

import { useState } from "react";
import type { Note } from "../context/NotesContext";
import toast from "react-hot-toast";

const MAX_DESCRIPTION_LENGTH = 500;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

interface AddNoteModalProps {
  show: boolean;
  clickPos: { x: number; y: number };
  onClose: () => void;
}

export default function AddNoteModal({ show, clickPos, onClose }: AddNoteModalProps) {
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;

    const trimmed = description.trim();
    if (!trimmed) {
      toast.error("Description cannot be empty");
      return;
    }
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description must be no longer than ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }
    if (!HEX_COLOR_REGEX.test(selectedColor)) {
      toast.error("Color must be a valid hex color (e.g. #ffffff or #fff)");
      return;
    }

    setSubmitting(true);
    const newNote: Omit<Note, "id"> = {
      x: clickPos.x,
      y: clickPos.y,
      description: trimmed,
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
      toast.success(json.message);
      setDescription("");
      setSelectedColor("#ffffff");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-5 w-80">
        <textarea
          className="w-full h-24 border text-gray-900 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder={`Write your note... (max ${MAX_DESCRIPTION_LENGTH} chars)`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
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
            onClick={onClose}
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
  );
}