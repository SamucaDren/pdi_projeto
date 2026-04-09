import { useRef, useState, useMemo } from "react";
import Nav from "./components/nav";
import Canvas from "./components/canvas";
import FiltersBar from "./components/filters_bar";
import EditTools from "./components/edit_tools";
import PencilBar from "./components/pencil_bar";
import { ApplyFilter } from "./services/applyFilter";

import type { Tab, Filter, Pencil, FilterAply } from "./types";

function Index() {
  const [pencilWeight, setPencilWeight] = useState(24);
  const openFileRef = useRef<() => void>(() => {});
  const [filter, setFilter] = useState<Filter | null>(null);
  const [pencil, setPencil] = useState<Pencil | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [getMaskFromCanvas, setGetMaskFromCanvas] = useState<
    (() => boolean[][] | undefined) | null
  >(null);

  // referência estável da tab ativa
  const currentTab = useMemo(
    () => tabs.find((t) => t.id === activeTab) ?? undefined, // muda de null para undefined
    [tabs, activeTab],
  );

  // ADICIONA A IMAGEM COM O FILTRO APLICADO DENTRO DO TIPO TAB
  const handleFilteredImage = (url: string) => {
    if (!currentTab) return;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === currentTab.id ? { ...tab, previewUrl: url } : tab,
      ),
    );
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

  // RECEBE O OBJETO DA TAB E ADICIONA NA LISTA DE TABS
  const addTab = (tab: Tab) => {
    setTabs((prev) => [...prev, tab]);
    setActiveTab(tab.id);
  };

  // REMOVE A TAB DA LISTA
  const closeTab = (id: number) => {
    const updated = tabs.filter((t) => t.id !== id);
    setTabs(updated);

    if (activeTab === id) {
      setActiveTab(updated[0]?.id ?? null);
    }
  };

  const handleUpdateTab = (tabUpdate: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabUpdate.id ? { ...tab, ...tabUpdate } : tab,
      ),
    );
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
        activeTab={currentTab}
        filter={handleAplyFilter}
        onApply={handleFilteredImage}
        getMaskFromCanvas={getMaskFromCanvas} // <-- passa a função aqui
      />
      <EditTools
        zoom={zoom}
        setZoom={setZoom}
        activeFilter={filter}
        setActiveFilter={setFilter}
      />
      <PencilBar
        Pencil={pencil}
        setPencil={setPencil}
        onPencilWeightChange={setPencilWeight}
      />
      <Canvas
        setOpenFile={(fn) => (openFileRef.current = fn)}
        addTab={addTab}
        activeTab={currentTab}
        zoom={zoom}
        Pencil={pencil}
        pencilWeight={pencilWeight}
        onUpdateTab={handleUpdateTab} // <-- adicionado
        setGetMask={setGetMaskFromCanvas}
      />
    </div>
  );
}

export default Index;
