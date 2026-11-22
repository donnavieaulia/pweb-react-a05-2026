// =====================================================================
// src/App.tsx  —  PJ: Dona (setup & navigasi)
// State utama (applications, kaptenSkills) nanti disimpan di sini pakai
// useLocalStorage (Sean), lalu dikirim ke komponen lewat props.
// =====================================================================
import { useState } from "react";
import type { TabKey } from "./types";
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

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("explore");
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenForm={() => setIsFormOpen((open) => !open)}
      />

      <main className="container">
        <ConflictBanner />
        <StatsCards />

        {isFormOpen && <ApplicationForm />}

        {activeTab === "explore" && (
          <div className="explore-layout">
            <SkillProfile />
            <JobExplorer />
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
