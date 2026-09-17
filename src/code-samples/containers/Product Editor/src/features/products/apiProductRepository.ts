import { config } from "../../app/config";
import type { ProductRepository } from "./product.repository";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "./product.types";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // Keep the default message when the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiProductRepository: ProductRepository = {
  getAll: () => request<Product[]>("/products"),

  getById: (id) => request<Product>(`/products/${id}`),

  create: (input: CreateProductInput) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id, input: UpdateProductInput) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  delete: (id) =>
    request<void>(`/products/${id}`, {
      method: "DELETE",
    }),
};