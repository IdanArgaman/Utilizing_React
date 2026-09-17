export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt">;

export type UpdateProductInput = Partial<CreateProductInput>;