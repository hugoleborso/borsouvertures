import { create } from "zustand";
import type { Opening } from "@/openings/types";
import type { Selection } from "@/openings/selectors";

export type Mode = "learn" | "play";
export type Side = "white" | "black";
export type BoardThemeId = "lichess" | "chesscom" | "nord" | "sand";

interface AppState {
  mode: Mode;
  side: Side;
  boardStyle: BoardThemeId;
  selection: Selection;
  openings: Opening[];
  setMode: (mode: Mode) => void;
  setSide: (side: Side) => void;
  setBoardStyle: (style: BoardThemeId) => void;
  setSelection: (selection: Selection) => void;
  setOpenings: (openings: Opening[]) => void;
}

export const useAppState = create<AppState>((set) => ({
  mode: "learn",
  side: "white",
  boardStyle: "chesscom",
  selection: { openingId: "all", variationId: "all", lineId: "all" },
  openings: [],
  setMode: (mode) => set({ mode }),
  setSide: (side) => set({ side }),
  setBoardStyle: (boardStyle) => set({ boardStyle }),
  setSelection: (selection) => set({ selection }),
  setOpenings: (openings) => set({ openings }),
}));
