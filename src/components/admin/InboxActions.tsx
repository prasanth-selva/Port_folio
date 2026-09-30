"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteMessage, markMessageRead } from "@/lib/admin-actions";

export function InboxActions({
  id,
  read,
  replyMailto,
}: {
  id: string;
  read: boolean;
  replyMailto: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const btn =
    "rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] text-white/60 transition-colors disabled:opacity-50";

  return (
    <div className="flex shrink-0 gap-2">
      <a href={replyMailto} className={`${btn} hover:border-accent-cyan/40 hover:text-accent-cyan`}>
        Reply
      </a>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await markMessageRead(id, !read);
            router.refresh();
          })
        }
        className={`${btn} hover:border-white/40 hover:text-white`}
      >
        {read ? "Mark unread" : "Mark read"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Delete this message permanently?")) {
            startTransition(async () => {
              await deleteMessage(id);
              router.refresh();
            });
          }
        }}
        className={`${btn} hover:border-red-400/40 hover:text-red-400`}
      >
        Delete
      </button>
    </div>
  );
}
