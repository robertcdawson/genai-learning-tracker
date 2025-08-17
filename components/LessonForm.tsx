"use client";

import { useState } from "react";
import type { Status } from "./types";

type UiLesson = {
  id: string; 
  course?: string; 
  title: string; 
  status: Status; 
  priority: 1|2|3|4|5;
  tags: string[]; 
  notes?: string; 
  estimateMins?: number; 
  actualMins?: number;
  unlockAt?: string; 
  lastReviewedAt?: string; 
  reviewLevel?: number; 
  nextReviewAt?: string;
  createdAt: string; 
  updatedAt: string;
};

interface LessonFormProps {
  onAdd: (lesson: UiLesson) => Promise<void>;
}

export default function LessonForm({ onAdd }: LessonFormProps) {
  const [title, setTitle] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    
    const now = new Date().toISOString();
    onAdd({
      id: crypto.randomUUID(),
      title,
      status: "Todo",
      priority: 3,
      tags: [],
      createdAt: now,
      updatedAt: now,
      reviewLevel: 0
    });
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="card">
      <input 
        placeholder="New lesson…" 
        value={title} 
        onChange={e => setTitle(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}