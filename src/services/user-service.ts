import {Injectable} from "@angular/core";
import { Events } from 'ionic-angular';
import {CartService} from "./cart-service";

import Parse from 'parse';

@Injectable()
export class UserService {
  private user: any;
  private type: string;

  private currentContactIndex: any;
  private currentAddressIndex: any;

  private ordersDate: any;
  private ordersDetails: any;

  private employees: any;
  
  public contacts: any;
  public contactsMap: any;
  public addresses: any;
  public addressesMap: any;

  constructor(
    public cartService: CartService,
    public events: Events
  ) {

    var now = new Date();
    this.ordersDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toJSON();
    this.ordersDetails = {};
    this.employees = [];
    this.contactsMap = {};
    this.addressesMap = {};

    if(window['Parse'] != undefined){
      if(Parse.User.current()){
        this.setUser(Parse.User.current());
      }else{
        //create guest user and store that into user
        console.log("create guest user and store that into user");
        this.setUser(this.getGuestUser());
      }
    }else{
      //create guest user and store that into user
      console.log("create guest user and store that into user");
      this.setUser(this.getGuestUser());
    }
  }

  getEmployees(){
    return this.employees;
  }

  addEmpoyee(employee){
    this.employees.push(employee);
  }

  isAdmin(){
    if(this.user){
      return (this.user.isAdmin);
    }else{
      return false;
    }
  }

  setUser(user){
    this.user = {};
    if(user.name){
      //guest user
      this.type = "guest";
      this.user = user;
      this.user.isAdmin = false;
    }else{
      //parse User
      this.type = "parse";
      this.user.parseUserObject = user;
      this.user.name = user.get("username");
      this.user.fullName = user.get("name");
      this.user.email = user.get("email");
      if(user.get("profileImg")){
        this.user.profileImg = user.get("profileImg").url();
      }
      this.user.isAdmin = (user.get("type") == "admin");
      
      if(this.isAdmin()){
        console.log("isAdmin");
        this.fetchAllAddresses();
        this.fetchAllContacts();
        this.fetchAllOrders();
        this.fetchAllEmployees();
      }else{
        console.log("not Admin");
        this.fetchAddresses(user);
        this.fetchContacts(user);
        this.fetchOrders(user);
      }
    }
    this.events.publish('userFetch:complete', this.user);
  }

  getGuestUser(){
    var guestUser = JSON.parse(localStorage.getItem("guestUser"));
    if(!guestUser){
      console.log("did not find a guest user in localstorage creating a new one");
      guestUser = {
        name : "Guest User",
        number : null,
        profileImg : "assets/img/guestUserProfileImg.png",
        cart: this.cartService.getCart(),
        isAdmin: false,
        addresses: [],
        contacts: [],
        orders: [],
        ordersMap: {}
      };
      localStorage.setItem("guestUser", JSON.stringify(guestUser));
    }

    guestUser.orders = [];
    var key;
    for(key in guestUser.ordersMap){
      var order = new Parse.Query("Orders");
      
      order.include("address");
      order.include("contact");
      order.include("driver");
      order.get(key,{
        success: function(order) {
          guestUser.orders.push(JSON.parse(JSON.stringify(order)))
          guestUser.ordersMap[key] = JSON.parse(JSON.stringify(order));
        },
        error: function(order, error) {
          console.log(error.message);
        }
      })

    }

    console.log("need to convert ordersMap objects to parseObject");
    return guestUser;
  }

  fetchAllEmployees (){
    var me =this;
    var employee = new Parse.Query("Employee");
    employee.equalTo("isDeleted",false);
    var me= this;
    employee.find({
      success: function(employees) {
        me.employees = employees;
      },
      error: function(error){
        console.error(error);
      }
    })
  }

  fetchAllOrders (){
    var me =this;
    var order = new Parse.Query("Orders");
    order.include("address");
    order.include("contact");
    order.include("driver");

    order.greaterThanOrEqualTo("createdAt", me.getDayStartDateObj(new Date(me.ordersDate)));
    order.lessThan("createdAt", me.getDayEndDateObj(new Date(me.ordersDate)));

    order.find({
      success: function(results) {
        console.log("orders fetched : " + results);
        me.user.orders = [];
        me.user.ordersMap = {};

        me.ordersDetails.declinedOrders = {array:[],total:0};
        me.ordersDetails.cancelledByClientOrders = {array:[],total:0};
        me.ordersDetails.pendingApprovalOrders = {array:[],total:0};
        me.ordersDetails.inKitchenOrders = {array:[],total:0};
        me.ordersDetails.outForDeliveryOrders = {array:[],total:0};
        me.ordersDetails.completedOrders = {array:[],total:0};

        for(var i=0; i<results.length; i++){
          var jsonObj = JSON.parse(JSON.stringify(results[i]));
          var status = results[i].get("status");
          if(status == "Pending Approval"){
            me.ordersDetails.pendingApprovalOrders.array.push(jsonObj);
            me.ordersDetails.pendingApprovalOrders.total += results[i].get("transaction").total;
          }else if(status == "Declined"){
            me.ordersDetails.declinedOrders.array.push(jsonObj);
            me.ordersDetails.declinedOrders.total += results[i].get("transaction").total;
          }else if(status == "Cancelled"){
            me.ordersDetails.cancelledByClientOrders.array.push(jsonObj);
            me.ordersDetails.cancelledByClientOrders.total += results[i].get("transaction").total;
          }else if(status == "In Kitchen"){
            me.ordersDetails.inKitchenOrders.array.push(jsonObj);
            me.ordersDetails.inKitchenOrders.total += results[i].get("transaction").total;
          }else if(status == "Out for Delivery"){
            me.ordersDetails.outForDeliveryOrders.array.push(jsonObj);
            me.ordersDetails.outForDeliveryOrders.total += results[i].get("transaction").total;
          }else if(status == "Complete"){
            me.ordersDetails.completedOrders.array.push(jsonObj);
            me.ordersDetails.completedOrders.total += results[i].get("transaction").total;
          }

          
          me.user.orders.push(jsonObj)
          me.user.ordersMap[results[i].id] = jsonObj;
        }
        me.user.orders.sort(me.sortOrdersByTimeEarliestFirst);
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  fetchAllContacts (){
    var me =this;
    var contact = new Parse.Query("Contact");
    //ontact.equalTo("isDeleted",false);
    var me= this;
    contact.find({
      success: function(contacts) {
        me.contacts = contacts;
        me.contactsMap = {};
        for(var i=0; i<contacts.length; i++){
          me.contactsMap[contacts[i].id] = contacts[i];
        }
      },
      error: function(error){
        console.error(error);
      }
    })
  }

  fetchAllAddresses (){
    var me =this;
    var address = new Parse.Query("Address");
    //ontact.equalTo("isDeleted",false);
    var me= this;
    address.find({
      success: function(address) {
        me.addresses = address;
        me.addressesMap = {};
        for(var i=0; i<address.length; i++){
          me.addressesMap[address[i].id] = address[i];
        }
      },
      error: function(error){
        console.error(error);
      }
    })
  }

  fetchOrders(parseUser){
    var me =this;
    var order = new Parse.Query("User_Order_");
    order.equalTo("user",parseUser);
    order.include("order");
    order.find({
      success: function(results) {
        console.log("orders fetched : " + results);
        me.user.orders = [];
        me.user.ordersMap = {};
        for(var i=0; i<results.length; i++){
          me.user.orders.push(JSON.parse(JSON.stringify(results[i].get("order"))))
          me.user.ordersMap[results[i].get("order").id] = JSON.parse(JSON.stringify(results[i].get("order")));
        }
        me.user.orders.sort(me.sortOrdersByTimeEarliestFirst);
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  setUserContact(contact){
    this.user.contacts = JSON.parse(JSON.stringify([contact]));
    return this.user;
  }

  setUserContacts(contacts){
    this.user.contacts = JSON.parse(JSON.stringify(contacts));
    return this.user;
  }

  fetchContacts(parseUser){
    var me = this;
    var contact = new Parse.Query("User_Contact_");
    contact.equalTo("user",parseUser);
    contact.include("contact");
    contact.find({
      success: function(results) {
        console.log("contacts fetched : " + results);
        me.user.contacts = [];
        for(var i=0; i<results.length; i++){
          me.user.contacts.push(JSON.parse(JSON.stringify(results[i].get("contact")))) 
        }
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
    });
  }

  setUserAddress(address){
    this.user.addresses = JSON.parse(JSON.stringify([address]));
    return this.user;
  }

  setUserAddresses(address){
    this.user.addresses = JSON.parse(JSON.stringify(address));
    return this.user;
  }

  fetchAddresses(parseUser){
    var me = this;
    var address = new Parse.Query("User_Address_");
    address.equalTo("user",me.user.parseUserObject);
    address.include("address");
    address.find({
      success: function(results) {
        console.log("addresses fetched : " + results);
        me.user.addresses = [];
        for(var i=0; i<results.length; i++){
          me.user.addresses.push(JSON.parse(JSON.stringify(results[i].get("address")))) 
        }
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
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
    order.set("items",me.cartService.getCart().items);
    order.set("status","Pending Approval");

    var transaction = {
      paymentOption: ord.paymentOption,
      paymentType: ord.paymentType,
      total: me.cartService.getCart().total
    };

    order.set("specialInstructions",ord.specialOrderInstructions);
    order.set("transaction",transaction);

    var now = new Date();
    order.set("createdAtLocal",now);

    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(item) {
          
          var itemToStore = JSON.parse(JSON.stringify(item));

          if(me.type == "guest"){
            if(!(item.get("type")=="takeout")){
              itemToStore.address = me.user.addresses[me.currentAddressIndex];
            }
            itemToStore.contact = me.user.contacts[me.currentContactIndex];
          }
          me.user.orders.push(itemToStore);
          me.user.orders.sort(me.sortOrdersByTimeEarliestFirst);
          me.user.ordersMap[item.id] = itemToStore;

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
          if(me.type == "parse"){
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
          }else{
            localStorage.setItem("guestUser", JSON.stringify(me.user));
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

  addContact(cont){
    var me =this;
    var Contact = Parse.Object.extend("Contact");
    var contact = new Contact();
    contact.set("email", cont.email);
    contact.set("phone", cont.phone);
    contact.set("isDeleted", false);

    return new Promise((resolve, reject) => {
      contact.save(null, {
        success: function(item) {
         if(me.type == "parse"){
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
          }else{
            me.user.contacts.push(JSON.parse(JSON.stringify(item)));
            localStorage.setItem("guestUser", JSON.stringify(me.user));
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

    return new Promise((resolve, reject) => {
      address.save(null, {
        success: function(item) {
         
         console.log("address created now need to save it intojunction table");
         if(me.type == "parse"){
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
            
          }else{
            me.user.addresses.push(JSON.parse(JSON.stringify(item)));
            localStorage.setItem("guestUser", JSON.stringify(me.user));
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

  getUser() {
    return this.user;
  }

  login(username,password){
    console.log("UserService : login() => username : " + username );
    var me = this;
    return new Promise((resolve, reject) => {
      Parse.User.logIn(username, password, {
        success: function(user) {
          console.log("success");
          if(!me.user){
            me.user = {};
          }
          me.setUser(user);
          resolve(user);
        },
        error: function(user, error) {
          // The login failed. Check error to see why.
          reject(error);
        }
      });
    });
  }

  logout(){
    return new Promise((resolve, reject) => {
      this.user = null;
      Parse.User.logOut().then(() => {
        resolve(Parse.User.current());  // this will now be null
      });
    });
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  validatePhone(phone){
    var re = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
    return re.test(phone);
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

  getDayStartDateObj(date){
    
    // console.log(new Date ( date.getTime() + (date.getTimezoneOffset() * 60000)));
    var d = new Date ( date.getTime() + (date.getTimezoneOffset() * 60000));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getDayEndDateObj(date){
    // console.log(new Date ( date.getTime() + (date.getTimezoneOffset() * 60000)));
    var d = new Date ( date.getTime() + (date.getTimezoneOffset() * 60000));
    d.setHours(23, 59, 59, 999);
    return d;
  }

  approveOrder(orderId, index, which){
    console.log("approve order : " + orderId + "at index : " + index);
    
    if(which == "Pending Approval"){
      var orderToApprove = this.ordersDetails.pendingApprovalOrders.array[index];
      this.ordersDetails.pendingApprovalOrders.total -= orderToApprove.transaction.total;
      this.ordersDetails.pendingApprovalOrders.array.splice(index, 1);
    }else if(which == "Declined"){
      var orderToApprove = this.ordersDetails.declinedOrders.array[index];
      this.ordersDetails.declinedOrders.total -= orderToApprove.transaction.total;
      this.ordersDetails.declinedOrders.array.splice(index, 1);
    }else if(which == "Cancelled"){
      var orderToApprove = this.ordersDetails.cancelledByClientOrders.array[index];
      this.ordersDetails.cancelledByClientOrders.total -= orderToApprove.transaction.total;
      this.ordersDetails.cancelledByClientOrders.array.splice(index, 1);
    }
    
    orderToApprove.status = "In Kitchen";

    this.ordersDetails.inKitchenOrders.total += orderToApprove.transaction.total;
    this.ordersDetails.inKitchenOrders.array.splice(0, 0, orderToApprove);

    var Orders = Parse.Object.extend("Orders");
    var order = new Orders();
    order.id = orderToApprove.objectId;
    order.set("status","In Kitchen");
    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(order){
          console.log("order object updated successfully");
          resolve(order);
        },
        error: function(order,error){
          console.log("error " + error.message);
          reject(error);
        }
      });
    });
  }

  declineOrder(orderId, index, which){
    console.log("decline order : " + orderId + "at index : " + index);
    
    if(which == "Pending Approval"){
      var orderToDecline = this.ordersDetails.pendingApprovalOrders.array[index];
      this.ordersDetails.pendingApprovalOrders.total -= orderToDecline.transaction.total;
      this.ordersDetails.pendingApprovalOrders.array.splice(index, 1);
    }else if(which == "In Kitchen"){
      var orderToDecline = this.ordersDetails.inKitchenOrders.array[index];
      this.ordersDetails.inKitchenOrders.total -= orderToDecline.transaction.total;
      this.ordersDetails.inKitchenOrders.array.splice(index, 1);
    }else if(which == "Out for Delivery"){
      var orderToDecline = this.ordersDetails.outForDeliveryOrders.array[index];
      this.ordersDetails.outForDeliveryOrders.total -= orderToDecline.transaction.total;
      this.ordersDetails.outForDeliveryOrders.array.splice(index, 1);
    }
    
    orderToDecline.status = "Declined";

    this.ordersDetails.declinedOrders.total += orderToDecline.transaction.total;
    this.ordersDetails.declinedOrders.array.splice(0, 0, orderToDecline);

    var Orders = Parse.Object.extend("Orders");
    var order = new Orders();
    order.id = orderToDecline.objectId;
    order.set("status","Declined");
    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(order){
          console.log("order object updated successfully");
          resolve(order);
        },
        error: function(order,error){
          console.log("error " + error.message);
          reject(error);
        }
      });
    });
  }

  orderOutForDelivery(orderId,index,driver){
    console.log("order out for delivery : " + orderId + "at index : " + index);
    
    var orderToSendOnDelivery = this.ordersDetails.inKitchenOrders.array[index];
    orderToSendOnDelivery.status = "Out for Delivery";
    
    this.ordersDetails.inKitchenOrders.total -= orderToSendOnDelivery.transaction.total;
    this.ordersDetails.inKitchenOrders.array.splice(index, 1);

    this.ordersDetails.outForDeliveryOrders.total += orderToSendOnDelivery.transaction.total;
    this.ordersDetails.outForDeliveryOrders.array.splice(0, 0, orderToSendOnDelivery);

    var Orders = Parse.Object.extend("Orders");
    var order = new Orders();
    order.id = orderToSendOnDelivery.objectId;
    order.set("status","Out for Delivery");
    order.set("driver",driver);
    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(order){
          console.log("order object updated successfully");
          resolve(order);
        },
        error: function(order,error){
          console.log("error " + error.message);
          reject(error);
        }
      });
    });
  }

  completeOrder(orderId,index){
    console.log("complete order : " + orderId + "at index : " + index);
    
    var orderToComplete = this.ordersDetails.outForDeliveryOrders.array[index];
    orderToComplete.status = "Complete";
    
    this.ordersDetails.outForDeliveryOrders.total -= orderToComplete.transaction.total;
    this.ordersDetails.outForDeliveryOrders.array.splice(index, 1);

    this.ordersDetails.completedOrders.total += orderToComplete.transaction.total;
    this.ordersDetails.completedOrders.array.splice(0, 0, orderToComplete);

    var Orders = Parse.Object.extend("Orders");
    var order = new Orders();
    order.id = orderToComplete.objectId;
    order.set("status","Complete");
    return new Promise((resolve, reject) => {
      order.save(null, {
        success: function(order){
          console.log("order object updated successfully");
          resolve(order);
        },
        error: function(order,error){
          console.log("error " + error.message);
          reject(error);
        }
      });
    });
  }

  // CLIENT CANCELS A ORDER ORDER
  cancelOrder(orderId, index, which){
    console.log("cancel order : " + orderId + "at index : " + index);  
    return new Promise((resolve, reject) => {
      if(which == "In Kitchen"){
        reject("Unable to cancel: Order in kitchen. Please contact restaurant to cancel.");
      }else if(which == "Out for Delivery"){
        reject("Unable to cancel: Order out for delivery. Please contact restaurant to cancel.");
      }else if(which == "Declined"){
        reject("Unable to cancel: Order already declined by restaurant.");
      }else if(which == "Cancelled"){
        reject("Unable to cancel: Order already cancel.");
      }else if(which == "Complete"){
        reject("Unable to cancel: Order already complete.");
      }else{
        //Pending Approval   
        this.user.orders[index].status = "Cancelled";
        var Orders = Parse.Object.extend("Orders");
        var order = new Orders();
        order.id = this.user.orders[index].objectId;
        order.set("status","Cancelled");
        order.save(null, {
          success: function(order){
            console.log("order object updated successfully");
            resolve(order);
          },
          error: function(order,error){
            console.log("error " + error.message);
            reject(error.message);
          }
        });
      }
    });
  }

  // mobileAndTabletcheck = function() {
  //   var check = false;
  //   (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
  //   return check;
  // };
}
