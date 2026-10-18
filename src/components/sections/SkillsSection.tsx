import { SectionHeading } from "@/components/ui/Reveal";
import type { Skill } from "@/lib/types";

const DOMAIN_COPY: Record<string, string> = {
  Core: "Systems and scripting work I use every week.",
  Defense: "Detection and response tasks from SOC and incident work.",
  Offense: "Tools and methods I use for authorized testing.",
  Build: "Frameworks and practices used to ship working products.",
};

export default function SkillsSection({ skills }: { skills: Skill[] }) {
  const categories = Array.from(new Set(["Core", "Defense", "Offense", "Build", ...skills.map((skill) => skill.category)]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28" id="skills">
      <div className="grid gap-8 md:grid-cols-[1fr_280px] md:items-end">
        <SectionHeading index="04" label="SKILLS" title={<>Skills I use.</>} />
        <p className="border-l-2 border-accent-amber pl-4 text-sm leading-6 text-white/60">
          A list of tools and methods from my projects, internships, and security practice.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {categories.map((category) => {
          const entries = skills.filter((skill) => skill.category === category);
          if (!entries.length) return null;
          return (
            <section key={category} className="border-t border-[#36332e] pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-amber">{category}</h3>
                <span className="text-xs text-white/40">{entries.length} skills</span>
              </div>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">{DOMAIN_COPY[category] ?? "A focused part of the working toolkit."}</p>
              <ul className="mt-5 divide-y divide-[#2c2a26] border-y border-[#2c2a26]">
                {entries.map((skill) => (
                  <li key={skill.id} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium text-white/90">{skill.name}</p>
                      {skill.description && <p className="mt-1 text-sm leading-5 text-white/50">{skill.description}</p>}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-accent-amber">{skill.level}%</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
