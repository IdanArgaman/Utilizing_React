import { productRepository } from "./productRepository";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "./product.types";

export const productService = {
  getProducts: () => productRepository.getAll(),

  getProduct: (id: string) => productRepository.getById(id),

  createProduct: (input: CreateProductInput) =>
    productRepository.create(input),

  updateProduct: (id: string, input: UpdateProductInput) =>
    productRepository.update(id, input),

  deleteProduct: (id: string) =>
    productRepository.delete(id),
};