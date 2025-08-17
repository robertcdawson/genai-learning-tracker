"use client";

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

interface KPIsProps {
  items: UiLesson[];
}

export default function KPIs({ items }: KPIsProps) {
  const total = items.length;
  const done = items.filter(i => i.status === "Done").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  
  return (
    <div className="card">
      <div>Items: {total} | Done: {done} | Progress: {pct}%</div>
    </div>
  );
}