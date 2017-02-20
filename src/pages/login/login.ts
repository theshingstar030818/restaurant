import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AlertController} from 'ionic-angular';
import {LoadingController} from 'ionic-angular';
import {ViewController} from 'ionic-angular';
import {RegisterPage} from "../register/register";
import {HomePage} from "../home/home";
import {OrdersPage} from '../orders/orders';
import {OrdersAdminPage} from '../orders-admin/orders-admin';

import {ConfigService} from '../../services/config-service';
import {UserService} from "../../services/user-service"

import Parse from 'parse';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public config: any;
  public user: any;

  constructor(
    public nav: NavController, 
    public configService: ConfigService,
    public userService: UserService,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {
    
    //var me = this;
    this.user = {};

    Parse.Config.get().then(function(config) {
      console.log("Config was fetched from the server.");
      configService.setConfig(config);
    }, function(error) {
      console.log("Failed to fetch. Using Cached Config.");
      configService.setConfig(Parse.Config.current());      
    });
    if(Parse.User.current()){
      this.userService.setUser(Parse.User.current());
      if(Parse.User.current().get("type") == "admin"){
        //naviggate to orders page
        this.nav.setRoot(OrdersAdminPage);
      }else{
        //navigate to home page 
        this.nav.setRoot(HomePage);
      }
    }
  }

  // go to register page
  register() {
    this.nav.setRoot(RegisterPage);
  }

  // login and go to home page
  login() {
    //this.presentLoading(); // dismiss not working for some reason ! :@
    if(this.user.username && this.user.password){
      this.userService.login(this.user.username,this.user.password).then((response) => {
        return response;
      }).then((user) => {
        if(Parse.User.current().get("type") == "admin"){
          //naviggate to orders page
          this.nav.setRoot(OrdersAdminPage);
        }else{
          //navigate to home page 
          this.nav.setRoot(HomePage);
        }
      }).catch((ex) => {
        console.error('Error : ', ex);
        this.invalidCredentialsAlert();
        //me.dismiss();
      });
    }else{
      this.invalidCredentialsAlert();
      //me.dismiss();
    }
    
  }

  guestLogin(){
    //go to home page the user in user service is already set to guest
    this.userService.setUser(this.userService.getGuestUser());
    this.nav.setRoot(HomePage);
  }

  invalidCredentialsAlert() {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Invalid credentials',
      buttons: ['OK']
    });
    alert.present();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: false
    });
    loader.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }


}
