export type DatabaseBlockType =
  | "cards"
  | "button"
  | "text"
  | "divider"
  | "video"
  | "file-download"
  | "image"
  | "spacer"
  | "list"
  | "author"
  | "audio"
  | "quiz";

export interface OrderUpdate {
  id: number;
  order: number;
}

// Interface for content updates
export interface ContentUpdate {
  id: number;
  type: DatabaseBlockType;
  value: any;
}
