import { create } from "zustand";

export type Player = {
  id: string;
  realName: string;
  nickname: string;
};

export type Empire = {
  leaderId: string; // the player whose nickname was NOT yet guessed — they lead
  memberIds: string[]; // players whose nicknames have been guessed and absorbed
};

type GameState = {
  players: Player[];
  empires: Empire[];
  phase: "throne-room" | "whispering" | "proclamation" | "conquest" | "victory";

  // Actions
  addPlayer: (realName: string, nickname: string) => void;
  removePlayer: (id: string) => void;
  startProclamation: () => void;
  startConquest: () => void;
  capture: (guesserId: string, capturedId: string) => void;
  resetGame: () => void;
};

const makeId = () => Math.random().toString(36).slice(2, 8);

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  empires: [],
  phase: "throne-room",

  addPlayer: (realName, nickname) =>
    set((s) => ({
      players: [...s.players, { id: makeId(), realName, nickname }],
    })),

  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  startProclamation: () => set({ phase: "proclamation" }),

  startConquest: () => {
    const { players } = get();
    // Each player starts as the sole leader of their own empire
    const empires: Empire[] = players.map((p) => ({
      leaderId: p.id,
      memberIds: [],
    }));
    set({ phase: "conquest", empires });
  },

  capture: (guesserId, capturedId) => {
    const { empires } = get();

    // Find the empire of the guesser (they must be a leader)
    const guesserEmpire = empires.find((e) => e.leaderId === guesserId);
    if (!guesserEmpire) return;

    // Find the empire where capturedId is the LEADER
    const capturedEmpire = empires.find((e) => e.leaderId === capturedId);

    let updatedEmpires: Empire[];

    if (capturedEmpire) {
      // Captured player is a leader — entire empire merges into guesser's
      updatedEmpires = empires
        .filter((e) => e.leaderId !== capturedId)
        .map((e) =>
          e.leaderId === guesserId
            ? {
                ...e,
                memberIds: [
                  ...e.memberIds,
                  capturedId,
                  ...capturedEmpire.memberIds,
                ],
              }
            : e
        );
    } else {
      // Captured player is a member of another empire
      const hostEmpire = empires.find((e) =>
        e.memberIds.includes(capturedId)
      );
      updatedEmpires = empires.map((e) => {
        if (e.leaderId === guesserId)
          return { ...e, memberIds: [...e.memberIds, capturedId] };
        if (e.leaderId === hostEmpire?.leaderId)
          return {
            ...e,
            memberIds: e.memberIds.filter((id) => id !== capturedId),
          };
        return e;
      });
    }

    const nextEmpires = updatedEmpires;
    const victory = nextEmpires.length === 1;
    set({ empires: nextEmpires, phase: victory ? "victory" : "conquest" });
  },

  resetGame: () =>
    set({ players: [], empires: [], phase: "throne-room" }),
}));
