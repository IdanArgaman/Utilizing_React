import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { productKeys } from "./product.keys";
import { productService } from "./product.service";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.types";

export function useProducts() {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productService.getProducts,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: id ? productKeys.detail(id) : ["products", "empty"],
    queryFn: () => productService.getProduct(id!),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) =>
      productService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateProductInput;
    }) => productService.updateProduct(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),

    // Optimistic UI: remove the row immediately and roll back if deletion fails.
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previous =
        queryClient.getQueryData<Awaited<ReturnType<typeof productService.getProducts>>>(
          productKeys.all,
        );

      queryClient.setQueryData(
        productKeys.all,
        (products: Awaited<ReturnType<typeof productService.getProducts>> | undefined) =>
          products?.filter((product) => product.id !== id),
      );

      return { previous };
    },

    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(productKeys.all, context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}