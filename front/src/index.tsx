import { useRef, useState, useMemo } from "react";
import Nav from "./components/nav";
import Canvas02 from "./components/canvas02";
import FiltersBar from "./components/filters_bar";
import EditTools from "./components/edit_tools";
import PencilBar from "./components/pencil_bar";
import {
  ApplyFilter,
  SelectMaskObjects,
  undo,
  redo,
} from "./services/applyFilter";

import type { Tab, Filter, PencilAply, FilterAply } from "./types";

function Index() {
  const [filter, setFilter] = useState<Filter | null>(null);
  const [pencil, setPencil] = useState<PencilAply | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTab = useMemo(
    () => tabs.find((t) => t.id === activeTab) ?? undefined,
    [tabs, activeTab],
  );

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = () => {
      const newTab: Tab = {
        id: Date.now(),
        file,
        previewUrl: url,
        name: file.name,
        width: img.width,
        height: img.height,
        filters: [],
        imageObj: img,
        historic: [url],
        indexHistoric: 0,
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
    };

    e.target.value = "";
  };

  const closeTab = (id: number) => {
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);

    if (activeTab === id) {
      setActiveTab(updated[0]?.id ?? null);
    }
  };

  const handleAplyFilter = async (filter: FilterAply) => {
    if (!currentTab) return;

    const updatedTab = await ApplyFilter({
      tab: currentTab,
      filter,
    });

    if (!updatedTab) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === currentTab.id ? updatedTab : tab)),
    );
  };

  const handleUndo = () => {
    if (!currentTab) return;

    const updatedTab = undo(currentTab);
    if (!updatedTab) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === currentTab.id ? updatedTab : tab)),
    );
  };

  const handleRedo = () => {
    if (!currentTab) return;

    const updatedTab = redo(currentTab);
    if (!updatedTab) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === currentTab.id ? updatedTab : tab)),
    );
  };

  // ✅ recebe direto do canvas e já chama a API
  const handleselectObjectsClick = async (valor: number[]) => {
    if (!currentTab) return;
    if (!valor || valor.length !== 4) return;

    const updatedTab = await SelectMaskObjects(currentTab, valor);

    if (!updatedTab) return;

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === currentTab.id ? updatedTab : tab)),
    );
  };

  return (
    <div>
      <Nav
        onOpenFile={handleOpenFile}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        closeTab={closeTab}
        undo={handleUndo}
        redo={handleRedo}
      />

      <FiltersBar activeFilter={filter} filter={handleAplyFilter} />

      <EditTools
        zoom={zoom}
        setZoom={setZoom}
        activeFilter={filter}
        setActiveFilter={setFilter}
      />

      <PencilBar Pencil={pencil} setPencilAply={setPencil} />

      <Canvas02
        activeTab={currentTab}
        activePencil={pencil}
        zoom={zoom}
        setInteligentMask={handleselectObjectsClick} // ✅ fluxo direto
        onMaskChange={(mask) => {
          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === activeTab ? { ...tab, maskFilter: mask } : tab,
            ),
          );
        }}
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        title="img"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Index;
