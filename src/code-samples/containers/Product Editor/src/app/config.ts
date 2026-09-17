export type ProductStore = "localStorage" | "api";

const configuredStore = import.meta.env.VITE_PRODUCT_STORE;

export const config = {
  productStore: (configuredStore === "api" ? "api" : "localStorage") as ProductStore,
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
};