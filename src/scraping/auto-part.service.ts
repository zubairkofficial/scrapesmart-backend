import { Injectable } from '@nestjs/common';
import { Axios } from "axios";
import * as qs from 'qs';
import { ScrapeInput } from "./dto/scraping.dto";

@Injectable()
export class AutoPartService {
  private api: Axios;

  constructor() {
    this.api = new Axios({
      baseURL: 'https://car-part.com',
      headers: {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Origin": "https://car-part.com",
        "Referer": "https://car-part.com/cgi-bin/search.cgi",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  async getInterchange(data: ScrapeInput) {
    const payload = qs.stringify({
      userModel: data.model,
      userPart: data.partName,
      userLocation: data.location,
      userSearch: "int",
      userInterchange: "None",
      userPreference: data.sortBy,
      userZip: data.zipCode,
      userDate1: "1900",
      userDate2: data.year,
    });

    return this.api.post('/cgi-bin/search.cgi', payload);
  }

  async getProductsPage(data: ScrapeInput) {
    const searchOptions = data?.interchange ? {
      userInterchange: data?.interchange,
      userSearch: "int",
    } : {
      userSearch: "exact",
    };

    const payload = qs.stringify({
      userModel: data.model,
      userPart: data.partName,
      userLocation: data.location,
      userPreference: data.sortBy,
      ...searchOptions,
      userZip: data.zipCode,
      userDate: "1900",
      userDate2: data.year,
    });

    return this.api.post('/cgi-bin/search.cgi', payload);
  }
}