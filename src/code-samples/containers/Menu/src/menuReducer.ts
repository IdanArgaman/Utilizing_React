import type { MenuState } from "./types";
import type { MenuAction } from "./menuActions";
import { addItem, removeItem, updateItem } from "./treeOperations";

export function menuReducer(
  state: MenuState,
  action: MenuAction
): MenuState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: addItem(state.items, action.parentId, action.item),
      };

    case "REMOVE_ITEM": {
      const expandedIds = new Set(state.expandedIds);
      expandedIds.delete(action.id);

      return {
        ...state,
        items: removeItem(state.items, action.id),
        expandedIds,
        selectedId:
          state.selectedId === action.id ? null : state.selectedId,
      };
    }

    case "UPDATE_ITEM":
      return {
        ...state,
        items: updateItem(state.items, action.id, action.changes),
      };

    case "SELECT_ITEM":
      return {
        ...state,
        selectedId: action.id,
      };

    case "TOGGLE_EXPANDED": {
      const expandedIds = new Set(state.expandedIds);

      if (expandedIds.has(action.id)) {
        expandedIds.delete(action.id);
      } else {
        expandedIds.add(action.id);
      }

      return { ...state, expandedIds };
    }

    case "EXPAND_ITEM": {
      const expandedIds = new Set(state.expandedIds);
      expandedIds.add(action.id);
      return { ...state, expandedIds };
    }

    case "COLLAPSE_ITEM": {
      const expandedIds = new Set(state.expandedIds);
      expandedIds.delete(action.id);
      return { ...state, expandedIds };
    }

    default:
      return state;
  }
}