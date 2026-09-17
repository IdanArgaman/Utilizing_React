import { memo, useCallback, useState } from "react";
import { Box, Chip, Collapse, IconButton, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useJsonStore } from "../../store/jsonStore";
import type { JsonPath, JsonPathSegment, JsonValue } from "../../types/json";
import { isKeyNameTaken } from "../../utils/jsonEdit";
import { getJsonNodeType, JSON_NODE_TYPE_LABELS, type JsonNodeType } from "../../utils/jsonType";
import { EditNodeDialog } from "./EditNodeDialog";

interface JsonNodeProps {
  label: JsonPathSegment;
  value: JsonValue;
  path: JsonPath;
  depth: number;
}

interface JsonEntry {
  key: JsonPathSegment;
  value: JsonValue;
}

const typeColors: Record<JsonNodeType, "default" | "success" | "error" | "secondary" | "info" | "warning"> = {
  string: "success",
  number: "error",
  boolean: "secondary",
  hexColor: "default",
  object: "info",
  array: "warning",
};

function getChildEntries(value: JsonValue): JsonEntry[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ key: index, value: item }));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => ({ key, value: item }));
  }
  return [];
}

function formatPrimitive(value: JsonValue): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return String(value);
}

function arePropsEqual(prev: JsonNodeProps, next: JsonNodeProps): boolean {
  return (
    prev.value === next.value &&
    prev.label === next.label &&
    prev.depth === next.depth &&
    prev.path.length === next.path.length &&
    prev.path.every((segment, index) => segment === next.path[index])
  );
}

function JsonNodeComponent({ label, value, path, depth }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const editNode = useJsonStore((state) => state.editNode);

  const type = getJsonNodeType(value);
  const isExpandable = type === "object" || type === "array";
  const entries = isExpandable ? getChildEntries(value) : [];

  const canRenameKey = typeof label === "string";
  const canEditValue = !isExpandable;
  const canEdit = canRenameKey || canEditValue;

  const validateKey = useCallback(
    (candidateKey: string) => {
      if (candidateKey === "") {
        return "Name is required";
      }
      if (candidateKey !== String(label) && isKeyNameTaken(useJsonStore.getState().data, path, candidateKey)) {
        return "Name already used by a sibling field";
      }
      return true as const;
    },
    [label, path],
  );

  const handleSave = useCallback(
    (newKey: string | null, newValue: JsonValue) => {
      editNode(path, newKey, newValue);
      setDialogOpen(false);
    },
    [editNode, path],
  );

  return (
    <Box sx={{ pl: depth === 0 ? 0 : 2 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ py: 0.25, "&:hover .json-node-edit-button": { visibility: "visible" } }}
      >
        {isExpandable ? (
          <IconButton size="small" onClick={() => setCollapsed((prev) => !prev)} sx={{ p: 0.25 }}>
            {collapsed ? <KeyboardArrowRightIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28, flexShrink: 0 }} />
        )}

        <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>

        <Chip
          label={JSON_NODE_TYPE_LABELS[type]}
          size="small"
          color={typeColors[type]}
          variant="outlined"
          sx={{ height: 18, fontSize: 11 }}
        />

        {isExpandable ? (
          <Typography variant="caption" color="text.secondary">
            {type === "array" ? `[${entries.length}]` : `{${entries.length}}`}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            {type === "hexColor" && (
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "3px",
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: value as string,
                }}
              />
            )}
            <Typography variant="body2" component="span" sx={{ fontFamily: "monospace" }}>
              {formatPrimitive(value)}
            </Typography>
          </Box>
        )}

        {canEdit && (
          <IconButton
            size="small"
            className="json-node-edit-button"
            onClick={() => setDialogOpen(true)}
            sx={{ p: 0.25, visibility: "hidden" }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        )}
      </Stack>

      {isExpandable && (
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <Box sx={{ borderLeft: "1px dashed", borderColor: "divider", ml: 1.5 }}>
            {entries.map((entry) => (
              <JsonNode
                key={entry.key}
                label={entry.key}
                value={entry.value}
                path={[...path, entry.key]}
                depth={depth + 1}
              />
            ))}
          </Box>
        </Collapse>
      )}

      {canEdit && (
        <EditNodeDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          label={label}
          value={value}
          fieldType={type === "object" || type === "array" ? "string" : type}
          canRenameKey={canRenameKey}
          canEditValue={canEditValue}
          validateKey={validateKey}
        />
      )}
    </Box>
  );
}

export const JsonNode = memo(JsonNodeComponent, arePropsEqual);
