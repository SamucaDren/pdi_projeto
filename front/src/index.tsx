import { useRef, useState, useMemo } from "react";
import Nav from "./components/nav";
//import Canvas from "./components/canvas";

import Canvas02 from "./components/canvas02";
import FiltersBar from "./components/filters_bar";
import EditTools from "./components/edit_tools";
import PencilBar from "./components/pencil_bar";
import { ApplyFilter } from "./services/applyFilter";

import type { Tab, Filter, PencilAply, FilterAply } from "./types";

function Index() {
  // console.log("Teste");
  //const [pencilWeight, setPencilWeight] = useState(24);
  const [filter, setFilter] = useState<Filter | null>(null);
  const [pencil, setPencil] = useState<PencilAply | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*
  const [getMaskFromCanvas, setGetMaskFromCanvas] = useState<
    (() => boolean[][] | undefined) | null
  >(null);*/

  // referência estável da tab ativa
  const currentTab = useMemo(
    () => tabs.find((t) => t.id === activeTab) ?? undefined,
    [tabs, activeTab],
  );

  // abre seletor de arquivo
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  // quando o usuário escolhe o arquivo
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
      };

      addTab(newTab);
    };

    // limpa input
    e.target.value = "";
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

  /*
  const handleUpdateTab = (tabUpdate: Partial<Tab>) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabUpdate.id ? { ...tab, ...tabUpdate } : tab,
      ),
    );
  };

 
  // ADICIONA A IMAGEM COM O FILTRO APLICADO DENTRO DO TIPO TAB
  const handleFilteredImage = (url: string) => {
    if (!currentTab) return;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === currentTab.id ? { ...tab, previewUrl: url } : tab,
      ),
    );
  };
*/

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

  return (
    <div>
      <Nav
        onOpenFile={handleOpenFile}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        closeTab={closeTab}
      />
      <FiltersBar
        activeFilter={filter}
        //activeTab={currentTab}
        filter={handleAplyFilter}
        //onApply={handleFilteredImage}
        //getMaskFromCanvas={getMaskFromCanvas} // <-- passa a função aqui
      />
      <EditTools
        zoom={zoom}
        setZoom={setZoom}
        activeFilter={filter}
        setActiveFilter={setFilter}
      />

      {/* agora aceita null corretamente */}
      <PencilBar Pencil={pencil} setPencilAply={setPencil} />

      {/*
      <Canvas
        setOpenFile={(fn) => (openFileRef.current = fn)}
        addTab={addTab}
        activeTab={currentTab}
        zoom={zoom}
        Pencil={pencil}
        pencilWeight={pencilWeight}
        onUpdateTab={handleUpdateTab} // <-- adicionado
        setGetMask={setGetMaskFromCanvas}
      />*/}

      <Canvas02
        activeTab={currentTab}
        activePencil={pencil}
        zoom={zoom}
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
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default Index;
