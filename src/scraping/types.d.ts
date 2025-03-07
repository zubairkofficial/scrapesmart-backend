type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface IProduct {
  year: number;
  wooCommerceID: number;
  wooCommerceLink: string;
  partName: string;
  model: string;
  stockID: string;
  images: string[];
  distKM: string;
  description: string;
  imageURL: string;
  partGrade: string;
  price: string;
  miles: string;
  originalPrice: number;
  source: string;
  dealer: IDealer;
}

export interface IDealer {
  website: string;
  address: string;
  email: string;
  phone: string;
}
