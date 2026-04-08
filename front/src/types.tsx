export type Tab = {
  id: number;
  file: File;
  previewUrl: string;
  name: string;
  width: number;
  height: number;
  filters: FilterAply[];
  maskFilter?: boolean[][];
  imageObj?: HTMLImageElement;
};

export type Filter = "realce" | "desfoque" | "brilho";
export type Pencil = "pincel" | "borracha" | "retangulo";

export type PencilAply = {
  pencil: Pencil;
  valor: number;
};

export type FilterAply = {
  filter: Filter;
  valor: number;
};
