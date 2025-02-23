export type BlockType =
  | "text"
  | "image"
  | "button"
  | "file-download"
  | "divider"
  | "video"
  | "cards"
  | "author"
  | "input"
  | "select"
  | "textarea"
  | "radio-buttons"
  | "checkboxes"
  | "file-upload"
  | "rating"
  | "address"
  | "list";

export interface DividerBlockData {
  color: string;
  margin: number;
}

export interface Block {
  id: string;
  type: BlockType;
  data?: DividerBlockData;
}

export interface Section {
  id: string;
  blocks: Block[];
}
