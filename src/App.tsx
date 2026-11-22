// =====================================================================
// src/App.tsx  —  PJ: Dona (setup & navigasi)
// "Otak" aplikasi: state utama (applications, kaptenSkills) disimpan di sini
// pakai useLocalStorage, lalu dikirim ke komponen lewat props.
// =====================================================================
import { useState } from "react";
import type { Application, JobListing, JobSource, TabKey } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  createApplication,
  detectWorkMode,
  isDuplicateApplication,
} from "./utils/application";
import Navbar from "./components/layout/Navbar";
import SkillProfile from "./components/explore/SkillProfile";
import JobExplorer from "./components/explore/JobExplorer";
import ApplicationForm from "./components/form/ApplicationForm";
import ConflictBanner from "./components/pipeline/ConflictBanner";
import WarRoom from "./components/pipeline/WarRoom";
import UndoToast from "./components/pipeline/UndoToast";
import ApplicationDetail from "./components/detail/ApplicationDetail";
import InterviewTimer from "./components/detail/InterviewTimer";
import StatsCards from "./components/dashboard/StatsCards";
import OfferComparator from "./components/dashboard/OfferComparator";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];

function App() {
  // ---------- State utama (persisten di localStorage) ----------
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    "kaptenSkills",
    DEFAULT_SKILLS,
  );
  const [applications, setApplications] = useLocalStorage<Application[]>(
    "applications",
    [],
  );

  // ---------- State tampilan ----------
  const [activeTab, setActiveTab] = useState<TabKey>("explore");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [jobSource, setJobSource] = useState<JobSource>("remote");

  // ---------- Derived state ----------
  const offerCount = applications.filter(
    (app) => app.status === "OFFER",
  ).length;

  // ---------- Handler Fitur 1 ----------
  function handleAddSkill(skill: string) {
    setKaptenSkills((prev) => [...prev, skill]);
  }

  function handleRemoveSkill(skill: string) {
    setKaptenSkills((prev) => prev.filter((s) => s !== skill));
  }
  function handleAddApplication(newApp: Application) {
    setApplications((prev) => [newApp, ...prev]);
  }
  function handleSaveJob(job: JobListing) {
    if (isDuplicateApplication(applications, job.company_name, job.title))
      return;

    const newApp = createApplication({
      company: job.company_name,
      role: job.title,
      workMode: detectWorkMode(job.candidate_required_location),
      status: "WISHLIST",
      requiredSkills: job.tags,
      logMessage: "Disimpan ke Wishlist dari Katalog",
    });

    handleAddApplication(newApp);
  }

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenForm={() => setIsFormOpen((open) => !open)}
        pipelineCount={applications.length}
        offerCount={offerCount}
      />

      <main className="container">
        <ConflictBanner />
        <StatsCards />

        {isFormOpen && (
          <ApplicationForm
            applications={applications}
            onAdd={handleAddApplication}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {activeTab === "explore" && (
          <div className="explore-layout">
            <SkillProfile
              skills={kaptenSkills}
              onAddSkill={handleAddSkill}
              onRemoveSkill={handleRemoveSkill}
              source={jobSource}
              onChangeSource={setJobSource}
            />
            <JobExplorer
              source={jobSource}
              onChangeSource={setJobSource}
              kaptenSkills={kaptenSkills}
              applications={applications}
              onSaveJob={handleSaveJob}
            />
          </div>
        )}

        {activeTab === "pipeline" && (
          <>
            <WarRoom />
            <ApplicationDetail />
            <InterviewTimer />
          </>
        )}

        {activeTab === "offer" && <OfferComparator />}
      </main>

      <UndoToast />
    </>
  );
}

export default App;
