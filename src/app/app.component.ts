import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, ToastController, LoadingController } from 'ionic-angular';
import { StatusBar, Splashscreen} from 'ionic-native';
import Parse from 'parse';

import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {UserPage} from '../pages/user/user';

import { CloudService } from '../providers/cloud-service';
import { ConfigService } from '../providers/config-service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  user: any;
  loader: any;
  pageConfigs: any = {};
  rootPage: any = LoginPage;
  pages: Array<{title: string, icon: string, count: any, component: any}>;

  //page event handlers
  private getUserEvent: (user) => void;
  private toastEvent: (data) => void;

  constructor(
    public platform: Platform,
    public events: Events,
    public configService : ConfigService,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public cloudService: CloudService,
  ) {
    
    this.initializeApp();
    this.initializeEventHandlers();
    this.subscribeEvents();
    // used for an example of ngFor and navigation
    this.pages = [
      {title: 'Menu',icon: 'ios-pizza-outline',count: "home_count",component: HomePage}
    ];

  }

  logout(){
    let me = this;
    me.presentLoading();
    me.cloudService.logout();
    me.nav.setRoot(LoginPage);
    me.dismissLoading();
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

  presentToast(message, position,duration) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration,
      showCloseButton: true,
      position: position,
      dismissOnPageChange: false
    });

    toast.onDidDismiss(() => {
      // console.log('Dismissed toast');
    });

    toast.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  viewMyProfile() {
    this.presentLoading();
    this.nav.push(UserPage, { param1: null });
    this.dismissLoading();
  }

  initializeEventHandlers(){
    this.initializeGetUserEvent();
    this.initializeToastEvent();
  }

  initializeGetUserEvent(){
    let me = this;
    this.getUserEvent = (user) => {
      me.user = user;
    };
  }

  initializeToastEvent(){
    let me = this;
    this.toastEvent = (data) => {
      me.presentToast(data.message,data.position, data.time);
    };
  }

  subscribeEvents(){    
    this.events.subscribe('getUser:event', this.getUserEvent);
    this.events.subscribe('event:toast', this.toastEvent);
  }

  unsubscribeEventHandlers(){
    this.unsubscribeGetUserEvent();
    this.unsubscribeToastEvent();
  }

  unsubscribeGetUserEvent(){
    if(this.getUserEvent){
      this.events.unsubscribe('getPostCommentsEvent', this.getUserEvent);
      this.getUserEvent = undefined;
    }
  }

  unsubscribeToastEvent(){
    if(this.toastEvent){
      this.events.unsubscribe('event:toast', this.toastEvent);
      this.toastEvent = undefined;
    }
  }
}
