import type { JsonArray, JsonObject, JsonPath, JsonValue } from "../types/json";

export function getValueAtPath(data: JsonValue, path: JsonPath): JsonValue | undefined {
  let current: JsonValue | undefined = data;

  for (const segment of path) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as JsonObject | JsonArray)[segment as never];
  }

  return current;
}

export function setValueAtPath(data: JsonValue, path: JsonPath, value: JsonValue): JsonValue {
  if (path.length === 0) {
    return value;
  }

  const [segment, ...rest] = path;

  if (typeof segment === "number") {
    const array = Array.isArray(data) ? [...data] : [];
    array[segment] = setValueAtPath(array[segment] ?? null, rest, value);
    return array;
  }

  const object = data !== null && typeof data === "object" && !Array.isArray(data) ? { ...data } : {};
  object[segment] = setValueAtPath(object[segment] ?? null, rest, value);
  return object;
}

export function removeValueAtPath(data: JsonValue, path: JsonPath): JsonValue {
  if (path.length === 0) {
    return data;
  }

  const [segment, ...rest] = path;

  if (rest.length === 0) {
    if (typeof segment === "number" && Array.isArray(data)) {
      const array = [...data];
      array.splice(segment, 1);
      return array;
    }

    if (typeof segment === "string" && data !== null && typeof data === "object" && !Array.isArray(data)) {
      const { [segment]: _removed, ...remaining } = data;
      return remaining;
    }

    return data;
  }

  if (typeof segment === "number" && Array.isArray(data)) {
    const array = [...data];
    array[segment] = removeValueAtPath(array[segment] ?? null, rest);
    return array;
  }

  if (typeof segment === "string" && data !== null && typeof data === "object" && !Array.isArray(data)) {
    const object = { ...data };
    object[segment] = removeValueAtPath(object[segment] ?? null, rest);
    return object;
  }

  return data;
}
