import type { MenuItem } from "./types";

export function addItem(
  items: MenuItem[],
  parentId: string | null,
  newItem: MenuItem
): MenuItem[] {
  if (parentId === null) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...item.children, newItem],
      };
    }

    if (item.children.length > 0) {
      return {
        ...item,
        children: addItem(item.children, parentId, newItem),
      };
    }

    return item;
  });
}

export function removeItem(items: MenuItem[], id: string): MenuItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({
      ...item,
      children:
        item.children.length > 0
          ? removeItem(item.children, id)
          : item.children,
    }));
}

export function updateItem(
  items: MenuItem[],
  id: string,
  changes: Partial<Omit<MenuItem, "id" | "children">>
): MenuItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...changes };
    }

    if (item.children.length > 0) {
      return {
        ...item,
        children: updateItem(item.children, id, changes),
      };
    }

    return item;
  });
}

export function findItem(
  items: MenuItem[],
  id: string
): MenuItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    const found = findItem(item.children, id);

    if (found) {
      return found;
    }
  }

  return null;
}