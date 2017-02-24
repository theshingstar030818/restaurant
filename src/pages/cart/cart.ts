import {Component} from '@angular/core';
import {NavController, LoadingController} from 'ionic-angular';

import {CartService} from '../../providers/cart-service';
import {ConfigService} from '../../providers/config-service';
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
  loader: any;

  constructor(
  	public nav: NavController,
   	public cartService: CartService,
    public configService: ConfigService,
    public loadingCtrl: LoadingController,
  ) {
    // set sample data
    let me = this;
   	cartService.getCart().then((cart)=>{
   		me.cart = cart;
    }).catch((error)=>{
    	console.error(error);
    });
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader = loader;
    loader.present();
  }

  dismissLoading(){
    if(this.loader){
      this.loader.dismiss().then((response) => {
        return response;
      }).then((response) => {
        console.info(response)
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  // plus quantity
  plusQty(index) {
    var me = this;
    me.presentLoading();
    me.cartService.plusQty(index).then((cart)=>{
    	me.cartService.getCart().then((cart)=>{
        me.dismissLoading();
	    	me.cart = cart;
	    }).catch((error)=>{
        me.dismissLoading();
	    	console.error(error);
	    });
    }).catch((error)=>{
      me.dismissLoading();
    	console.error(error);
    });
    
  }

  // minus quantity
  minusQty(index) {
  	var me = this;
    me.presentLoading();
    me.cartService.minusQty(index).then((cart)=>{
    	me.cartService.getCart().then((cart)=>{
        me.dismissLoading();
	    	me.cart = cart;
	    }).catch((error)=>{
        me.dismissLoading();
	    	console.error(error);
	    });
    }).catch((error)=>{
      me.dismissLoading();
    	console.error(error);
    });
  }

  // remove item from cart
  remove(index) {
    var me = this;
    me.presentLoading();
    this.cartService.removeItem(index).then((cart)=>{
      me.dismissLoading();
    	me.cart = cart;
    }).catch((error)=>{
      me.dismissLoading();
    	console.error(error);
    });
  }

  // click buy button
  buy() {
    this.nav.push(CheckoutPage);
  }
}
