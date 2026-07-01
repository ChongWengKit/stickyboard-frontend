"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import Pusher from "pusher-js";

export interface Board{
    notes:Note[];
    background:string;
}
export interface    Note {
    id: string;
    x: number;
    y: number;
    description: string;
    color: string;
}


export interface NotesContextValue {
    board: Board;
    isLoading: boolean;
    addNote: (note: Note) => void;
    setBoard: (board: Board) => void;
}


const NotesContext = createContext<NotesContextValue | undefined>(undefined);


interface NotesProviderProps {
    children: ReactNode;
}

export const NotesProvider = ({
    children,
}: NotesProviderProps) => {
    const [board, setBoard] = useState<Board>({ notes: [], background: "" });
    const [isLoading, setLoading] = useState(true);
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/board`)
            .then((res) => res.json())
            .then((data) => setBoard(data.data))
            .finally(() => setLoading(false))
            .catch(() => {});
    }, []);

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1" });
        const channel = pusher.subscribe("board");
        channel.bind("note-added", (note: Note) => {
            addNote(note);
        });
        return () => {
            pusher.unsubscribe("board");
            pusher.disconnect();
        };
    }, []);

    const addNote = useCallback((note: Note) => {
        setBoard((prev) => ({ ...prev, notes: [...(prev.notes || []), note] }));
    }, []);

    
    const value: NotesContextValue = {
        board,
        isLoading,
        addNote,
        setBoard,

    };

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = (): NotesContextValue => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error("useNotes must be used within a NotesProvider");
    }
    return context;
};