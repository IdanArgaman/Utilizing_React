import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import type { MenuItem, MenuState } from "./types";
import type { MenuAction } from "./menuActions";
import { menuReducer } from "./menuReducer";

type MenuContextValue = {
  state: MenuState;
  selectItem: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
  expandItem: (id: string) => void;
  collapseItem: (id: string) => void;
  addItem: (parentId: string | null, item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateItem: (
    id: string,
    changes: Partial<Omit<MenuItem, "id" | "children">>
  ) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

function createInitialState(initialItems: MenuItem[]): MenuState {
  return {
    items: initialItems,
    selectedId: null,
    expandedIds: new Set(),
  };
}

type MenuProviderProps = {
  children: ReactNode;
  initialItems: MenuItem[];
};

export function MenuProvider({
  children,
  initialItems,
}: MenuProviderProps) {
  const [state, dispatch] = useReducer(
    menuReducer,
    initialItems,
    createInitialState
  );

  const dispatchAction = (action: MenuAction) => dispatch(action);

  const value: MenuContextValue = {
    state,

    selectItem: (id) =>
      dispatchAction({ type: "SELECT_ITEM", id }),

    toggleExpanded: (id) =>
      dispatchAction({ type: "TOGGLE_EXPANDED", id }),

    expandItem: (id) =>
      dispatchAction({ type: "EXPAND_ITEM", id }),

    collapseItem: (id) =>
      dispatchAction({ type: "COLLAPSE_ITEM", id }),

    addItem: (parentId, item) =>
      dispatchAction({ type: "ADD_ITEM", parentId, item }),

    removeItem: (id) =>
      dispatchAction({ type: "REMOVE_ITEM", id }),

    updateItem: (id, changes) =>
      dispatchAction({ type: "UPDATE_ITEM", id, changes }),
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu(): MenuContextValue {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used inside a MenuProvider");
  }

  return context;
}