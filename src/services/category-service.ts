import {Injectable} from "@angular/core";
import {CATEGORIES} from "./mock-categories";

import Parse from 'parse';

@Injectable()
export class CategoryService {
  public categories: any;

  constructor() {}

  getAll() {
    return this.categories;
  }

  getItem(id) {
      if (id in this.categories) {
        console.log("found items inmenu for this category");
        return this.categories[id];
      }else{
        console.log("no items in menu for this category");
        return null;
      }
  }

  remove(item) {
    this.categories.splice(this.categories.indexOf(item), 1);
  }
}
