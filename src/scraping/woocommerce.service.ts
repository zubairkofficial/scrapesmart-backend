import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import * as https from "https";
import { Subscriber } from "rxjs";
import { IProduct } from "./types";

@Injectable()
export class WooCommerceService {
  client: AxiosInstance;

  constructor() {}

  init(siteURL: string, consumerKey: string, consumerSec: string) {
    this.client = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Disable SSL verification
      }),
      baseURL: `${siteURL}/wp-json/wc/v3`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSec}`).toString("base64")}`,
      },
    });
    return this;
  }

  async getProducts() {
    if (!this.client) {
      throw new Error("Client not initialized");
    }
    const { data } = await this.client.get("products");
    return data;
  }

  async createProducts(products: IProduct[], subscriber?: Subscriber<any>) {
    for (let i = 0; i < products.length; i++) {
      subscriber &&
        subscriber.next({
          data: {
            type: "images",
            current: i + 1,
            total: products.length,
          },
        });

      const product = products[i];
      const { data } = await this.client.post("/products", {
        name: `${product.partName} ${product.year} ${product.model}`,
        type: "simple",
        regular_price: ((+product.price.match(/\d+/g)?.[0] | 0) * 1.3).toFixed(
          2,
        ),
        description: `<h1>${product.partName} ${product.year} ${product.model}</h1><p>${product.description}</p>`,
        images: product.images.map((image) => ({
          src: image,
        })),
      });

      product.wooCommerceID = data.id;
      product.wooCommerceLink = data.permalink;
    }
    return "done";
  }

  async getProductsCount() {
    if (!this.client) {
      throw new Error("Client not initialized");
    }
    const res = await this.client.get("products?_fields=id&per_page=1");
    return res.headers["x-wp-total"];
  }
}
