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
export type TypeOfBlur = "gaussiano" | "media";
export type TypeOfHigh = "sobel" | "laplaciano";
export type Pencil = "pincel" | "borracha" | "retangulo";

export type PencilAply = {
  pencil: Pencil;
  valor: number;
};

export type FilterAply = {
  filter: Filter;
  valor: number;
  type?: TypeOfBlur | TypeOfHigh | undefined;
};
