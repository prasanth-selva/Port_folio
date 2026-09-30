import dynamic from "next/dynamic";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import TerminalEasterEgg from "@/components/layout/TerminalEasterEgg";
import AboutSection from "@/components/sections/AboutSection";
import AchievementsSection from "@/components/sections/AchievementsSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import ContactSection from "@/components/sections/ContactSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import SectionShell from "@/components/sections/SectionShell";
import { getSettings } from "@/lib/data";

// 3D-heavy hero: client-only, never blocks server render.
const CyberCoreScroll = dynamic(() => import("@/components/hero/CyberCoreScroll"), {
  ssr: false,
});

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <Navbar />
      <main id="top" className="relative">
        <SectionShell kind="hero">
          <CyberCoreScroll badge={settings.heroBadge} resumeUrl={settings.resumeUrl} />
        </SectionShell>
        <SectionShell kind="grid" id="about">
          <AboutSection />
        </SectionShell>
        <SectionShell id="experience">
          <ExperienceSection />
        </SectionShell>
        <SectionShell kind="grid" id="projects">
          <ProjectsSection />
        </SectionShell>
        <SectionShell>
          <SkillsSection />
        </SectionShell>
        <SectionShell kind="grid" id="achievements">
          <AchievementsSection />
        </SectionShell>
        <SectionShell>
          <CertificationsSection />
        </SectionShell>
        <SectionShell id="contact">
          <ContactSection />
        </SectionShell>
      </main>
      <Footer settings={settings} />
      <TerminalEasterEgg />
    </>
  );
}
