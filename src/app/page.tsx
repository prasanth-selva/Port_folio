import PortfolioPageView from "@/components/analytics/PortfolioPageView";
import CyberCoreScroll from "@/components/hero/CyberCoreScrollClient";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AboutSection from "@/components/sections/AboutSection";
import AchievementsSection from "@/components/sections/AchievementsSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import ContactSection from "@/components/sections/ContactSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import SectionShell from "@/components/sections/SectionShell";
import {
  getAboutContent,
  getAchievements,
  getCertifications,
  getExperience,
  getProjects,
  getSettings,
  getSkills,
} from "@/lib/data";

export default async function HomePage() {
  const [settings, about, projects, experience, skills, achievements, certifications] =
    await Promise.all([
      getSettings(),
      getAboutContent(),
      getProjects(),
      getExperience(),
      getSkills(),
      getAchievements(),
      getCertifications(),
    ]);

  return (
    <>
      <PortfolioPageView />
      <Navbar />
      <main id="top" className="relative">
        <SectionShell kind="hero">
          <CyberCoreScroll
            badge={settings.heroBadge}
            resumeUrl={settings.resumeUrl}
            name={settings.seoTitle.split("—")[0].trim() || "Manisha Nithya"}
          />
        </SectionShell>
        <SectionShell kind="grid" id="about">
          <AboutSection photoUrl={settings.aboutPhoto} content={about} />
        </SectionShell>
        <SectionShell id="experience">
          <ExperienceSection items={experience} />
        </SectionShell>
        <SectionShell kind="grid" id="projects">
          <ProjectsSection projects={projects} />
        </SectionShell>
        <SectionShell>
          <SkillsSection skills={skills} />
        </SectionShell>
        <SectionShell kind="grid" id="achievements">
          <AchievementsSection items={achievements} />
        </SectionShell>
        <SectionShell id="certifications">
          <CertificationsSection items={certifications} />
        </SectionShell>
        <SectionShell id="contact">
          <ContactSection settings={settings} />
        </SectionShell>
      </main>
      <Footer settings={settings} />
    </>
  );
}
