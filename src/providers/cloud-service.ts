import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {Events} from 'ionic-angular';
import Parse from 'parse';

import { HomePage } from '../pages/home/home';
import { OrdersAdminPage } from '../pages/orders-admin/orders-admin';
import { ConfigService } from './config-service';

/*
  Generated class for the CloudService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CloudService {

	public user: any = null;
  public menu: any;

  constructor(
  	public http: Http,
  	public configService: ConfigService,
    public events: Events,
  ) {

    Parse.initialize('restaurant_app_id');
    Parse.serverURL = 'http://162.243.118.87:1339/parse';
    this.user = Parse.User.current();
	  configService.init();
    this.fetchMenu();
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

  saveFiles(files){
    let me = this;
    let filesCount = files.length;
    let savedFiles = [];
    return new Promise((resolve, reject) => {
      for(let i=0;i<filesCount;i++){
        me.saveFile(files[i]).then((file) => {
          savedFiles.push(file);
          if(savedFiles.length == filesCount){
            resolve(savedFiles);
          }
        });
      }
    });
  }

  saveFile(parseFile){
    return new Promise((resolve, reject) => {
      var File = Parse.Object.extend("File");
      var file = new File();
      file.set("file", parseFile);
      file.set("isDeleted", false);
      file.save(null, {
        success: function(savedFile) {
          resolve(savedFile);
        },
        error: function(gameScore, error) {
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

  getMenu(){
    return this.menu;
  }

  fetchMenu(){
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('getMenu').then(function(menu) {
        me.menu = menu;
        me.events.publish('fetchMenu:event', me.menu);
        resolve(me.menu);
      });
    });
  }

  addMenuCategory(name, images){
    var me = this;
    var Menu = Parse.Object.extend("Menu");
    var menu = new Menu();
    menu.set("name", name);

    return new Promise((resolve, reject) => {
      me.saveFiles(images).then((files)=>{
        var relation = menu.relation("images");
        for(let i=0;i<files["length"];i++){
          relation.add(files[i]);
        }
        menu.save(null, {
        success: function(saveMenuCategory) {
          me.fetchMenu().then((m) => {
            resolve(m);
          });
          
        },
        error: function(gameScore, error) {
          reject(error);
        }
      });
      });
    });
    
  }

  saveMenuCategory(menu){
    return new Promise((resolve, reject) => {
      menu.save(null, {
        success: function(menu) {
          resolve(menu);
        },
        error: function(menu, error) {
          reject(error);
        }
      });
    });
  }

  getAllMenuItems(user){
    let me = this;
    return new Promise((resolve, reject) => {
      var menuItemsReturnObject = {};
      var MenuItem = Parse.Object.extend("MenuItem");
      var menuItemQuery = new Parse.Query(MenuItem);
      if(user.get("type")!="admin"){menuItemQuery.equalTo("isDeleted", false)}  
      menuItemQuery.find({
        success: function(results) {
          menuItemsReturnObject["array"] = results;
          menuItemsReturnObject["map"] = me.arrayToMap(results);
          resolve(menuItemsReturnObject);
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  }

  arrayToMap(array){
    var map = {};
    for (var i = 0; i < array.length; i++) {
      map[array[i].id] = array[i];
    }
    return map;
  }

}


// function getMenu(){
//   return new Promise((resolve, reject) => {
//     var menuReturnObject = {};
//     var Menu = Parse.Object.extend("Menu");
//     var menuQuery = new Parse.Query(Menu);
//     menuQuery.include("images");
//     menuQuery.include("items");
//     menuQuery.find({
//       success: function(menu) {
//         menuReturnObject["array"] = menu;
//         menuArrayToMap(menu).then((map) => {
//           menuReturnObject["map"] = map;
//           resolve(menuReturnObject);
//         });
//       },
//       error: function(error) {
//         reject(error);
//       }
//     });
//   });
// }

// function getAllMenuItems(user){
//   return new Promise((resolve, reject) => {
//     var menuItemsReturnObject = {};
//     var MenuItem = Parse.Object.extend("MenuItem");
//     var menuItemQuery = new Parse.Query(MenuItem);
//     if(user.get("type")!="admin"){menuItemQuery.equalTo("isDeleted", false)}  
//     menuItemQuery.find({
//       success: function(results) {
//         menuItemsReturnObject["array"] = results;
//         menuItemsReturnObject["map"] = arrayToMap(results);
//         resolve(menuItemsReturnObject);
//       },
//       error: function(error) {
//         reject(error);
//       }
//     });
//   });
// }

// function menuArrayToMap(array){
//   var menuMap = {};
//   var ajaxCallsRemaining = array.length;
//   return new Promise((resolve, reject) => {
//     for (var i = 0; i < array.length; i++) {
//       menuMap[array[i].id] = {
//         object:array[i],
//         items:null,
//         images:null
//       };
//       getRelationObjects(array[i], "items").then((items) => {
//         menuMap[items["obj"].id].items = items["returnObject"];

//         getRelationObjects(items["obj"], "images").then((images) => {
//           menuMap[images["obj"].id].images = images["returnObject"];
//           --ajaxCallsRemaining;
//           if (ajaxCallsRemaining <= 0) {
//             resolve(menuMap);
//           }
//         });
//       });
//     }
//   });
    
// }


// function getRelationObjects(obj,relationName){
//   return new Promise((resolve, reject) => {
//     var returnObject = {
//       array: null,
//       map: null
//     }; 
//     var relation = obj.relation(relationName);
//     var query = relation.query();
//     query.find({
//       success: function(results){
//         returnObject.array = results;
//         returnObject.map = arrayToMap(results);
//         resolve({returnObject:returnObject, obj:obj});
//       }
//     });
//   });
// }

function arrayToMap(array){
  var map = {};
  for (var i = 0; i < array.length; i++) {
    map[array[i].id] = array[i];
  }
  return map;
}