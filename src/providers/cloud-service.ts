import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {Events} from 'ionic-angular';
import Parse from 'parse';

import { HomePage } from '../pages/home/home';
import { OrdersAdminPage } from '../pages/orders-admin/orders-admin';
import { ConfigService } from './config-service';
import { CartService } from './cart-service';

/*
  Generated class for the CloudService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class CloudService {

	public user: any = null;
  public menu: any;
  public options: any = [];
  public extras: any = [];
  public sizes: any = [];
  public find: any;

  private currentContactIndex: any;
  private currentAddressIndex: any;

  private orders: any;
  private ordersMap: any;
  private ordersDate: any;
  private ordersDetails: any;
  private employees: any;  
  public contacts: any;
  public contactsMap: any;
  public addresses: any;
  public addressesMap: any;

  constructor(
  	public http: Http,
  	public configService: ConfigService,
    public events: Events,
    public cartService: CartService,
  ) {

    var now = new Date();

    this.ordersDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toJSON();
    this.ordersDetails = {};

    this.employees = [];

    this.contacts = [];
    this.contactsMap = {};

    this.addresses = [];
    this.addressesMap = {};

    this.orders = [];
    this.ordersMap = {};

    Parse.initialize('restaurant_app_id');
    Parse.serverURL = 'http://162.243.118.87:1339/parse';
    this.user = Parse.User.current();
	  configService.init();
    this.cartService.getCart();
    this.getOptions();
    this.getExtras();
    this.getSizes();
    this.fetchMenu();
    if(this.isAdmin()){
      this.fetchAllAddresses();
      this.fetchAllContacts();
      this.fetchAllOrders(this.ordersDate);
      this.fetchAllEmployees();
    }else{
      this.fetchAddresses(this.user);
      this.fetchContacts(this.user);
      this.fetchOrders(this.user);
    }
  }

  getEmployees(){
    return this.employees;
  }

  addEmpoyee(employee){
    this.employees.push(employee);
  }

  getUser(){
    this.events.publish("getUser:event", this.user);
  	return this.user;
  }

  getEditAbleUser(){
    return JSON.parse(JSON.stringify(this.user));
  }

  getEditAbleObject(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  isAdmin(){
    return (Parse.User.current() && Parse.User.current().get("type")=="admin");
  }



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

  getOptions(){
    var me = this;
    var option = new Parse.Query("Option");
    option.find({
      success: function(results) {
        me["options"] = results;
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  saveFiles(files){
    let me = this;
    let filesCount = files.length;
    let savedFiles = [];
    return new Promise((resolve, reject) => {
      for(let i=0;i<filesCount;i++){
        if(!files[i].id){
          me.saveFile(files[i]).then((file) => {
            savedFiles.push(file);
            if(savedFiles.length == filesCount){
              resolve(savedFiles);
            }
          });
        }else{
          savedFiles.push(files[i]);
          if(savedFiles.length == filesCount){
              resolve(savedFiles);
          }
        }
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
          me.cartService.getCart().then((cart)=>{
            if(!cart || cart["length"]==0){me.cartService.getNewCartCart()}
              me.user = user;
              me.events.publish("getUser:event", user);
              resolve(me.getRootPage());
          }).catch((error)=>{
            reject(error);
          })
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
      user.set("cart",me.cartService.getNewCartCart());
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
    console.log("fetchMenu");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('getMenu').then(function(menu) {
        me.menu = menu;
        me.events.publish('fetchMenu:event', me.menu);
        resolve(me.menu);
      });
    });
  }

  // getMenuCategory(category){
  //    var me = this;
  //   return new Promise((resolve, reject) => {

  //   });  
  // }

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

  getExtras(){
    var me = this;
    var extra = new Parse.Query("Extra");
    extra.find({
      success: function(results) {
        me["extras"] = results;
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  addNewExtra(extra_name){
    var me = this;
    return new Promise((resolve, reject) => {
      var Extra = Parse.Object.extend("Extra");
      var extra = new Extra();

      extra.set("name", extra_name);

      extra.save(null, {
        success: function(extra) {
          me.extras.push(extra);
          resolve(extra);
        },
        error: function(extra, error) {
          reject(error);
        }
      });

    });
  }

  addNewOption(option_name){
    var me = this;
    return new Promise((resolve, reject) => {
      var Option = Parse.Object.extend("Option");
      var option = new Option();
      option.set("name", option_name);
      option.save(null, {
        success: function(option) {
          me.options.push(option);
          resolve(option);
        },
        error: function(option, error) {
          reject(error);
        }
      });

    });
  }

  getSizes(){
    var me = this;
    var size = new Parse.Query("Size");
    size.find({
      success: function(results) {
        me["sizes"] = results;
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  addNewSize(size_name){
    var me = this;
    return new Promise((resolve, reject) => {
      var Size = Parse.Object.extend("Size");
      var size = new Size();

      size.set("name", size_name);

      size.save(null, {
        success: function(size) {
          me.sizes.push(size);
          resolve(size);
        },
        error: function(size, error) {
          reject(error);
        }
      });

    });
  };

  removeRelations(obj,relationName){
    return new Promise((resolve, reject) => {
      var relation = obj.relation(relationName);
      var query = relation.query();
      query.find({
        success: function(list) {
          console.log(list)
          for(let i=0;i<list.length;i++){
            relation.remove(list[i]);
          }
          obj.save(null, {
            success:function(){
              resolve();
            },
            error:function(error){
              reject(error);
            }
          });
        },
        error:function(list,error){
          reject(error)
        }
      });
    });
  };

  addItem(addItemModal){
    let me = this;
    return new Promise((resolve, reject) => {
      let item;
      
      if(addItemModal.data.edit){
        console.log("edit");
        item = addItemModal.data.item;
      }else{
        console.log("new");
        let MenuItem = Parse.Object.extend("MenuItem");
        item = new MenuItem();
      }
      
      me.removeRelations(item,"images").then(()=>{
        var relation = item.relation("images");
        item.set("name", addItemModal.data.editItem.name);
        item.set("price", addItemModal.data.editItem.price);
        item.set("outOfStock", addItemModal.data.editItem.outOfStock);
        item.set("isDeleted", addItemModal.data.editItem.isDeleted);
        item.set("description", addItemModal.data.editItem.description);
        var options = this.getOptionsArray(addItemModal.optionsModels);
        var extras = this.getArray(addItemModal.extrasModels);
        var sizes = this.getArray(addItemModal.sizesModels);
        item.set("options", options);
        item.set("extras", extras);
        item.set("sizes", sizes);
        item.set("category", addItemModal.data.category.object);
        me.saveFiles(addItemModal.files).then((savedFiles)=>{
          
          item.set("mainImage", savedFiles[0]);
          
          for(let i=0;i<savedFiles["length"];i++){
            relation.add(savedFiles[i]);
          }
          item.save(null, {
            success: function(item) {
              var category = item.get("category");
              me.find = item;
              var index = me.menu.map[item.get('category').id].items.array.findIndex(function(x) { return x.id == me.find.id; });
              if(index != -1){
                me.menu.map[item.get('category').id].items.array[index] = item;
              }else{
                me.menu.map[item.get('category').id].items.array.push(item);
              }
              me.menu.map[item.get('category').id].items.map[item.id] = item;
              var relation = category.relation("items");
              relation.add(item);
              category.save(null, {
                success: function(category){
                  me.menu.map[category.id].object = category;
                  resolve();
                },
                error: function(category,error){
                  reject(error);
                }
              });
            },
            error: function(item, error) {
              reject(error);
            }
          });
        });
      });
    });
  }

  getOptionsArray(obj){
    var array = [], key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)){
          if(obj[key]){
            array.push({name: key, value: obj[key]});
          }
        }
    }
    return array;
  }

  getArray(obj) {
      var array = [], key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)){
            if(obj[key].length>0){
              array.push({name: key, value: obj[key]});
            }
          }
      }
      return array;
  };

  getCategoryImages(category){
    return new Promise((resolve, reject) => {
      var relation = category.relation("images");
      var query = relation.query();
      query.find({
        success: function(results){
           resolve(results)
        },
        error: function(Images,error){
          reject(error);
        }
      });
    });
  }

  getCategoryReviews(category){
    return new Promise((resolve, reject) => {
      var MenuItem = new Parse.Object("MenuItem");
      var relation = MenuItem.relation("reviews");
      var query = relation.query();
      query.find({
        success: function(results){
          resolve(results)
        },
        error: function(reviews,error){
          reject(error);
        }
      });
    });
  }

  fetchAllAddresses(){
    console.log("fetchAllAddresses");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchAllAddresses').then(function(address) {
        me.addresses = address.array;
        me.addressesMap = address.map;
        me.events.publish('fetchAllAddresses:event', address);
        resolve(address);
      });
    });
  } 

  fetchAllContacts(){
    console.log("fetchAllContacts");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchAllContacts').then(function(contacts) {
        me.contacts = contacts.array;
        me.contactsMap = contacts.map;
        me.events.publish('fetchAllContacts:event', contacts);
        resolve(contacts);
      });
    });
  } 

  fetchAllOrders(date){

    console.log("fetchAllOrders");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchAllOrders', { date:date } ).then(function(orders) {
        
        me.ordersDetails.declinedOrders = orders.ordersDetails.declinedOrders;
        me.ordersDetails.cancelledByClientOrders = orders.ordersDetails.cancelledByClientOrders;
        me.ordersDetails.pendingApprovalOrders = orders.ordersDetails.pendingApprovalOrders;
        me.ordersDetails.inKitchenOrders = orders.ordersDetails.inKitchenOrders;
        me.ordersDetails.outForDeliveryOrders = orders.ordersDetails.outForDeliveryOrders;
        me.ordersDetails.completedOrders = orders.ordersDetails.completedOrders;
        me.user.orders = orders.user.orders;
        me.user.ordersMap = orders.user.ordersMap;

        me.events.publish('fetchAllOrders:event', orders);
        resolve(orders);
      });
    });
  } 

  fetchAllEmployees(){
    console.log("fetchAllEmployees");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchAllEmployees').then(function(employees) {
        me.employees = employees;
        me.events.publish('fetchAllEmployees:event', employees);
        resolve(employees);
      });
    });
  } 

  fetchAddresses(user){
    console.log("fetchAddresses");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchAddresses').then(function(addresses) {
        me.addresses = addresses.array;
        me.addressesMap = addresses.map;
        me.events.publish('fetchAddresses:event', addresses);
        resolve(addresses);
      });
    });
  } 

  fetchContacts(user){
    console.log("fetchContacts");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchContacts').then(function(contacts) {
        me.contacts = contacts.array;
        me.contactsMap = contacts.map;
        me.events.publish('fetchContacts:event', contacts);
        resolve(contacts);
      });
    });
  } 
  
  fetchOrders(user){
    console.log("fetchOrders");
    let me = this;
    return new Promise((resolve, reject) => {
      Parse.Cloud.run('fetchOrders').then(function(orders) {
        me.user.orders = orders.array;
        me.user.ordersMap = orders.map;
        me.events.publish('fetchOrders:event', orders);
        resolve(orders);
      });
    });
  } 

  addContact(cont){
    var me =this;
    var Contact = Parse.Object.extend("Contact");
    var contact = new Contact();
    contact.set("email", cont.email);
    contact.set("phone", cont.phone);
    contact.set("isDeleted", false);
    contact.set("user",Parse.User.current());
    return new Promise((resolve, reject) => {
      contact.save(null, {
        success: function(item) {
           if(!me.isAdmin()){
             me.user.contacts.push(JSON.parse(JSON.stringify(item)));
             var User_Contact = Parse.Object.extend("User_Contact_");
              var user_contact = new User_Contact();
              user_contact.set("user",me.user.parseUserObject);
              user_contact.set("contact", item);
              user_contact.save(null, {
                success: function(j_obj){
                  console.log("junction object stored : " + j_obj);
                  resolve();
                },
                error: function(j_obj, error) {
                  console.log(error.message);
                  reject(error);
                }
              });
           }else{
             me.contacts.push(item);
             me.contactsMap[item.id] = item;
             me.user.contacts = [JSON.parse(JSON.stringify(item))];
             resolve();
           }
        },
        error: function(item, error) {
          console.log(error.message);
          reject(error);
        }
      });
    });
  }

  addAddress(add){

    var me =this;
    var Address = Parse.Object.extend("Address");
    var address = new Address();
    address.set("unitNumber", add.unitNumber);
    address.set("buildingNumber", add.buildingNumber);
    address.set("streetName", add.streetName);
    address.set("city", add.city);
    address.set("state", add.state);
    address.set("country", add.country);
    address.set("isDeleted", false);
    address.set("postalCode", add.postalCode);
    address.set("user",Parse.User.current());
    return new Promise((resolve, reject) => {
      address.save(null, {
        success: function(item) {
         
         console.log("address created now need to save it intojunction table");
           if(!me.isAdmin()){
              me.user.addresses.push(JSON.parse(JSON.stringify(item)));
              var User_Address = Parse.Object.extend("User_Address_");
              var user_address = new User_Address();
              user_address.set("user",me.user.parseUserObject);
              user_address.set("address", item);
              user_address.save(null, {
                success: function(j_obj){
                  console.log("junction object stored : " + j_obj);
                  resolve();
                },
                error: function(j_obj, error) {
                  console.log(error.message);
                  reject(error);
                }
              });
           }else{
             //for admins adding the address do not link it to any user
             me.user.addresses = [];
             me.user.addresses.push(JSON.parse(JSON.stringify(item)));
             me.addressesMap[item.id]=item;
             me.addresses.push(item);
             resolve();
           }
        },
        error: function(item, error) {
          console.log(error.message);
          reject(error);
        }
      });
    });
  }

  addOrder(ord){
    var me =this;
    var Order = Parse.Object.extend("Orders");
    var order = new Order();

    if(ord.address == "TAKEOUT"){
      order.set("type","takeout");
    }else{
      order.set("type","delivery");
      me.currentAddressIndex = ord.address;
      var Address = Parse.Object.extend("Address");
      var address = new Address();
      address.id = me.user.addresses[ord.address].objectId;
      order.set("address", address);
    }
    
    me.currentContactIndex = ord.contact;
    var Contact = Parse.Object.extend("Contact");
    var contact = new Contact();
    contact.id = me.user.contacts[ord.contact].objectId;
    order.set("contact", contact);
    order.set("items",me.cartService.cart.get("items"));
    order.set("status","Pending Approval");

    var transaction = {
      paymentOption: ord.paymentOption,
      paymentType: ord.paymentType,
      total: me.cartService.cart.get("total")
    };

    order.set("specialInstructions",ord.specialOrderInstructions);
    order.set("transaction",transaction);

    var now = new Date();
    order.set("createdAtLocal",now);

    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(item) {
          
          var itemToStore = JSON.parse(JSON.stringify(item));
          me.orders.push(itemToStore);
          me.orders.sort(me.sortOrdersByTimeEarliestFirst);
          me.ordersMap[item.id] = itemToStore;

          if(!(item.get("type")=="takeout")){
            var addressOrderRelation = address.relation("orders");
            addressOrderRelation.add(item);
            address.save();
            
            var addressContactRelation = address.relation("contacts");
            addressContactRelation.add(contact);
            address.save();
          
            var contactAddressRelation = contact.relation("addresses");
            contactAddressRelation.add(address);
            contact.save();
          }

          var contactOrderRelation = contact.relation("orders");
          contactOrderRelation.add(item);
          contact.save();

          //clean cart 
          me.cartService.cleanCart();
          me.sendEmail();
          if(!me.isAdmin()){
            var User_Order_ = Parse.Object.extend("User_Order_");
            var user_order = new User_Order_();
            user_order.set("user",me.user.parseUserObject);
            user_order.set("order", item);
            user_order.save(null, {
              success: function(j_obj){
                console.log("junction object stored : " + j_obj);
                resolve();
              },
              error: function(j_obj, error) {
                console.log(error.message);
                reject(error);
              }
            });
          }else{
            var jsonObj = JSON.parse(JSON.stringify(item));
            jsonObj.address = me.user.addresses[0];
            jsonObj.contact = me.user.contacts[0];
            console.log("added order to pendingApprovalOrders array : " + jsonObj);
            me.ordersDetails.pendingApprovalOrders.array.push(jsonObj);
            me.ordersDetails.pendingApprovalOrders.total += item.get("transaction").total;
            resolve();
          }
        },
        error: function(item, error) {
          console.log(error.message);
          reject(error);
        }
      });
    });
  }

  sortOrdersByTimeOldestFirst(a, b) {
    var aTime = new Date(a.createdAt).getTime();
    var bTime = new Date(b.createdAt).getTime();
    return aTime - bTime;
  }

  sortOrdersByTimeEarliestFirst(a, b) {
    var aTime = new Date(a.createdAt).getTime();
    var bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  }

  sendEmail(){
    var requestObj = {};
    Parse.Cloud.run('sendEmail', requestObj, {
      success: function(result) {
        console.log(JSON.stringify(result));
      },
      error: function(error) {
        console.log(JSON.stringify(error));
      }
    });
  }

  setUserAddresses(address){
    this.user.addresses = JSON.parse(JSON.stringify(address));
    return this.user;
  }

  setUserAddress(address){
    this.user.addresses = JSON.parse(JSON.stringify([address]));
    return this.user;
  }

  setUserContact(contact){
    this.user.contacts = JSON.parse(JSON.stringify([contact]));
    return this.user;
  }

  setUserContacts(contacts){
    this.user.contacts = JSON.parse(JSON.stringify(contacts));
    return this.user;
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

// function arrayToMap(array){
//   var map = {};
//   for (var i = 0; i < array.length; i++) {
//     map[array[i].id] = array[i];
//   }
//   return map;
// }