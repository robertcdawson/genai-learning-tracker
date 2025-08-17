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
  const doing = items.filter(i => i.status === "Doing").length;
  
  return (
    <div className="card">
      <div className="hstack" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div className="kpi">
          <div className="kpi-title">Items</div>
          <div className="kpi-value">{total}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Doing</div>
          <div className="kpi-value">{doing}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Done</div>
          <div className="kpi-value">{done}</div>
        </div>
        <div className="kpi" style={{ minWidth: 220, flex: 1 }}>
          <div className="kpi-title hstack" style={{ justifyContent: "space-between" }}>
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="progress" aria-label="progress">
            <div style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}