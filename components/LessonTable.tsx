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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editNotes, setEditNotes] = useState("");
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
                  {editingId === item.id ? (
                    <div className="vstack" style={{ gap: 6 }}>
                      <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} aria-label="Title" />
                      <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} aria-label="Notes" placeholder="Notes (optional)" />
                    </div>
                  ) : (
                    <>
                      <strong>{item.title}</strong>
                    </>
                  )}
                  <div className="hstack" style={{ gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {item.unlockAt && new Date(item.unlockAt) > new Date() && (
                      <span className="tag">🔒 Locked until {new Date(item.unlockAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {(!editingId || editingId !== item.id) && item.notes && (
                    <div className="muted" style={{ fontSize: ".875rem", marginTop: 4 }}>
                      {item.notes}
                    </div>
                  )}
                </div>
              </td>
              <td>
                {editingId === item.id ? (
                  <input value={editCourse} onChange={e=>setEditCourse(e.target.value)} aria-label="Course" placeholder="Course" />
                ) : (
                  item.course || "-"
                )}
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
                {editingId === item.id ? (
                  <input value={editTags} onChange={e=>setEditTags(e.target.value)} aria-label="Tags" placeholder="tag1, tag2" />
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {item.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td>
                <div className="hstack" style={{ gap: 6 }}>
                  {editingId === item.id ? (
                    <>
                      <button type="button" className="btn btn-primary" style={{ padding: "6px 10px", fontSize: ".8rem" }}
                        onClick={async ()=>{
                          const base = items.find(i=>i.id===item.id);
                          if(!base) return;
                          const updated: UiLesson = {
                            ...base,
                            title: editTitle || base.title,
                            course: editCourse || undefined,
                            notes: editNotes || undefined,
                            tags: editTags.split(',').map(t=>t.trim()).filter(Boolean)
                          };
                          await onUpdate(updated);
                          setEditingId(null);
                        }}
                      >Save</button>
                      <button type="button" className="btn" style={{ padding: "6px 10px", fontSize: ".8rem" }} onClick={()=>setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="btn" style={{ padding: "6px 10px", fontSize: ".8rem" }}
                      onClick={()=>{ setEditingId(item.id); setEditTitle(item.title); setEditCourse(item.course ?? ""); setEditNotes(item.notes ?? ""); setEditTags(item.tags.join(", ")); }}
                    >Edit</button>
                  )}
                  <button type="button" onClick={() => handleDelete(item.id)} className="btn btn-danger" style={{ padding: "6px 10px", fontSize: ".8rem" }}>
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