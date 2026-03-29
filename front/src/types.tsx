export type Tab = {
  id: number;
  file: File;
  previewUrl: string;
  name: string;
  width: number;
  height: number;
};

export type Filter = "realce" | "desfoque" | "brilho";
