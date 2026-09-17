import type { MenuItem } from "./types";

export type MenuAction =
  | {
      type: "ADD_ITEM";
      parentId: string | null;
      item: MenuItem;
    }
  | {
      type: "REMOVE_ITEM";
      id: string;
    }
  | {
      type: "UPDATE_ITEM";
      id: string;
      changes: Partial<Omit<MenuItem, "id" | "children">>;
    }
  | {
      type: "SELECT_ITEM";
      id: string | null;
    }
  | {
      type: "TOGGLE_EXPANDED";
      id: string;
    }
  | {
      type: "EXPAND_ITEM";
      id: string;
    }
  | {
      type: "COLLAPSE_ITEM";
      id: string;
    };