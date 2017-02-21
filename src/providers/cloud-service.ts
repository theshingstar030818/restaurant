import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {Events} from 'ionic-angular';
import Parse from 'parse';

import { HomePage } from '../pages/home/home';
import { OrdersAdminPage } from '../pages/orders-admin/orders-admin';

import { ConfigService } from './config-service'

/*
  Generated class for the CloudService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CloudService {

	public user: any = null;

  constructor(
  	public http: Http,
  	public configService: ConfigService,
    public events: Events,
  ) {

    Parse.initialize('restaurant_app_id');
    Parse.serverURL = 'http://162.243.118.87:1339/parse';
    this.user = Parse.User.current();
	  configService.init();
  }

  getUser(){
    this.events.publish("getUser:event", this.user);
  	return this.user;
  }

  getEditAbleUser(){
    return JSON.parse(JSON.stringify(this.user));
  }

  // updateUserPicture(parseFile){
  //   let me = this;
  //   return new Promise((resolve, reject) => {
  //     me.user.set("profileImg",parseFile);
  //     me.user.save(null,{
  //       success: function(user){
  //         me.user = user;
  //         resolve(me.getEditAbleUser());
  //       },
  //       error: function(user,error){
  //         reject(error);
  //       }
  //     });
  //   });
  // }

  updateUserProfile(data,image){
    let me = this;
    return new Promise((resolve, reject) => {
      me.user.set("name", data.name);
      me.user.set("email", data.email);
      if(image){ me.user.set("profileImg",image);}
      me.user.save(null, {
        success: function(user){
          me.user = user;
          resolve(me.getEditAbleUser());
        },
        error: function(user,error){
          reject(error);
        }
      });
    });
  }

  getRootPage(): any{
  	if(Parse.User.current().get("type") == "admin"){
    	return OrdersAdminPage;
    }else{
        return HomePage;
    }
  }

  login(username,password){
    var me = this;
    return new Promise((resolve, reject) => {
      Parse.User.logIn(username, password, {
        success: function(user) {
          me.user = user;
          me.events.publish("getUser:event", user);
          resolve(me.getRootPage());
        },
        error: function(user, error) {
          reject(error);
        }
      });
    });
  }

  register(username,pass){
      let me = this;
    return new Promise((resolve, reject) => {
      var user = new Parse.User();
      user.set("username", username);
      user.set("password", pass);

      // other fields can be set just like with Parse.Object
      user.set("type", "client");

      user.signUp(null, {
        success: function(user) {
          resolve(me.getRootPage());
        },
        error: function(user,error) {
          reject(error);
        }
      });
    });
  }

  logout(){
  	let me = this;
	  me.user = null;
    Parse.User.logOut().then(
      function(user){

      },function(error){
      	console.error(error);
      });
  }

}
