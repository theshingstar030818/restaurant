import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {CartService} from '../../services/cart-service';
import {CheckoutPage} from "../checkout/checkout";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html'
})
export class CartPage {
  // cart data
  public cart: any;

  constructor(public nav: NavController, public cartService: CartService) {
    // set sample data
    this.cart = cartService.getCart();
    this.cart.showFooter = (this.cart.items.length>0);
  }

  // plus quantity
  plusQty(index) {
    this.cartService.plusQty(index);
    this.cart = this.cartService.getCart();
  }

  // minus quantity
  minusQty(index) {
    this.cartService.minusQty(index);
    this.cart = this.cartService.getCart();
  }

  // remove item from cart
  remove(index) {
    this.cartService.removeItem(index);
    this.cart = this.cartService.getCart();
  }

  // click buy button
  buy() {
    if(this.cart.items.length>0){
      this.nav.push(CheckoutPage);
    }
  }
}
