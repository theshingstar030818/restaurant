import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ViewController } from 'ionic-angular';

import {HomePage} from "../home/home";
import {LoginPage} from "../login/login";

import {ConfigService} from '../../services/config-service';
import {UserService} from "../../services/user-service"

import Parse from 'parse';


/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

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
    this.user = {};
  }

  // register and go to home page
  register() {
    this.userService.logout();
    var me = this;
    console.log("register new user");
    if(this.user.username && this.user.password && this.user.repassword){
      if(this.user.password == this.user.repassword){
        //signup user
        var user = new Parse.User();
        user.set("username", this.user.username);
        user.set("password", this.user.repassword);

        // other fields can be set just like with Parse.Object
        user.set("type", "client");

        user.signUp(null, {
          success: function(user) {
            // Hooray! Let them use the app now.
            me.userService.login(me.user.username,me.user.password).then((response) => {
              return response;
            }).then((user) => {
              me.nav.setRoot(HomePage);
            }).catch((ex) => {
              console.error('Error : ', ex);
            });            
          },
          error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            me.presentAlert("Error",error.code + " " + error.message,null);
          }
        });
      }else{
        //Passwords dont match alert message
        me.presentAlert("Error","Passwords you enter do not match",null);
      }
    }else{
      //please enter all the fields message
      me.presentAlert("Error","Please enter all fields",null);
    }
  }

  presentAlert(title,message,call) {
    let alert = this.alertCtrl.create({
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

  // go to login page
  login() {
    this.nav.setRoot(LoginPage);
  }
}
