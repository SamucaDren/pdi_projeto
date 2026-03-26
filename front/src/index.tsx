import React, { useRef, useState } from "react";
import Nav from "./components/nav";
import Canvas from "./components/canvas";

export type Tab = {
  id: number;
  image: HTMLImageElement;
  name: string;
  width: number;
  height: number;
};

function Index() {
  const openFileRef = useRef<() => void>(() => {});
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const addTab = (tab: Tab) => {
    setTabs((prev) => [...prev, tab]);
    setActiveTab(tab.id);
  };

  const closeTab = (id: number) => {
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);

    if (activeTab === id) {
      setActiveTab(updated[0]?.id ?? null);
    }
  };

  return (
    <div>
      <Nav
        onOpenFile={() => openFileRef.current()}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        closeTab={closeTab}
      />

      <Canvas
        setOpenFile={(fn) => (openFileRef.current = fn)}
        addTab={addTab}
        activeTab={tabs.find((t) => t.id === activeTab)}
      />
    </div>
  );
}

export default Index;
