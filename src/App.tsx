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
  sanitizeApplications,
} from "./utils/application";
import Navbar from "./components/layout/Navbar";
import SkillProfile from "./components/explore/SkillProfile";
import JobExplorer from "./components/explore/JobExplorer";
import ApplicationForm from "./components/form/ApplicationForm";
import ConflictBanner from "./components/pipeline/ConflictBanner";
import WarRoom from "./components/pipeline/WarRoom";
import UndoToast from "./components/pipeline/UndoToast";
import ApplicationDetail from "./components/detail/ApplicationDetail";
import StatsCards from "./components/dashboard/StatsCards";
import OfferComparator from "./components/dashboard/OfferComparator";

const DEFAULT_SKILLS = ["React", "TypeScript", "CSS"];
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function sanitizeSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return DEFAULT_SKILLS;
  return raw.filter((item): item is string => typeof item === "string");
}

function App() {
  // ---------- State utama (persisten di localStorage) ----------
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    "kaptenSkills",
    DEFAULT_SKILLS,
    sanitizeSkills,
  );
  const [applications, setApplications] = useLocalStorage<Application[]>(
    "applications",
    [],
    sanitizeApplications,
  );

  // ---------- State tampilan ----------
  const [activeTab, setActiveTab] = useState<TabKey>("explore");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedApplication = applications.find((app) => app.id === selectedId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [jobSource, setJobSource] = useState<JobSource>("remote");
  const [pendingDelete, setPendingDelete] = useState<{
    app: Application;
    index: number;
  } | null>(null);

  // ---------- Derived state ----------
  const offerCount = applications.filter(
    (app) => app.status === "OFFER",
  ).length;

  function handleUpdateApplication(
    id: string,
    update: (current: Application) => Application,
  ) {
    setApplications((previous) =>
      previous.map((app) => (app.id === id ? update(app) : app)),
    );
  }

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

  // ---------- Handler Fitur 3 & 6 (Sean) ----------
  function handleSimulateGhosting(id: string) {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        const baseMs = Date.parse(app.lastUpdatedAt);
        const shiftedIso = new Date(
          (Number.isNaN(baseMs) ? Date.now() : baseMs) - FIFTEEN_DAYS_MS,
        ).toISOString();

        return {
          ...app,
          lastUpdatedAt: shiftedIso,
          activityLogs: [
            {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              message: "Simulasi +15 hari dijalankan",
            },
            ...app.activityLogs,
          ],
        };
      }),
    );
  }

  function handleDeleteApplication(id: string) {
    const index = applications.findIndex((app) => app.id === id);
    if (index === -1) return;

    const target = applications[index];
    if (selectedId === id) setSelectedId(null);
    setApplications((prev) => prev.filter((app) => app.id !== id));
    setPendingDelete({ app: target, index });
  }

  function handleUndoDelete() {
    if (!pendingDelete) return;
    const { app, index } = pendingDelete;

    setApplications((prev) => {
      const next = [...prev];
      const insertAt = Math.min(index, next.length);
      next.splice(insertAt, 0, app);
      return next;
    });
    setPendingDelete(null);
  }

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSelectedId(null);
        }}
        onOpenForm={() => setIsFormOpen((open) => !open)}
        pipelineCount={applications.length}
        offerCount={offerCount}
      />

      <main className="container">
        <ConflictBanner applications={applications} />
        <StatsCards applications={applications} />

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
            <WarRoom
              applications={applications}
              kaptenSkills={kaptenSkills}
              onSimulateGhosting={handleSimulateGhosting}
              onDelete={handleDeleteApplication}
              onOpenDetail={setSelectedId}
            />
            {selectedApplication && (
              <ApplicationDetail
                key={selectedApplication.id}
                application={selectedApplication}
                onUpdate={handleUpdateApplication}
                onClose={() => setSelectedId(null)}
              />
            )}
          </>
        )}

        {activeTab === "offer" && (
          <OfferComparator
            applications={applications}
            kaptenSkills={kaptenSkills}
          />
        )}
      </main>

      {pendingDelete && (
        <UndoToast
          key={pendingDelete.app.id}
          deletedApp={pendingDelete.app}
          onUndo={handleUndoDelete}
          onExpire={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}

export default App;
