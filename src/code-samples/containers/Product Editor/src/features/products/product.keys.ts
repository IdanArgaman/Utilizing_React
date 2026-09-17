export const productKeys = {
  all: ["products"] as const,
  detail: (id: string) => ["products", id] as const,
};