import { Box, Paper, Typography } from "@mui/material";
import { useJsonStore } from "../../store/jsonStore";
import type { JsonPathSegment, JsonValue } from "../../types/json";
import { JsonNode } from "./JsonNode";

interface RootEntry {
  key: JsonPathSegment;
  value: JsonValue;
}

function getRootEntries(data: JsonValue): RootEntry[] {
  if (Array.isArray(data)) {
    return data.map((value, index) => ({ key: index, value }));
  }
  if (data !== null && typeof data === "object") {
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }
  return [{ key: "value", value: data }];
}

export function JsonViewer() {
  const data = useJsonStore((state) => state.data);
  const entries = getRootEntries(data);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      {entries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No data loaded
        </Typography>
      ) : (
        <Box>
          {entries.map((entry) => (
            <JsonNode key={entry.key} label={entry.key} value={entry.value} path={[entry.key]} depth={0} />
          ))}
        </Box>
      )}
    </Paper>
  );
}
