import type { JsonObject } from "../types/json";

export const sampleData: JsonObject = {
  product: {
    name: "CodeValue Portal",
    isActive: true,
    releaseVersion: 12,
    branding: {
      logoText: "CodeValue",
      primaryColor: "#2563EB",
      secondaryColor: "#F97316",
      showWatermark: false,
    },
  },
  dashboard: {
    title: "Operations Dashboard",
    refreshInterval: 30,
    isLive: true,
    appearance: {
      backgroundColor: "#F3F4F6",
      cardColor: "#FFFFFF",
      textColor: "#111827",
      useCompactMode: false,
    },
  },
  editor: {
    allowInlineEdit: true,
    showLineNumbers: false,
    fontSize: 14,
    colors: {
      stringColor: "#16A34A",
      numberColor: "#DC2626",
      booleanColor: "#7C3AED",
      keyColor: "#0F172A",
    },
  },
  permissions: {
    canEdit: true,
    canDelete: false,
    canPublish: true,
    roles: {
      adminEnabled: true,
      editorEnabled: true,
      viewerEnabled: true,
    },
  },
  metadata: {
    createdBy: "system",
    environment: "staging",
    buildNumber: 1042,
    isArchived: false,
  },
};
