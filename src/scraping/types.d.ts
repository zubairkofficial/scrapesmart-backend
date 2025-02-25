export interface IProduct {
  year: number;
  partName: string;
  model: string;
  miles: null;
  stockID: string;
  images: string[] | null;
  distKM: null;
  description: string;
  imageURL: string;
  partGrade: string;
  price: string;
  dealer: IDealer;
}

export interface IDealer {
  website: string;
  address: string;
  email: string;
  phone: string;
}