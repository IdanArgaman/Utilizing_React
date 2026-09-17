import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "../features/products/product.schema";
import type { Product } from "../features/products/product.types";

interface ProductFormProps {
  product?: Product;
  isSaving: boolean;
  onSubmit: (input: ProductFormValues) => void;
  onCancel: () => void;
}

const emptyForm: ProductFormInput = {
  name: "",
  description: "",
  price: 0,
  category: "",
};

export function ProductForm({
  product,
  isSaving,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    reset(
      product
        ? {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
          }
        : emptyForm,
    );
  }, [product, reset]);

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Name"
        placeholder="Wireless keyboard"
        fullWidth
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        label="Category"
        placeholder="Accessories"
        fullWidth
        {...register("category")}
        error={!!errors.category}
        helperText={errors.category?.message}
      />

      <TextField
        label="Price"
        type="number"
        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
        fullWidth
        {...register("price")}
        error={!!errors.price}
        helperText={errors.price?.message}
      />

      <TextField
        label="Description"
        placeholder="Short product description"
        multiline
        rows={4}
        fullWidth
        {...register("description")}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? "Saving..." : product ? "Save changes" : "Create product"}
        </Button>
      </Stack>
    </Stack>
  );
}
