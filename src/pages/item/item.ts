import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import {ItemService} from '../../services/item-service';
import {CartService} from '../../services/cart-service';
import {ConfigService} from '../../services/config-service';
import {UserService} from '../../services/user-service';
import {MenuService} from '../../services/menu-service';

import {CartPage} from "../cart/cart";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-item',
  templateUrl: 'item.html'
})
export class ItemPage {
  // item object
  public item: any;
  public cart: any;

  public optionsModels: any;
  public extrasModels: any;
  public sizesModels: any;

  public showOptions: boolean;
  public showExtras: boolean;
  public showSizes: boolean;

  constructor(
    private navParams: NavParams,
    public nav: NavController, 
    public itemService: ItemService, 
    public alertController: AlertController, 
    public cartService: CartService,
    public configService: ConfigService,
    public userService: UserService,
    public menuService: MenuService,
    public loadingCtrl: LoadingController
  ) {
    // get sample data for item
    let id = navParams.get('id');
    console.log("showing item page for id : " + id);

    this.item = itemService.getItem(id);

    this.optionsModels = {};
    this.extrasModels = {};
    this.sizesModels = {};
    
    this.showOptions = !(this.item.get('options').length == 0);
    this.showExtras = !(this.item.get('extras').length == 0);
    this.showSizes = !(this.item.get('sizes').length == 0);
    
    this.cart = cartService.getCart();
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

    var addOns = {
      options: this.optionsModels,
      extras: this.extrasModels,
      sizes: this.sizesModels
    };
    this.presentLoading();
    this.cartService.add(this.itemService.getItemForCart(item,addOns,1));
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
                me.menuService.fetchMenu();
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
                me.menuService.fetchMenu();
                me.item = me.itemService.getItem(item.id);
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
                me.menuService.fetchMenu();
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
                me.menuService.fetchMenu();
                me.item = me.itemService.getItem(item.id);
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
