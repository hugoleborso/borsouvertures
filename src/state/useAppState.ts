import { create } from "zustand";
import type { Opening } from "@/openings/types";
import type { Selection } from "@/openings/selectors";

export type Mode = "learn" | "play";
export type Side = "white" | "black";
export type BoardThemeId = "lichess" | "chesscom" | "nord" | "sand";
export interface PlayScope {
  openingIds: string[];
  variationIds: string[];
  lineIds: string[];
}

interface AppState {
  mode: Mode;
  side: Side;
  boardStyle: BoardThemeId;
  selection: Selection;
  openings: Opening[];
  view: "select" | "session";
  playAutoOpponent: boolean;
  playScope: PlayScope;
  setMode: (mode: Mode) => void;
  setSide: (side: Side) => void;
  setBoardStyle: (style: BoardThemeId) => void;
  setSelection: (selection: Selection) => void;
  setOpenings: (openings: Opening[]) => void;
  setView: (view: "select" | "session") => void;
  setPlayAutoOpponent: (value: boolean) => void;
  setPlayScope: (scope: PlayScope) => void;
}

export const useAppState = create<AppState>((set) => ({
  mode: "learn",
  side: "white",
  boardStyle: "chesscom",
  selection: { openingId: "all", variationId: "all", lineId: "all" },
  openings: [],
  view: "select",
  playAutoOpponent: true,
  playScope: { openingIds: [], variationIds: [], lineIds: [] },
  setMode: (mode) => set({ mode }),
  setSide: (side) => set({ side }),
  setBoardStyle: (boardStyle) => set({ boardStyle }),
  setSelection: (selection) => set({ selection }),
  setOpenings: (openings) => set({ openings }),
  setView: (view) => set({ view }),
  setPlayAutoOpponent: (value) => set({ playAutoOpponent: value }),
  setPlayScope: (playScope) => set({ playScope }),
}));
