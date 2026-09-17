import { create } from "zustand";
import { sampleData } from "../data/sampleData";
import type { JsonPath, JsonValue } from "../types/json";
import { editNodeAtPath } from "../utils/jsonEdit";
import { removeValueAtPath, setValueAtPath } from "../utils/jsonPath";

interface JsonStoreState {
  data: JsonValue;
  originalData: JsonValue;
  isDirty: boolean;
  loadData: (data: JsonValue) => void;
  setValueAtPath: (path: JsonPath, value: JsonValue) => void;
  removeValueAtPath: (path: JsonPath) => void;
  editNode: (path: JsonPath, newKey: string | null, newValue: JsonValue) => void;
  resetData: () => void;
}

export const useJsonStore = create<JsonStoreState>((set) => ({
  data: sampleData,
  originalData: sampleData,
  isDirty: false,

  loadData: (data) =>
    set({
      data,
      originalData: data,
      isDirty: false,
    }),

  setValueAtPath: (path, value) =>
    set((state) => {
      const nextData = setValueAtPath(state.data, path, value);
      return {
        data: nextData,
        isDirty: JSON.stringify(nextData) !== JSON.stringify(state.originalData),
      };
    }),

  removeValueAtPath: (path) =>
    set((state) => {
      const nextData = removeValueAtPath(state.data, path);
      return {
        data: nextData,
        isDirty: JSON.stringify(nextData) !== JSON.stringify(state.originalData),
      };
    }),

  editNode: (path, newKey, newValue) =>
    set((state) => {
      const nextData = editNodeAtPath(state.data, path, newKey, newValue);
      return {
        data: nextData,
        isDirty: JSON.stringify(nextData) !== JSON.stringify(state.originalData),
      };
    }),

  resetData: () =>
    set((state) => ({
      data: state.originalData,
      isDirty: false,
    })),
}));
