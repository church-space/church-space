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

export interface ButtonBlockData {
  text: string;
  link: string;
  color: string;
  textColor: string;
  style: "outline" | "filled";
  size: "fit" | "full";
}

export interface ListBlockData {
  title: string;
  subtitle: string;
  textColor: string;
  bulletColor: string;
  bulletType: "number" | "bullet";
  items: Array<{
    title: string;
    description: string;
  }>;
}

export interface AuthorBlockData {
  name: string;
  subtitle: string;
  avatar: string;
  links: Array<{
    icon: string;
    url: string;
  }>;
}

export interface ImageBlockData {
  image: string;
  size: number;
  link: string;
  centered: boolean;
}

export interface CardsBlockData {
  title: string;
  subtitle: string;
  cards: Array<{
    title: string;
    description: string;
    label: string;
    buttonText: string;
    buttonLink: string;
    image: string; // This will store the Supabase path
  }>;
}

export interface FileDownloadBlockData {
  title: string;
  file: string;
  bgColor: string;
  textColor: string;
}

export type BlockData =
  | ButtonBlockData
  | DividerBlockData
  | ListBlockData
  | AuthorBlockData
  | ImageBlockData
  | CardsBlockData
  | FileDownloadBlockData;

export interface Block {
  id: string;
  type: BlockType;
  data?: BlockData;
}

export interface Section {
  id: string;
  blocks: Block[];
}
