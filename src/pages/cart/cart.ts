import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {CartService} from '../../providers/cart-service';
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

  constructor(
  	public nav: NavController,
   	public cartService: CartService) {
    // set sample data
    let me = this;
   	cartService.getCart().then((cart)=>{
   		me.cart = cart;
    }).catch((error)=>{
    	console.error(error);
    });
  }

  // plus quantity
  plusQty(index) {
    var me = this;
    me.cartService.plusQty(index).then((cart)=>{
    	me.cartService.getCart().then((cart)=>{
	    	me.cart = cart;
	    }).catch((error)=>{
	    	console.error(error);
	    });
    }).catch((error)=>{
    	console.error(error);
    });
    
  }

  // minus quantity
  minusQty(index) {
  	var me = this;
    me.cartService.minusQty(index).then((cart)=>{
    	me.cartService.getCart().then((cart)=>{
	    	me.cart = cart;
	    }).catch((error)=>{
	    	console.error(error);
	    });
    }).catch((error)=>{
    	console.error(error);
    });
  }

  // remove item from cart
  remove(index) {
    var me = this;
    this.cartService.removeItem(index).then((cart)=>{
    	me.cart = cart;
    }).catch((error)=>{
    	console.error(error);
    });
  }

  // click buy button
  buy() {
    if(this.cart.items.length>0){
      this.nav.push(CheckoutPage);
    }
  }
}
