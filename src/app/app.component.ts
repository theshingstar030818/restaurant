import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import {StatusBar} from 'ionic-native';
import { Events } from 'ionic-angular';

import Parse from 'parse';

import {UserService} from "../services/user-service";
import {CartService} from "../services/cart-service";
import {ConfigService} from '../services/config-service';

import { ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

// import pages
import {HomePage} from '../pages/home/home';
// import {CategoriesPage} from '../pages/categories/categories';
// import {FavoritePage} from '../pages/favorite/favorite';
import {OrdersPage} from '../pages/orders/orders';
import {OrdersAdminPage} from '../pages/orders-admin/orders-admin';
import {OrderPage} from '../pages/order/order';
import {CartPage} from '../pages/cart/cart';
import {EmployeePage} from '../pages/employee/employee';
// import {OfferPage} from '../pages/offer/offer';
import {SettingPage} from '../pages/setting/setting';
// import {NewsPage} from '../pages/news/news';
import {AboutPage} from '../pages/about/about';
import {LoginPage} from '../pages/login/login';
import {LogoutPage} from '../pages/logout/logout';
import {RegisterPage} from '../pages/register/register';
// import {ChatsPage} from '../pages/chats/chats';
// end import pages

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content'),
    viewCtrl: new ViewController()
  }
})
export class MyApp {

  public rootPage: any;
  public user: any;
  public pageCounts: any;
  public menuButtonsVisibility: any;

  public userName: string;

  public nav: any;

  public pages = [
    {
      title: 'Menu',
      icon: 'ios-pizza-outline',
      count: 'home_count',
      component: HomePage
    },

    // {
    //   title: 'Categories',
    //   icon: 'apps',
    //   count: 0,
    //   component: CategoriesPage
    // },

    // {
    //   title: 'Favorite',
    //   icon: 'star-outline',
    //   count: 'favorite_count',
    //   component: FavoritePage
    // },

    {
      title: 'My Orders',
      forAdmin: false,
      icon: 'ios-list-outline',
      count: 'orders_count',
      component: OrdersPage
    },

    {
      title: 'Orders',
      orAdmin: true,
      icon: 'ios-list-outline',
      count: 'orders_count',
      component: OrdersAdminPage
    },

    {
      title: 'My Cart',
      icon: 'ios-cart-outline',
      count: 'cart_count',
      component: CartPage
    },

    // {
    //   title: 'Offer',
    //   icon: 'ios-pricetag-outline',
    //   count: 2,
    //   component: OfferPage
    // },

    {
      title: 'Profile',
      icon: 'ios-person-outline',
      count: 'setting_count',
      component: SettingPage
    },

    {
      title: 'Employees',
      icon: 'ios-contacts-outline',
      count: 'employee_count',
      component: EmployeePage
    },

    // {
    //   title: 'News',
    //   icon: 'ios-paper-outline',
    //   count: 0,
    //   component: NewsPage
    // },

    {
      title: 'About us',
      icon: 'ios-information-circle-outline',
      count: 'aboutus_count',
      component: AboutPage
    },

    // {
    //   title: 'Supports',
    //   icon: 'ios-help-circle-outline',
    //   count: 0,
    //   component: ChatsPage
    // },

    {
      title: 'Logout',
      icon: 'ios-exit-outline',
      count: 'logout_count',
      component: LogoutPage
    },
    // import menu

  ];

  constructor(
    public platform: Platform,
    public configService : ConfigService,
    public cartService: CartService,
    public events: Events,
    public alertCtrl: AlertController
  ) {

    this.menuButtonsVisibility = {};

    for(var i=0; i< this.pages.length; i++){
      console.log("title of the page : " + this.pages[i].title);

      this.menuButtonsVisibility[this.pages[i].title] = false;
    }

    this.user = null;
    this.pageCounts = {};
    this.pageCounts['cart_count'] = this.cartService.getCount();

    // Initialize Parse with your app's Application ID and JavaScript Key
    Parse.initialize('restaurant_app_id');
    Parse.serverURL = 'http://162.243.118.87:1339/parse';

    this.rootPage = LoginPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });

    events.subscribe('userFetch:complete', user => {
      console.log("event : userFetch:complete");
      this.user = user[0];
      if(user[0].name == "Guest User"){
        this.menuButtonsVisibility['Profile'] = true;
        this.menuButtonsVisibility['Employees'] = true;
        this.menuButtonsVisibility['Orders'] = true;
      }else{
        this.menuButtonsVisibility['Profile'] = false;

        if(this.user.parseUserObject.get("type") == "admin"){
          this.menuButtonsVisibility['Employees'] = false;
          this.menuButtonsVisibility['Orders'] = false;
          this.menuButtonsVisibility['My Orders'] = true;
        }else{
          this.menuButtonsVisibility['Employees'] = true;
          this.menuButtonsVisibility['Orders'] = true;
          this.menuButtonsVisibility['My Orders'] = false;
        }
      }
    })

    events.subscribe('cart:changed', cart => {
      if(cart !== undefined && cart !== ""){
        console.log("cart size changed to: " + cart[0].items.length);
        this.pageCounts['cart_count'] = cart[0].items.length;
      }
    })

    events.subscribe('username:changed', username => {
      if(username !== undefined && username !== ""){
        console.log("username befor : "+this.userName);
        this.userName = username;
        console.log("username after : "+this.userName);
      }
    })

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  // view my profile
  viewMyProfile() {
    var me = this;
    if(this.user){
      console.log("user not null");
      if(this.user.name == "Guest User"){
        //guest user ask them to signup
        me.presentAlert("Guest User","SignUp to save profile data. Register?",[],function(data){
          me.nav.setRoot(RegisterPage);
        });
      }else{
        me.nav.setRoot(SettingPage);
      }
    }else{
      console.log("null user");
    }
  }

  presentAlert(title,message,inputs,call) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      inputs: inputs,
      buttons: [
        {
          text: 'YES',
          handler: data => {
            if(call){
              call(data);
            }
          }
        },
        {
          text: 'NO',
          handler: data => {

          }
        }
      ]
    });
    alert.present();
  }

  // hideMenuButton(pageTitle){
  //   if(this.user){
  //     if(pageTitle == 'Profile' && this.user.name == "Guest User"){
  //       return true;
  //     }else if(pageTitle == 'Employees' && (this.user.name == "Guest User" || this.user.isAdmin == false)){
  //       return true;
  //     }else{
  //       return false;
  //     }
  //   }
  // }
}


