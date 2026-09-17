import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { JsonPathSegment, JsonValue } from "../../types/json";
import {
  isHexColor,
  normalizeHexColor,
  parseFieldValue,
  stringifyFieldValue,
  type JsonFieldType,
} from "../../utils/jsonType";

interface EditNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (newKey: string | null, newValue: JsonValue) => void;
  label: JsonPathSegment;
  value: JsonValue;
  fieldType: JsonFieldType;
  canRenameKey: boolean;
  canEditValue: boolean;
  validateKey: (candidateKey: string) => string | true;
}

interface FormValues {
  key: string;
  value: string;
}

export function EditNodeDialog({
  open,
  onClose,
  onSave,
  label,
  value,
  fieldType,
  canRenameKey,
  canEditValue,
  validateKey,
}: EditNodeDialogProps) {
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: { key: String(label), value: stringifyFieldValue(fieldType, value) },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({ key: String(label), value: stringifyFieldValue(fieldType, value) });
    }
  }, [open, label, value, fieldType, reset]);

  const onSubmit = (values: FormValues) => {
    const newKey = canRenameKey ? values.key.trim() : null;
    const newValue = canEditValue ? parseFieldValue(fieldType, values.value) : value;
    onSave(newKey, newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit field</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {canRenameKey && (
            <Controller
              name="key"
              control={control}
              rules={{
                required: "Name is required",
                validate: (candidate) => validateKey(candidate.trim()),
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name"
                  autoFocus
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          {canEditValue && fieldType === "boolean" && (
            <Controller
              name="value"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value === "true"}
                      onChange={(event) => field.onChange(event.target.checked ? "true" : "false")}
                    />
                  }
                  label="Value"
                />
              )}
            />
          )}

          {canEditValue && fieldType === "number" && (
            <Controller
              name="value"
              control={control}
              rules={{
                required: "Value is required",
                validate: (candidate) => (candidate.trim() !== "" && !Number.isNaN(Number(candidate))) || "Must be a valid number",
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Value"
                  type="number"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}

          {canEditValue && fieldType === "hexColor" && (
            <Controller
              name="value"
              control={control}
              rules={{
                required: "Value is required",
                validate: (candidate) => isHexColor(candidate) || "Must be a valid hex color, e.g. #A1B2C3",
              }}
              render={({ field, fieldState }) => (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    {...field}
                    label="Value"
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                  <input
                    type="color"
                    value={normalizeHexColor(field.value)}
                    onChange={(event) => field.onChange(event.target.value)}
                    style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer" }}
                  />
                </Stack>
              )}
            />
          )}

          {canEditValue && fieldType === "string" && (
            <Controller
              name="value"
              control={control}
              rules={{ required: "Value is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Value"
                  fullWidth
                  multiline
                  maxRows={4}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={!formState.isValid}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
