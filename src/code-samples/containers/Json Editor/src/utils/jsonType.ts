import type { JsonValue } from "../types/json";

export type JsonFieldType = "string" | "number" | "boolean" | "hexColor";

export type JsonNodeType = JsonFieldType | "object" | "array";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(value: JsonValue): value is string {
  return typeof value === "string" && HEX_COLOR_PATTERN.test(value);
}

export function getJsonNodeType(value: JsonValue): JsonNodeType {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value !== null && typeof value === "object") {
    return "object";
  }
  if (isHexColor(value)) {
    return "hexColor";
  }
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  return "string";
}

export const JSON_NODE_TYPE_LABELS: Record<JsonNodeType, string> = {
  string: "String",
  number: "Number",
  boolean: "Boolean",
  hexColor: "Hex Color",
  object: "Object",
  array: "Array",
};

/** Expands a 3-digit hex color to 6 digits (required by <input type="color">). */
export function normalizeHexColor(value: string): string {
  if (!isHexColor(value)) {
    return "#000000";
  }
  if (value.length === 4) {
    const [, r, g, b] = value;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return value.toLowerCase();
}

export function stringifyFieldValue(type: JsonFieldType, value: JsonValue): string {
  if (type === "boolean") {
    return value === true ? "true" : "false";
  }
  return value === null || value === undefined ? "" : String(value);
}

export function parseFieldValue(type: JsonFieldType, raw: string): JsonValue {
  switch (type) {
    case "number": {
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    case "boolean":
      return raw === "true";
    case "hexColor":
    case "string":
    default:
      return raw;
  }
}
