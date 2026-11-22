// =====================================================================
// src/components/layout/Navbar.tsx  —  PJ: Dona
// Navigasi tab utama + tombol "+ Catat Lamaran".
// =====================================================================
import type { TabKey } from "../../types";

interface NavbarProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onOpenForm: () => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "explore", label: "Eksplorasi Lowongan" },
  { key: "pipeline", label: "Pipeline Lamaran" },
  { key: "offer", label: "Bandingkan Offer" },
];

function Navbar({ activeTab, onChangeTab, onOpenForm }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        Aku Mw Magang
        <small>Catatan lamaran magang Kapten</small>
      </div>
      <nav className="navbar__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={tab.key === activeTab ? "tab tab--active" : "tab"}
            onClick={() => onChangeTab(tab.key)}
          >
            {tab.label}
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
