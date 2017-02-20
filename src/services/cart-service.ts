import {Injectable} from "@angular/core";
//import {CART} from "./mock-cart";

import { Events } from 'ionic-angular';

@Injectable()
export class CartService {
  private cart: any;

  constructor(
    public events: Events
  ) {
    //always parse when getting items from local storage
    this.cart = JSON.parse(localStorage.getItem("cart"));
    if(this.cart){
      console.log("found a cart in local storage");
    } else{
      //kind of first time user on the device cache cart object to local storage
      this.cart = { items: [], total:0, showFotter:false};
      //always stringify before saving an object to local storage
      this.saveCart();
    }
  }

  cleanCart(){
    this.cart = { items: [], total:0, showFotter:false};
    this.saveCart();
    this.events.publish('cart:changed', this.cart);
  }

  saveCart(){
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.cart = JSON.parse(localStorage.getItem("cart"));
  }

  add(item){
    console.log("add item to cart : " + item);
    this.cart.items.push(item);
    this.cart.total += item.quantity*item.finalPrice;
    this.saveCart();
    this.events.publish('cart:changed', this.cart);
  }

  removeItem(index){
    console.log("need to remove item at index : " + index);
    this.cart.total -= (this.cart.items[index].finalPrice*this.cart.items[index].quantity);
    this.cart.items.splice(index, 1);
    this.cart.showFotter = (this.cart.items.length>0);
    this.saveCart();
    this.events.publish('cart:changed', this.cart);
  }

  getCart() {
    return this.cart;
  }

  setCart(cart){
    this.cart = cart;
    this.saveCart();
  }

  getCount(){
    return this.cart.items.length;
  }

  plusQty(index){
    this.cart.items[index].quantity++;
    this.cart.total += this.cart.items[index].finalPrice;
    this.saveCart();
  }

  minusQty(index) {
    if (this.cart.items[index].quantity > 1){
      this.cart.items[index].quantity--;
      this.cart.total -= this.cart.items[index].finalPrice;
    }else if(this.cart.items[index].quantity == 1){
      this.removeItem(index);
    }
    this.saveCart();
  }
}
