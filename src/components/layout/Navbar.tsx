// =====================================================================
// src/components/layout/Navbar.tsx  —  PJ: Dona
// Navigasi tab utama + tombol "+ Catat Lamaran".
// =====================================================================
import type { TabKey } from "../../types";

interface NavbarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onOpenForm: () => void;
  pipelineCount: number;
  offerCount: number;
}

function Navbar({
  activeTab,
  onChangeTab,
  onOpenForm,
  pipelineCount,
  offerCount,
}: NavbarProps) {
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "explore", label: "Eksplorasi Lowongan" },
    { key: "pipeline", label: "Pipeline Lamaran", count: pipelineCount },
    { key: "offer", label: "Bandingkan Offer", count: offerCount },
  ];

  return (
    <header className="navbar">
      <div className="navbar__brand">
        Aku Mw Magang
        <small>Catatan lamaran magang Kapten</small>
      </div>
      <nav className="navbar__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab ? "tab tab--active" : "tab"}
            onClick={() => onChangeTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="navbar__count">({tab.count})</span>
            )}
          </button>
        ))}
      </nav>
      <button type="button" className="btn btn--primary" onClick={onOpenForm}>
        + Catat Lamaran
      </button>
    </header>
  );
}

export default Navbar;
