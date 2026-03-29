export type Tab = {
  id: number;
  file: File;
  previewUrl: string;
  name: string;
  width: number;
  height: number;
  filters: FilterAply[];
};

export type Filter = "realce" | "desfoque" | "brilho";

export type FilterAply = {
  filter: Filter;
  valor: number;
};
