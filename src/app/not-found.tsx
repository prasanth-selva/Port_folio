import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6">
      <div className="surface relative max-w-md rounded-2xl p-8 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-accent-amber">ERROR 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white/90">
          Packet lost.
        </h1>
        <p className="mt-3 font-mono text-xs leading-relaxed text-white/45">
          {"$ traceroute destination…\n> no route to host. this page never existed (or was exploited)."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent-amber px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-none transition-shadow hover:shadow-none"
        >
          Reconnect
        </Link>
      </div>
    </main>
  );
}
