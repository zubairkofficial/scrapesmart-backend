import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { AdminApiClient, createAdminApiClient } from "@shopify/admin-api-client";
import { IProduct } from "./types";

@Injectable()
export class ShopifyService {
  client: AdminApiClient;

  constructor(
    private configService: ConfigService,
  ) {
    this.client = createAdminApiClient({
      storeDomain: this.configService.get<string>("SHOPIFY_STORE_URL"),
      apiVersion: '2025-01',
      accessToken: this.configService.get<string>("SHOPIFY_ACCESS_TOKEN"),
    });
  }


  async getProducts() {
    const operation = `{
      products (first: 100) {
        edges {
          node {
            id
            title
          }
        }
      }
    }`;

    const { data, errors } = await this.client.request(operation);

    console.log(errors);

    return data;
  }


  async createProducts(products: IProduct[]) {
    const spfProducts = [];

    await Promise.allSettled(products.map((product) => (async (product: IProduct) => {
      const CreateProductMutation = `#graphql
        mutation createProductAsynchronous($productSet: ProductSetInput!,$synchronous: Boolean!) {
          productSet(synchronous: $synchronous, input: $productSet) {
            product {
              id
            }
            productSetOperation {
              id
              status
              userErrors {
                code
                field
                message
              }
            }
            userErrors {
              code
              field
              message
            }
          }
        }`;

      const images = product.images ? product.images.map(image => ({
        contentType: "IMAGE",
        originalSource: image,
      })) : [];

      const { data, errors } = await this.client.request(CreateProductMutation, {
        variables: {
          synchronous: true,
          productSet: {
            files: images,
            title: `${product.partName} ${product.model} ${product.year}`,
            descriptionHtml: `${product.description}`,
            productOptions: [{
              name: "Part",
              position: 1,
              values: [{
                name: product.partName.split(" ").join("-"),
              }]
            }],
            variants: [{
              optionValues: [{
                optionName: "Part",
                name: product.partName.split(" ").join("-"),
              }],
              price: +((+product.price.match(/\d+/g)?.[0] | 0) * 1.3).toFixed(2),
            }],

          }
        },
      });

      if (!errors) {
        spfProducts.push(data);
      }
    })(product)));

    return spfProducts;
  }


}