import { useNavigate, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { ProductForm } from "../components/ProductForm";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "../features/products/useProducts";
import type { ProductFormValues } from "../features/products/product.schema";

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const productQuery = useProduct(id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isSaving = createProduct.isPending || updateProduct.isPending;
  const mutationError = createProduct.error ?? updateProduct.error;

  function handleSubmit(input: ProductFormValues) {
    if (isEditing && id) {
      updateProduct.mutate({ id, input }, { onSuccess: () => navigate("/") });
      return;
    }

    createProduct.mutate(input, { onSuccess: () => navigate("/") });
  }

  if (isEditing && productQuery.isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEditing && productQuery.isError) {
    return <Alert severity="error">{productQuery.error.message}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="overline" color="text.secondary">
        {isEditing ? "Edit" : "Create"}
      </Typography>
      <Typography variant="h4" gutterBottom>
        {isEditing ? "Update product" : "New product"}
      </Typography>

      {mutationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mutationError.message}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <ProductForm
          product={productQuery.data}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/")}
        />
      </Paper>
    </Box>
  );
}
