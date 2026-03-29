import React, { useRef, useState } from "react";
import Nav from "./components/nav";
import Canvas from "./components/canvas";
import FiltersBar from "./components/filters_bar";
import EditTools from "./components/edit_tools";

import type { Tab, Filter } from "./types";

function Index() {
  const openFileRef = useRef<() => void>(() => {});
  const [filter, setFilter] = useState<Filter | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);

  const handleFilteredImage = (url: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab ? { ...tab, previewUrl: url } : tab,
      ),
    );
  };

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
      <FiltersBar
        activeFilter={filter}
        activeTab={tabs.find((t) => t.id === activeTab)}
        onApply={handleFilteredImage}
      />
      <EditTools
        zoom={zoom}
        setZoom={setZoom}
        activeFilter={filter}
        setActiveFilter={setFilter}
      />

      <Canvas
        setOpenFile={(fn) => (openFileRef.current = fn)}
        addTab={addTab}
        activeTab={tabs.find((t) => t.id === activeTab)}
        zoom={zoom}
      />
    </div>
  );
}

export default Index;
