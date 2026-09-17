import type { JsonObject, JsonPath, JsonValue } from "../types/json";
import { getValueAtPath, setValueAtPath } from "./jsonPath";

/**
 * Updates the value at `path` and, optionally, renames the key that holds it.
 * Renaming preserves the parent object's key order (a plain remove+add would
 * move the renamed key to the end). Only the ancestor chain up to the root is
 * rebuilt - untouched sibling branches keep their original references so
 * memoized nodes subscribed to those branches don't re-render.
 */
export function editNodeAtPath(
  data: JsonValue,
  path: JsonPath,
  newKey: string | null,
  newValue: JsonValue,
): JsonValue {
  if (path.length === 0) {
    return newValue;
  }

  const segment = path[path.length - 1];
  const parentPath = path.slice(0, -1);

  if (newKey === null || newKey === segment || typeof segment === "number") {
    return setValueAtPath(data, path, newValue);
  }

  const parent = getValueAtPath(data, parentPath);
  if (parent === null || typeof parent !== "object" || Array.isArray(parent)) {
    return setValueAtPath(data, path, newValue);
  }

  const renamedParent: JsonObject = {};
  for (const [key, existingValue] of Object.entries(parent)) {
    if (key === segment) {
      renamedParent[newKey] = newValue;
    } else {
      renamedParent[key] = existingValue;
    }
  }

  return setValueAtPath(data, parentPath, renamedParent);
}

/** Whether `candidateKey` collides with a sibling of the node at `path`. */
export function isKeyNameTaken(data: JsonValue, path: JsonPath, candidateKey: string): boolean {
  const parentPath = path.slice(0, -1);
  const currentKey = path[path.length - 1];
  const parent = getValueAtPath(data, parentPath);

  if (parent === null || typeof parent !== "object" || Array.isArray(parent)) {
    return false;
  }

  return Object.keys(parent).some((key) => key !== currentKey && key === candidateKey);
}
