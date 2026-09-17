import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useDeleteProduct, useProducts } from "../features/products/useProducts";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

export function ProductsPage() {
  const navigate = useNavigate();
  const productsQuery = useProducts();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return productsQuery.data;

    return productsQuery.data?.filter((product) =>
      [product.name, product.category, product.description].some((field) =>
        field.toLowerCase().includes(query),
      ),
    );
  }, [productsQuery.data, debouncedSearch]);

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary">
            Catalog
          </Typography>
          <Typography variant="h4">All products</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/products/new")}
        >
          Create product
        </Button>
      </Stack>

      <TextField
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name, category, or description"
        size="small"
        sx={{ maxWidth: 420 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {deleteProduct.error && (
        <Alert severity="error">{deleteProduct.error.message}</Alert>
      )}

      {productsQuery.isPending && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {productsQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => productsQuery.refetch()}>
              Try again
            </Button>
          }
        >
          {productsQuery.error.message}
        </Alert>
      )}

      {productsQuery.data && productsQuery.data.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No products yet
          </Typography>
          <Typography color="text.secondary">
            Create your first product to get started.
          </Typography>
        </Paper>
      )}

      {productsQuery.data &&
        productsQuery.data.length > 0 &&
        filteredProducts?.length === 0 && (
          <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No products match your search
            </Typography>
            <Typography color="text.secondary">
              Try a different name, category, or description.
            </Typography>
          </Paper>
        )}

      {filteredProducts && filteredProducts.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" />
                  </TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography noWrap variant="body2" color="text.secondary">
                      {product.description || "No description."}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="Edit product"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Delete product"
                      disabled={
                        deleteProduct.isPending && deleteProduct.variables === product.id
                      }
                      onClick={() => {
                        if (window.confirm("Delete this product?")) {
                          deleteProduct.mutate(product.id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
