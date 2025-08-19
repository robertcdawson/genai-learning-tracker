"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import KPIs from "@/components/KPIs";
import LessonForm from "@/components/LessonForm";
import LessonTable from "@/components/LessonTable";
import type { Status } from "@/components/types";
import AuthGate from "@/components/AuthGate";

type DbLesson = {
  id: string;
  user_id: string;
  title: string;
  course: string | null;
  status: "Todo" | "Doing" | "Done" | "Blocked";
  priority: number | null;
  tags: string[];          // jsonb[]
  notes: string | null;
  estimate_mins: number | null;
  actual_mins: number | null;
  unlock_at: string | null;
  last_reviewed_at: string | null;
  review_level: number | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

type UiLesson = {
  id: string; course?: string; title: string; status: Status; priority: 1|2|3|4|5;
  tags: string[]; notes?: string; estimateMins?: number; actualMins?: number;
  unlockAt?: string; lastReviewedAt?: string; reviewLevel?: number; nextReviewAt?: string;
  createdAt: string; updatedAt: string;
};

const supabase = createClient();

function mapDbToUi(x: DbLesson): UiLesson {
  return {
    id: x.id,
    title: x.title,
    course: x.course ?? undefined,
    status: x.status,
    priority: (x.priority ?? 3) as 1|2|3|4|5,
    tags: x.tags ?? [],
    notes: x.notes ?? undefined,
    estimateMins: x.estimate_mins ?? undefined,
    actualMins: x.actual_mins ?? undefined,
    unlockAt: x.unlock_at ?? undefined,
    lastReviewedAt: x.last_reviewed_at ?? undefined,
    reviewLevel: x.review_level ?? 0,
    nextReviewAt: x.next_review_at ?? undefined,
    createdAt: x.created_at,
    updatedAt: x.updated_at,
  };
}

function mapUiToDb(user_id: string, l: UiLesson): Partial<DbLesson> {
  return {
    user_id,
    title: l.title,
    course: l.course ?? null,
    status: l.status,
    priority: l.priority,
    tags: l.tags ?? [],
    notes: l.notes ?? null,
    estimate_mins: l.estimateMins ?? null,
    actual_mins: l.actualMins ?? null,
    unlock_at: l.unlockAt ?? null,
    last_reviewed_at: l.lastReviewedAt ?? null,
    review_level: l.reviewLevel ?? 0,
    next_review_at: l.nextReviewAt ?? null,
  };
}

export default function Page() {
  const [items, setItems] = useState<UiLesson[]>([]);
  const [showFuture, setShowFuture] = useState(true);
  const [filter, setFilter] = useState<{q:string; status: "All"|Status; tag:string; overdueOnly:boolean}>({ q:"", status:"All", tag:"", overdueOnly:false });
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Load lessons when user available
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) { console.error(error); return; }
      setItems((data ?? []).map(mapDbToUi));
    })();
  }, [userId]);

  async function addItem(item: UiLesson) {
    if (!userId) return;
    const payload = mapUiToDb(userId, item);
    const { data, error } = await supabase.from("lessons").insert(payload).select().single();
    if (error) { console.error(error); return; }
    setItems(prev => [mapDbToUi(data as DbLesson), ...prev]);
  }

  async function updateItem(next: UiLesson) {
    if ((next as any)._delete) return deleteItem(next.id);
    const { data, error } = await supabase
      .from("lessons")
      .update(mapUiToDb(userId!, next))
      .eq("id", next.id)
      .select()
      .single();
    if (error) { console.error(error); return; }
    setItems(prev => prev.map(i => i.id === next.id ? mapDbToUi(data as DbLesson) : i));
  }

  async function deleteItem(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { console.error(error); return; }
    setItems(prev => prev.filter(i => i.id !== id));
  }

  // Export functionality
  function exportToJSON() {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learning-tracker-export.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import functionality with bulk insert
  async function importFromJSON(event: React.ChangeEvent<HTMLInputElement>) {
    if (!userId || !event.target.files?.[0]) return;
    
    const file = event.target.files[0];
    const text = await file.text();
    
    try {
      let parsed = JSON.parse(text) as any;

      // Support both raw array and object wrappers like { items: [...] }
      const arr: any[] = Array.isArray(parsed) ? parsed : (parsed?.items || parsed?.lessons || []);
      if (!Array.isArray(arr) || arr.length === 0) {
        alert("Import failed: no lessons found in the selected file.");
        return;
      }

      // Normalize shape: tolerate different key names and provide defaults
      const normalized: UiLesson[] = arr.map((x, i) => {
        const nowIso = new Date().toISOString();
        return {
          id: x.id || crypto.randomUUID(),
          title: String(x.title ?? x.name ?? `Imported ${i+1}`),
          course: x.course ?? x.courseName ?? undefined,
          status: (x.status ?? "Todo") as Status,
          priority: (Number(x.priority ?? 3) as 1|2|3|4|5),
          tags: Array.isArray(x.tags) ? x.tags : String(x.tags ?? "").split(",").map((t:string)=>t.trim()).filter(Boolean),
          notes: x.notes ?? undefined,
          estimateMins: x.estimateMins ?? x.estimate_mins ?? undefined,
          actualMins: x.actualMins ?? x.actual_mins ?? undefined,
          unlockAt: x.unlockAt ?? x.unlock_at ?? undefined,
          lastReviewedAt: x.lastReviewedAt ?? x.last_reviewed_at ?? undefined,
          reviewLevel: x.reviewLevel ?? x.review_level ?? 0,
          nextReviewAt: x.nextReviewAt ?? x.next_review_at ?? undefined,
          createdAt: x.createdAt ?? x.created_at ?? nowIso,
          updatedAt: x.updatedAt ?? x.updated_at ?? nowIso,
        };
      });

      // Map UI lessons to DB format and bulk insert
      const dbLessons = normalized.map(lesson => mapUiToDb(userId, lesson));

      const { data, error } = await supabase
        .from("lessons")
        .insert(dbLessons)
        .select();
      
      if (error) { 
        console.error('Import error:', error); 
        alert(`Import failed: ${error.message}`);
        return; 
      }
      
      // Refresh the items list to show imported data
      const { data: refreshedData, error: refreshError } = await supabase
        .from("lessons")
        .select("*")
        .order("updated_at", { ascending: false });
      
      if (refreshError) { 
        console.error(refreshError); 
        alert(`Imported ${data?.length ?? 0} item(s), but refresh failed: ${refreshError.message}`);
        return; 
      }
      
      setItems((refreshedData ?? []).map(mapDbToUi));
      alert(`Imported ${data?.length ?? 0} lesson(s).`);
      
      // Reset the file input
      event.target.value = '';
      
    } catch (error) {
      console.error('JSON parsing error:', error);
      alert('Import failed: invalid JSON.');
    }
  }

  // Tag list for filter
  const tags = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) for (const t of it.tags) s.add(t);
    return [...s];
  }, [items]);

  return (
    <AuthGate>
      <div className="container vstack" style={{ gap: 16 }}>
        <header className="vstack" style={{ gap: 4 }}>
          <h1 style={{ margin: 0 }}>Learning Tracker</h1>
          <small>Synced with Supabase (RLS-protected per user).</small>
        </header>

        <KPIs items={items} />

        <section className="card vstack">
          <div className="section-heading">
            <h3 style={{ marginTop: 0 }}>Add lesson</h3>
          </div>
          <LessonForm onAdd={addItem} />
        </section>

        <section className="card vstack">
          <div className="section-heading" style={{ flexWrap: "wrap" }}>
            <div className="filters">
              <input placeholder="Search…" value={filter.q} onChange={e=>setFilter({...filter, q: e.target.value})} />
              <select value={filter.status} onChange={e=>setFilter({...filter, status: e.target.value as any})}>
                {["All","Todo","Doing","Done","Blocked"].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filter.tag} onChange={e=>setFilter({...filter, tag: e.target.value})}>
                <option value="">All tags</option>
                {tags.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
              <label className="hstack" style={{ gap: 8 }}>
                <input type="checkbox" checked={filter.overdueOnly} onChange={e=>setFilter({...filter, overdueOnly: e.target.checked})} />
                <small>Due for review</small>
              </label>
            </div>
            <div className="hstack">
              <label className="hstack" style={{ gap: 8 }}>
                <input type="checkbox" checked={showFuture} onChange={e=>setShowFuture(e.target.checked)} />
                <small>Show future lessons</small>
              </label>
            </div>
          </div>
          
          {/* Import/Export buttons */}
          <div className="hstack" style={{ justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button onClick={exportToJSON} className="btn btn-outline">
              Export JSON
            </button>
            <label className="btn btn-outline" style={{ cursor: "pointer" }}>
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={importFromJSON}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </section>

        <LessonTable items={items} onUpdate={updateItem} filter={filter} showFuture={showFuture} sortBy="updated" />
      </div>
    </AuthGate>
  );
}