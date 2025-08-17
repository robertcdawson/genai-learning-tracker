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
}

export default function LessonTable({ items, onUpdate, filter, showFuture }: LessonTableProps) {
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

  return (
    <div className="card">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Title</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Course</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Status</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Priority</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Tags</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #374151" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id}>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                <div>
                  <strong>{item.title}</strong>
                  {item.notes && (
                    <div style={{ fontSize: "0.875rem", color: "#9CA3AF", marginTop: "4px" }}>
                      {item.notes}
                    </div>
                  )}
                </div>
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                {item.course || "-"}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                <select 
                  value={item.status} 
                  onChange={(e) => handleStatusChange(item.id, e.target.value as Status)}
                  style={{ 
                    padding: "4px 8px", 
                    borderRadius: "4px", 
                    border: "1px solid #374151",
                    backgroundColor: "#1F2937",
                    color: "#E5E7EB"
                  }}
                >
                  <option value="Todo">Todo</option>
                  <option value="Doing">Doing</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                <select 
                  value={item.priority} 
                  onChange={(e) => handlePriorityChange(item.id, parseInt(e.target.value) as 1|2|3|4|5)}
                  style={{ 
                    padding: "4px 8px", 
                    borderRadius: "4px", 
                    border: "1px solid #374151",
                    backgroundColor: "#1F2937",
                    color: "#E5E7EB"
                  }}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {item.tags.map(tag => (
                    <span 
                      key={tag} 
                      style={{ 
                        padding: "2px 6px", 
                        backgroundColor: "#374151", 
                        borderRadius: "12px", 
                        fontSize: "0.75rem" 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #374151" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button 
                    onClick={() => handleMarkReviewed(item.id)}
                    style={{ 
                      padding: "4px 8px", 
                      fontSize: "0.75rem",
                      backgroundColor: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Review
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ 
                      padding: "4px 8px", 
                      fontSize: "0.75rem",
                      backgroundColor: "#DC2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#9CA3AF" }}>
          No lessons found matching your filters.
        </div>
      )}
    </div>
  );
}