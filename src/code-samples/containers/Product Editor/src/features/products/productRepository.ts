import { config } from "../../app/config";
import { apiProductRepository } from "./apiProductRepository";
import { localStorageProductRepository } from "./localStorageProductRepository";
import type { ProductRepository } from "./product.repository";

export const productRepository: ProductRepository =
  config.productStore === "api"
    ? apiProductRepository
    : localStorageProductRepository;