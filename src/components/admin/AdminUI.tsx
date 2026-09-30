"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "url" | "date";
  placeholder?: string;
  full?: boolean;
};

type Row = Record<string, unknown> & { id: string };

export function CrudTable({
  title,
  rows,
  fields,
  saveAction,
  deleteAction,
  reorderAction,
  primaryKey = "title",
}: {
  title: string;
  rows: Row[];
  fields: FieldDef[];
  saveAction: (fd: FormData) => Promise<{ ok: boolean; error?: string }>;
  deleteAction: (id: string) => Promise<{ ok: boolean; error?: string }>;
  reorderAction?: (ids: string[]) => Promise<{ ok: boolean; error?: string }>;
  primaryKey?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const [order, setOrder] = useState<Row[]>(rows);

  const openNew = () => {
    setError(null);
    setEditing("new");
  };
  const openEdit = (row: Row) => {
    setError(null);
    setEditing(row);
  };

  const onSave = (fd: FormData) => {
    startTransition(async () => {
      const res = await saveAction(fd);
      if (!res.ok) {
        setError(res.error ?? "Save failed");
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const onDelete = (id: string) => {
    if (!window.confirm("Delete this entry permanently?")) return;
    startTransition(async () => {
      const res = await deleteAction(id);
      if (!res.ok) setError(res.error ?? "Delete failed");
      else router.refresh();
    });
  };

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    const next = [...order];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === id);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved!);
    setOrder(next);
  };
  const onDragEnd = () => {
    setDragId(null);
    if (reorderAction) {
      startTransition(async () => {
        await reorderAction(order.map((r) => r.id));
        router.refresh();
      });
    }
  };

  const display = order.length === rows.length ? order : rows;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white/90">{title}</h1>
        <button
          type="button"
          onClick={openNew}
          className="rounded-xl bg-accent-cyan px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black transition-shadow hover:shadow-glow-sm"
        >
          + New
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-4 py-3 font-mono text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {display.map((row) => (
          <li
            key={row.id}
            draggable={Boolean(reorderAction)}
            onDragStart={() => onDragStart(row.id)}
            onDragOver={(e) => onDragOver(e, row.id)}
            onDragEnd={onDragEnd}
            className={`glass flex items-center justify-between gap-4 rounded-xl px-4 py-3 ${
              dragId === row.id ? "opacity-50" : ""
            } ${reorderAction ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white/85">
                {String(row[primaryKey] ?? row.id)}
              </p>
              {"published" in row && (
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em]">
                  {row.published ? (
                    <span className="text-emerald-400/80">● published</span>
                  ) : (
                    <span className="text-amber-400/80">● draft</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/60 transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(row.id)}
                className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/60 transition-colors hover:border-red-400/40 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {display.length === 0 && (
          <li className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center font-mono text-xs text-white/30">
            No entries yet — create the first one.
          </li>
        )}
      </ul>

      {reorderAction && display.length > 1 && (
        <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/25">
          DRAG TO REORDER — SAVED AUTOMATICALLY
        </p>
      )}

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="glass max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold tracking-tight text-white/90">
                {editing === "new" ? `New ${title.replace(/s$/, "")}` : "Edit entry"}
              </h2>
              <form action={onSave} className="mt-5 grid gap-4 sm:grid-cols-2">
                {editing !== "new" && (
                  <input type="hidden" name="id" value={editing.id} />
                )}
                {fields.map((f) => {
                  const value = editing !== "new" ? editing[f.name] : undefined;
                  if (f.type === "checkbox") {
                    const checked = editing === "new" ? true : Boolean(value);
                    return (
                      <label key={f.name} className="flex items-center gap-3 font-mono text-xs text-white/60">
                        <input
                          type="checkbox"
                          name={f.name}
                          defaultChecked={checked}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#00F0FF]"
                        />
                        {f.label}
                      </label>
                    );
                  }
                  const defaultVal =
                    Array.isArray(value)
                      ? value.join(", ")
                      : value == null
                        ? ""
                        : String(value);
                  return (
                    <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
                      <label className="mono-label mb-2 block" htmlFor={`f-${f.name}`}>
                        {f.label}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          id={`f-${f.name}`}
                          name={f.name}
                          rows={5}
                          placeholder={f.placeholder}
                          defaultValue={defaultVal}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-accent-cyan/50"
                        />
                      ) : (
                        <input
                          id={`f-${f.name}`}
                          name={f.name}
                          type={f.type ?? "text"}
                          placeholder={f.placeholder}
                          defaultValue={defaultVal}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-accent-cyan/50"
                        />
                      )}
                    </div>
                  );
                })}

                <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-xl border border-white/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-xl bg-accent-cyan px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black disabled:opacity-50"
                  >
                    {pending ? "Saving…" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
