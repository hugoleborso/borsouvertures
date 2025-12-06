import type { BoardThemeId } from "@/state/useAppState";

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  light: string;
  dark: string;
  highlight: string;
  arrow: string;
}

export const boardThemes: BoardTheme[] = [
  {
    id: "lichess",
    name: "Lichess",
    light: "#f0d9b5",
    dark: "#b58863",
    highlight: "#f6f669",
    arrow: "#a2d17c",
  },
  {
    id: "chesscom",
    name: "Chess.com",
    light: "#d9d7c9",
    dark: "#6b8f41",
    highlight: "#ffda79",
    arrow: "#5bc86e",
  },
  {
    id: "nord",
    name: "Nord Blue",
    light: "#eceff4",
    dark: "#4c566a",
    highlight: "#88c0d0",
    arrow: "#81a1c1",
  },
  {
    id: "sand",
    name: "Sand",
    light: "#f3e9dc",
    dark: "#c2a878",
    highlight: "#ffd590",
    arrow: "#d49a6a",
  },
];

export function getBoardTheme(id: BoardThemeId): BoardTheme {
  return boardThemes.find((t) => t.id === id) ?? boardThemes[0];
}
