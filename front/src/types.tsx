export type Tab = {
  id: number;
  file: File;
  previewUrl: string;
  historic?: string[];
  indexHistoric?: number;
  name: string;
  width: number;
  height: number;
  filters: FilterAply[];
  maskFilter?: boolean[][];
  imageObj?: HTMLImageElement;
};

export type Filter = "realce" | "desfoque" | "brilho" | "acne";
export type TypeOfBlur = "gaussiano" | "media";
export type TypeOfHigh = "sobel" | "laplaciano";
export type Pencil =
  | "pincel"
  | "borracha"
  | "retangulo"
  | "selecao_inteligente";

export type PencilAply = {
  pencil: Pencil | null;
  valor?: number;
  rectPosition?: [];
};

export type FilterAply = {
  filter: Filter;
  valor?: number;
  type?: TypeOfBlur | TypeOfHigh | undefined;
};
