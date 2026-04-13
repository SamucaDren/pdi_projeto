import "./nav.css";
import type { Tab } from "../types.tsx";

type NavProps = {
  onOpenFile: () => void;
  tabs: Tab[];
  activeTab: number | null;
  setActiveTab: (id: number) => void;
  closeTab: (id: number) => void;
  undo: () => void;
  redo: () => void;
};

function Nav({
  onOpenFile,
  tabs,
  activeTab,
  setActiveTab,
  closeTab,
  undo,
  redo,
}: NavProps) {
  return (
    <div className="nav_bar_container">
      <div className="nav_bar_content">
        <span className="nav_bar_logo">
          Chromo<span>.io</span>
        </span>

        <div className="undo_redo_container">
          <span onClick={undo}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.14645 10.8964C7.34171 10.7012 7.65822 10.7012 7.85348 10.8964C8.04874 11.0917 8.04874 11.4082 7.85348 11.6035L3.70699 15.75L7.85348 19.8964C8.04874 20.0917 8.04874 20.4082 7.85348 20.6035C7.65822 20.7987 7.34171 20.7987 7.14645 20.6035L2.64645 16.1035C2.45118 15.9082 2.45118 15.5917 2.64645 15.3964L7.14645 10.8964Z"
                fill="white"
              />
              <path
                d="M20.5 10.5C20.5 9.24022 19.9992 8.0324 19.1084 7.1416C18.2176 6.2508 17.0098 5.75 15.75 5.75H7.5C7.22386 5.75 7 5.52614 7 5.25C7 4.97386 7.22386 4.75 7.5 4.75H15.75C17.275 4.75 18.7371 5.35624 19.8154 6.43457C20.8938 7.5129 21.5 8.97501 21.5 10.5C21.5 12.025 20.8938 13.4871 19.8154 14.5654C18.7371 15.6438 17.275 16.25 15.75 16.25H3C2.72386 16.25 2.5 16.0261 2.5 15.75C2.5 15.4739 2.72386 15.25 3 15.25H15.75C17.0098 15.25 18.2176 14.7492 19.1084 13.8584C19.9992 12.9676 20.5 11.7598 20.5 10.5Z"
                fill="white"
              />
            </svg>
          </span>
          <span onClick={redo}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.8536 13.1036C16.6583 13.2988 16.3418 13.2988 16.1465 13.1036C15.9513 12.9083 15.9513 12.5918 16.1465 12.3965L20.293 8.25004L16.1465 4.10355C15.9513 3.90829 15.9513 3.59179 16.1465 3.39652C16.3418 3.20126 16.6583 3.20126 16.8536 3.39652L21.3536 7.89652C21.5488 8.09178 21.5488 8.40829 21.3536 8.60355L16.8536 13.1036Z"
                fill="white"
              />
              <path
                d="M3.5 13.5C3.5 14.7598 4.0008 15.9676 4.8916 16.8584C5.7824 17.7492 6.99022 18.25 8.25 18.25H16.5C16.7761 18.25 17 18.4739 17 18.75C17 19.0261 16.7761 19.25 16.5 19.25H8.25C6.72501 19.25 5.26291 18.6438 4.18457 17.5654C3.10624 16.4871 2.5 15.025 2.5 13.5C2.5 11.975 3.10624 10.5129 4.18457 9.43457C5.26291 8.35624 6.72501 7.75 8.25 7.75H21C21.2761 7.75 21.5 7.97386 21.5 8.25C21.5 8.52614 21.2761 8.75 21 8.75H8.25C6.99022 8.75 5.7824 9.2508 4.8916 10.1416C4.0008 11.0324 3.5 12.2402 3.5 13.5Z"
                fill="white"
              />
            </svg>
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              style={{
                padding: "8px 12px 8px 16px",
                background: tab.id === activeTab ? "#811d1d" : "#222",
                cursor: "pointer",
                display: "flex",
                gap: 16,
                alignItems: "center",
                borderRadius: 8,
                transition: "all .2s ease",
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
