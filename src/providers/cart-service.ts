import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Events } from 'ionic-angular';
import Parse from 'parse';

/*
  Generated class for the CartService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CartService {

	private cart: any = null;

	constructor(
		public http: Http,
		 public events: Events
	) {}

	getNewCartCart(){
		var me = this;
		return new Promise((resolve, reject) => {
			var Cart = Parse.Object.extend("Cart");
			var cart = new Cart();
			cart.set("user", Parse.User.current());
			cart.set("items", []);
			cart.set("total", 0);
			cart.save(null, {
		      success: function(cart) {
		      	me.cart = cart;
		      	me.events.publish('cart:event', this.cart);
		      	resolve(cart)
		      },
		      error: function(cart,error){
		      	reject(error);
		      }
		  });
		});
	};

  	cleanCart(){

  	}

	saveCart(){
		let me = this;
		return new Promise((resolve, reject) => {
			this.cart.save(null, {
			  success: function(cart) {
			  	me.events.publish('cart:event', cart);
			    resolve(cart)
			  },
			  error: function(cart, error) {
			    error(error);
			  }
			});
		});
	}

	// item {item: <JSON MenuItem>, qty:int }
	add(item){
		let me = this;
		return new Promise((resolve, reject) => {
			me.cart.set("items",me.cart.get("items").push(item));
		    me.cart.set("total", me.cart.get("total") + (item.quantity*item.finalPrice));
		    me.saveCart().then((cart)=>{
		    	me.cart=cart;
		    }).catch((error)=>{
		    	reject(error);
		    });  
		});
	}

	removeItem(index){
		var me = this;
		return new Promise((resolve, reject) => {
			var items = me.cart.get("items");
			var deduct = (items[index].finalPrice*items[index].qty);
		    me.cart.set("total",  (me.cart.get("total")-deduct));
		    items.splice(index, 1);
		    me.cart.set("items",items);
		    me.saveCart().then((cart)=>{
		    	me.cart=cart;
		    }).catch((error)=>{
		    	reject(error);
		    });
		});
		    
	}

	getCart(){
		return new Promise((resolve, reject) => {
			var Cart = Parse.Object.extend("Cart");
			var query = new Parse.Query(Cart);
			query.equalTo("user", Parse.User.current());
			query.find({
			  success: function(cart) {
			    resolve(cart);
			  },
			  error: function(cart,error) {
			    reject(error);
			  }
			});
		});
	}

	getCount(){
		return this.cart.get("items").length;
	}

	plusQty(index){
		var me = this;
		return new Promise((resolve, reject) => {
			var items = me.cart.get("items");
			items[index].qty++;
			this.cart.set("total", this.cart.get("total")+items[index].finalPrice);
			me.saveCart().then((cart)=>{
				resolve(cart);
			}).catch((error)=>{
				reject(error);
			});
		});
		
	}

	minusQty(index){
		var me = this;
		return new Promise((resolve, reject) => {
			var items = me.cart.get("items");
			items[index].qty--;
			this.cart.set("total", this.cart.get("total")-items[index].finalPrice);
			me.saveCart().then((cart)=>{
				resolve(cart);
			}).catch((error)=>{
				reject(error);
			});
		});
		
	}

}
