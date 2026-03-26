import React from "react";
import "./nav.css";
import type { Tab } from "../index.tsx";

type NavProps = {
  onOpenFile: () => void;
  tabs: Tab[];
  activeTab: number | null;
  setActiveTab: (id: number) => void;
  closeTab: (id: number) => void;
};

function Nav({
  onOpenFile,
  tabs,
  activeTab,
  setActiveTab,
  closeTab,
}: NavProps) {
  return (
    <div className="nav_bar_container">
      <div className="nav_bar_content">
        <span className="nav_bar_logo">
          Chromo<span>.io</span>
        </span>

        <div style={{ display: "flex", gap: 8 }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                padding: "4px 24px",
                background: tab.id === activeTab ? "#333" : "#222",
                cursor: "pointer",
                display: "flex",
                gap: 6,
                alignItems: "center",
                borderRadius: 20,
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>
                {tab.name.length > 15
                  ? tab.name.slice(0, 15) + "..."
                  : tab.name}
              </span>

              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      </div>
      <button className="open_file_button" onClick={onOpenFile}>
        Abrir Imagem
      </button>
    </div>
  );
}

export default Nav;
