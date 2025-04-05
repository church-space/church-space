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
  | "list"
  | "audio"
  | "quiz";

export interface TextBlockData {
  content: string | null;
  font?: string;
  textColor?: string;
}

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
  centered: boolean;
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
  textColor: string;
  links: Array<{
    icon: string;
    url: string;
  }>;
  hideAvatar: boolean;
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
  textColor: string;
  labelColor: string;
  buttonColor: string;
  buttonTextColor: string;
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

export interface VideoBlockData {
  url: string;
  size: number;
  centered: boolean;
}

export type BlockData =
  | TextBlockData
  | ButtonBlockData
  | DividerBlockData
  | ListBlockData
  | AuthorBlockData
  | ImageBlockData
  | CardsBlockData
  | FileDownloadBlockData
  | VideoBlockData;

export interface Block {
  id: string;
  type: BlockType;
  data?: BlockData;
  order: number;
  duplicatedFromId?: string;
}

export interface Section {
  id: string;
  blocks: Block[];
}

export interface EmailStyle {
  blocks_bg_color?: string;
  default_text_color?: string;
  accent_text_color?: string;
  default_font?: string;
  is_inset?: boolean;
  bg_color?: string;
  is_rounded?: boolean;
  link_color?: string;
}
