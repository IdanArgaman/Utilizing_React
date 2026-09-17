import type { ProductRepository } from "./product.repository";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "./product.types";

const STORAGE_KEY = "interview-products";

function readProducts(): Product[] {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return [];

  try {
    return JSON.parse(value) as Product[];
  } catch {
    return [];
  }
}

function writeProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export const localStorageProductRepository: ProductRepository = {
  async getAll() {
    return readProducts();
  },

  async getById(id) {
    const product = readProducts().find((item) => item.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  },

  async create(input: CreateProductInput) {
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    writeProducts([...readProducts(), product]);
    return product;
  },

  async update(id: string, input: UpdateProductInput) {
    const products = readProducts();
    const index = products.findIndex((item) => item.id === id);

    if (index === -1) throw new Error("Product not found");

    const updated = { ...products[index], ...input };
    products[index] = updated;
    writeProducts(products);

    return updated;
  },

  async delete(id: string) {
    const products = readProducts();
    writeProducts(products.filter((item) => item.id !== id));
  },
};