import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import {CloudService} from '../../providers/cloud-service';
import {ConfigService} from '../../providers/config-service';
import {CartService} from '../../providers/cart-service';

import {CartPage} from "../cart/cart";

/*
  Generated class for the Item page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-item',
  templateUrl: 'item.html'
})
export class ItemPage {

	public item: any;
  public cart: any;
  public images: any;
  public category: any;
  public index: any;

  public optionsModels: any;
  public extrasModels: any;
  public sizesModels: any;
  public showOptions: boolean;
  public showExtras: boolean;
  public showSizes: boolean;

  constructor(
  	private navParams: NavParams,
    public nav: NavController, 
    public alertController: AlertController, 
    public cartService: CartService,
    public configService: ConfigService,
    public loadingCtrl: LoadingController,
    public cloudService: CloudService
  ) {
  	
  	// get sample data for item
    this.item = navParams.get('item');
    this.images = navParams.get('images');
    this.index = navParams.get('index');
    this.category = navParams.get('category');
    console.log(this.item);
    this.optionsModels = {};
    this.extrasModels = {};
    this.sizesModels = {};
    this.showOptions = !(this.item.get('options').length == 0);
    this.showExtras = !(this.item.get('extras').length == 0);
    this.showSizes = !(this.item.get('sizes').length == 0);
    this.cart = cartService.getCart();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ItemPage');
  }

  // toggle favorite
  toggleFav(item) {
    item.faved = !item.faved;
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    loader.present();
  }

  // add item to cart
  addCart(item) {
    var me = this;
    var addOns = {
      options: this.optionsModels,
      extras: this.extrasModels,
      sizes: this.sizesModels
    };
    this.presentLoading();
    this.cartService.add(me.getItemForCart(item,addOns,1));
    // go to cart
    this.nav.setRoot(CartPage);
  }

  outOfStock(item){
    this.presentAlert("Item Out of Stock","",null);
  }

  presentAlert(title,message,call) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            if(call){
              call();
            }
          }
        }
      ]
    });
    alert.present();
  }

  addOnsArrayToMap(array){
    var map = {};
    for(var i=0; i<array.length; i++){
      map[array[i].name] = array[i];
    }
    return map;
  }

  getItemForCart(item,  addOns, quantity){
    var me = this;
    var cartItem = {};
    var itemAddOns = {
      options:[],
      extras:[],
      size: null
    };
    var key;
    var options = me.addOnsArrayToMap(item.get("options"));
    var extras = me.addOnsArrayToMap(item.get("extras"));
    var sizes = me.addOnsArrayToMap(item.get("sizes"));
    var finalPrice = item.get("price");
    cartItem['orignalItem'] = item;
    
    for(key in addOns.options){
      if(addOns.options[key]){
        itemAddOns.options.push(options[key]);
      }
    }

    for(key in addOns.extras){
      if(addOns.extras[key]){
        itemAddOns.extras.push(extras[key]);
        finalPrice+= parseInt(extras[key].value);
      }
    }
    if( typeof addOns.sizes === 'string' ) {
        // input is a string
        itemAddOns.size = sizes[addOns.sizes];
        finalPrice -= item.get("price");
        finalPrice += parseInt(sizes[addOns.sizes].value);
    }
    cartItem['addOns'] = itemAddOns; 
    cartItem['finalPrice'] = finalPrice; 
    cartItem['quantity'] = quantity;
    return cartItem;
  }

  DisableItem(){
    var me = this;
    let alert = this.alertController.create({
      title: "Disable ?",
      subTitle: "If you press YES clients won't be able to make orders for this item. Mark this item OUT OF STOCK?",
      buttons: [
        {
          text: 'YES',
          handler: data => {
            console.log("need to mark item out of stock.");
            me.item.set("outOfStock", true);
            me.item.save(null, {
              success: function(item){
                console.log("store successfully : " +item);
                me.cloudService.fetchMenu();
              },
              error: function(item,error){
                console.log("Error " + error.message);
              }
            });
          }
        },
        {
          text: 'NO',
          handler: data => {
            console.log("no clicked");
          }
        }
      ]
    });
    alert.present();
  }
  
  EnableItem(){
    var me = this;
    let alert = this.alertController.create({
      title: "Enable ?",
      subTitle: "If you press YES clients will be able to make orders for this item. Mark this item in stock?",
      buttons: [
        {
          text: 'YES',
          handler: data => {
            console.log("need to mark item in stock.");
            me.item.set("outOfStock", false);
            me.item.save(null, {
              success: function(item){
                console.log("store successfully : " +item);
                me.cloudService.fetchMenu();
                me.item = item;
              },
              error: function(item,error){
                console.log("Error " + error.message);
              }
            });
          }
        },
        {
          text: 'NO',
          handler: data => {
            console.log("no clicked");
          }
        }
      ]
    });
    alert.present();
  }

  DeleteItem(){
    var me = this;
    let alert = this.alertController.create({
      title: "Delete ?",
      subTitle: "If you press YES clients won't be able view this item in the menu. Delete?",
      buttons: [
        {
          text: 'YES',
          handler: data => {
            me.item.set("isDeleted", true);
            me.item.save(null, {
              success: function(item){
                console.log("store successfully : " +item);
                me.cloudService.fetchMenu();
              },
              error: function(item,error){
                console.log("Error " + error.message);
              }
            });
          }
        },
        {
          text: 'NO',
          handler: data => {
            console.log("no clicked");
          }
        }
      ]
    });
    alert.present();
  }
  ReAddItem(){
    var me = this;
    let alert = this.alertController.create({
      title: "Re Add ?",
      subTitle: "If you press YES item will be added back to menu.",
      buttons: [
        {
          text: 'YES',
          handler: data => {
            me.item.set("isDeleted", false);
            me.item.save(null, {
              success: function(item){
                me.cloudService.fetchMenu();
                me.item = item;
              },
              error: function(item,error){
                console.log("Error " + error.message);
              }
            });
          }
        },
        {
          text: 'NO',
          handler: data => {
            console.log("no clicked");
          }
        }
      ]
    });
    alert.present();
  }

}
