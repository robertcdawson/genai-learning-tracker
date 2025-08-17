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

type Filter = {
  q: string;
  status: "All" | Status;
  tag: string;
  overdueOnly: boolean;
};

interface LessonTableProps {
  items: UiLesson[];
  onUpdate: (lesson: UiLesson) => Promise<void>;
  filter: Filter;
  showFuture: boolean;
  sortBy?: "updated" | "priority" | "status" | "title";
}

export default function LessonTable({ items, onUpdate, filter, showFuture, sortBy = "updated" }: LessonTableProps) {
  const filteredItems = items.filter(item => {
    // Text search
    if (filter.q && !item.title.toLowerCase().includes(filter.q.toLowerCase()) && 
        !(item.course?.toLowerCase().includes(filter.q.toLowerCase()))) {
      return false;
    }
    
    // Status filter
    if (filter.status !== "All" && item.status !== filter.status) {
      return false;
    }
    
    // Tag filter
    if (filter.tag && !item.tags.includes(filter.tag)) {
      return false;
    }
    
    // Overdue review filter
    if (filter.overdueOnly) {
      if (!item.nextReviewAt) return false;
      const nextReview = new Date(item.nextReviewAt);
      if (nextReview > new Date()) return false;
    }
    
    // Future lessons filter
    if (!showFuture && item.unlockAt) {
      const unlockDate = new Date(item.unlockAt);
      if (unlockDate > new Date()) return false;
    }
    
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: Status) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    await onUpdate({
      ...item,
      status: newStatus
    });
  };

  const handlePriorityChange = async (id: string, newPriority: 1|2|3|4|5) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    await onUpdate({
      ...item,
      priority: newPriority
    });
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    await onUpdate({
      ...item,
      _delete: true
    } as any);
  };

  const handleMarkReviewed = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    const now = new Date();
    const reviewLevel = (item.reviewLevel || 0) + 1;
    const intervals = [1, 2, 4, 7, 14, 30, 60];
    const nextReviewDays = intervals[Math.min(reviewLevel - 1, intervals.length - 1)];
    const nextReviewAt = new Date(now.getTime() + nextReviewDays * 24 * 60 * 60 * 1000);
    
    await onUpdate({
      ...item,
      lastReviewedAt: now.toISOString(),
      reviewLevel,
      nextReviewAt: nextReviewAt.toISOString()
    });
  };

  const sortedItems = [...filteredItems].sort((a,b) => {
    switch (sortBy) {
      case "priority": return (b.priority ?? 0) - (a.priority ?? 0);
      case "status": return a.status.localeCompare(b.status);
      case "title": return a.title.localeCompare(b.title);
      case "updated": default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Course</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map(item => (
            <tr key={item.id}>
              <td>
                <div>
                  <strong>{item.title}</strong>
                  <div className="hstack" style={{ gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {item.unlockAt && new Date(item.unlockAt) > new Date() && (
                      <span className="tag">🔒 Locked until {new Date(item.unlockAt).toLocaleDateString()}</span>
                    )}
                    {item.nextReviewAt && new Date(item.nextReviewAt) <= new Date() && (
                      <span className="tag">🕒 Due for review</span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="muted" style={{ fontSize: ".875rem", marginTop: 4 }}>
                      {item.notes}
                    </div>
                  )}
                </div>
              </td>
              <td>
                {item.course || "-"}
              </td>
              <td>
                <select 
                  value={item.status} 
                  onChange={(e) => handleStatusChange(item.id, e.target.value as Status)}
                  
                >
                  <option value="Todo">Todo</option>
                  <option value="Doing">Doing</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </td>
              <td>
                <select 
                  value={item.priority} 
                  onChange={(e) => handlePriorityChange(item.id, parseInt(e.target.value) as 1|2|3|4|5)}
                  
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </td>
              <td>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {item.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div className="hstack" style={{ gap: 6 }}>
                  <button onClick={() => handleMarkReviewed(item.id)} className="btn btn-success" style={{ padding: "6px 10px", fontSize: ".8rem" }}>
                    Review
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: "6px 10px", fontSize: ".8rem" }}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedItems.length === 0 && (
        <div className="empty">No lessons found matching your filters.</div>
      )}
    </div>
  );
}