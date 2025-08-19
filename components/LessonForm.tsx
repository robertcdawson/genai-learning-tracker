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
  const [course, setCourse] = useState("");
  const [priority, setPriority] = useState<1|2|3|4|5>(3);
  const [tags, setTags] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    
    const now = new Date().toISOString();
    onAdd({
      id: crypto.randomUUID(),
      title,
      course: course || undefined,
      status: "Todo",
      priority,
      tags: tags.split(",").map(t=>t.trim()).filter(Boolean),
      createdAt: now,
      updatedAt: now,
      reviewLevel: 0
    });
    setTitle("");
    setCourse("");
    setPriority(3);
    setTags("");
  }

  return (
    <form onSubmit={submit} className="hstack" style={{ gap: 8, flexWrap: "wrap" }}>
      <input
        placeholder="New lesson…"
        value={title}
        onChange={e => setTitle(e.target.value)}
        aria-label="New lesson title"
      />
      <input
        placeholder="Course (optional)"
        value={course}
        onChange={e => setCourse(e.target.value)}
        aria-label="Course"
      />
      <label className="hstack" style={{ gap: 8 }}>
        <small className="muted" style={{ minWidth: 52 }}>Priority</small>
        <select aria-label="Priority" value={priority} onChange={e=>setPriority(parseInt(e.target.value) as 1|2|3|4|5)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </label>
      <input
        placeholder="tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
        aria-label="Tags"
      />
      <button type="submit" className="btn btn-primary">Add</button>
    </form>
  );
}