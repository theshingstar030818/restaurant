

  Parse.Cloud.define("getMenu", function(request, response) {
    console.log("cloud : getMenu");
    var menuReturnObject = {};

    var Menu = Parse.Object.extend("Menu");
    var menuQuery = new Parse.Query(Menu);
    menuQuery.include("images");
    menuQuery.include("items");
    menuQuery.include("items.mainImage");
    menuQuery.find({
      success: function(menu) {
        // console.log("menu has : " + menu.length + " many items");
        menuReturnObject["array"] = menu;
        menuArrayToMap(menu).then((map) => {
          menuReturnObject["map"] = map;
          // console.log("response.success");
          response.success(menuReturnObject);
        });
      },
      error: function(error) {
        response.error(error);
      }
    });
  });

  function menuArrayToMap(array){
    // console.log("cloud : menuArrayToMap");
    var menuMap = {};
    var ajaxCallsRemaining = array.length;
    // console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
    return new Promise((resolve, reject) => {
      for (var i = 0; i < array.length; i++) {
        // console.log("Menu obj : " + array[i].id);
        menuMap[array[i].id] = {
          object:array[i],
          items:null,
          images:null
        };
        getRelationObjects(array[i], "items").then((items) => {
          // console.log("getRelationObjects items returnd : " + items);
          menuMap[items["obj"].id].items = items["returnObject"];
          getRelationObjects(items["obj"], "images").then((images) => {
            // console.log("getRelationObjects images returnd : " + images);
            menuMap[images["obj"].id].images = images["returnObject"];
            --ajaxCallsRemaining;
            // console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
            if (ajaxCallsRemaining <= 0) {
              // console.log("resolve menuMap");
              resolve(menuMap);
            }
          });
        });
      }
    });
  }

  function getRelationObjects(obj,relationName){
    // console.log("cloud : getRelationObjects for obj : " + obj.id + " relationName : " + relationName);
    return new Promise((resolve, reject) => {
      var returnObject = {
        array: null,
        map: null
      }; 
      var relation = obj.relation(relationName);
      var query = relation.query();
      query.include("mainImage");
      query.find({
        success: function(results){
          // console.log("getRelationObjects-> relationName: " + relationName  + " total : " + results.length);
          returnObject.array = results;
          returnObject.map = arrayToMap(results);
          // console.log("resolve getRelationObjects : returnObject : " + returnObject);
          resolve({returnObject:returnObject, obj:obj});
        }
      });
    });
  }

  function arrayToMap(array){
    // console.log("converting arrayToMap length : " + array.length);
    var map = {};
    for (var i = 0; i < array.length; i++) {
      map[array[i].id] = array[i];
    }
    // console.log("arrayToMap return : " + map);
    return map;
  }

  function fetchAllEmployees (){
    return new Promise((resolve, reject) => {
      var me =this;
      var employee = new Parse.Query("Employee");
      employee.equalTo("isDeleted",false);
      var me= this;
      employee.find({
        success: function(employees) {
          resolve(employees);
        },
        error: function(error){
          reject(error);
        }
      })
    });
  }

  Parse.Cloud.define("fetchAllEmployees", function(request, response) {
    fetchAllContacts().then((employees)=>{
      response.success(employees);
    }).catch((error)=>{
      response.error(error);
    });
  });

  function fetchAllContacts (){
    return new Promise((resolve, reject) => {
      var me =this;
      var contact = new Parse.Query("Contact");
      //ontact.equalTo("isDeleted",false);
      var me= this;
      contact.find({
        success: function(contacts) {
          var contacts = contacts;
          var contactsMap = {};
          for(var i=0; i<contacts.length; i++){
            contactsMap[contacts[i].id] = contacts[i];
          }
          resolve({array:contacts,map:contactsMap});
        },
        error: function(error){
          reject(error);
        }
      })
    });
  }

  Parse.Cloud.define("fetchAllContacts", function(request, response) {
    fetchAllContacts().then((contacts)=>{
      response.success(contacts);
    }).catch((error)=>{
      response.error(error);
    });
  });

  function fetchAllAddresses (){
    return new Promise((resolve, reject) => {
      var me =this;
      var address = new Parse.Query("Address");
      //ontact.equalTo("isDeleted",false);
      var me= this;
      address.find({
        success: function(address) {
          var addresses = address;
          var addressesMap = {};
          for(var i=0; i<address.length; i++){
            addressesMap[address[i].id] = address[i];
          }
          resolve({array:address,map:addressesMap});
        },
        error: function(error){
          reject(error);
        }
      })
    });
  }

  Parse.Cloud.define("fetchAllAddresses", function(request, response) {
    fetchAllAddresses().then((addresses)=>{
      response.success(addresses);
    }).catch((error)=>{
      response.error(error);
    });
  });

  function fetchAllOrders (ordersDate){
    return new Promise((resolve, reject) => {  
      var me = {};
      var order = new Parse.Query("Orders");
      order.include("address");
      order.include("contact");
      order.include("driver");
      order.greaterThanOrEqualTo("createdAt", getDayStartDateObj(new Date(ordersDate)));
      order.lessThan("createdAt", getDayEndDateObj(new Date(ordersDate)));
      order.find({
        success: function(results) {
          // console.log(results.length + " orders fetched");
          me["user"].orders = [];
          me["user"].ordersMap = {};
          me["ordersDetails"]["declinedOrders"] = {array:[],total:0};
          me["ordersDetails"]["cancelledByClientOrders"] = {array:[],total:0};
          me["ordersDetails"]["pendingApprovalOrders"] = {array:[],total:0};
          me["ordersDetails"]["inKitchenOrders"] = {array:[],total:0};
          me["ordersDetails"]["outForDeliveryOrders"] = {array:[],total:0};
          me["ordersDetails"]["completedOrders"] = {array:[],total:0};
          for(var i=0; i<results.length; i++){
            var jsonObj = JSON.parse(JSON.stringify(results[i]));
            var status = results[i].get("status");
            if(status == "Pending Approval"){
              me["ordersDetails"].pendingApprovalOrders.array.push(jsonObj);
              me["ordersDetails"].pendingApprovalOrders.total += results[i].get("transaction").total;
            }else if(status == "Declined"){
              me["ordersDetails"].declinedOrders.array.push(jsonObj);
              me["ordersDetails"].declinedOrders.total += results[i].get("transaction").total;
            }else if(status == "Cancelled"){
              me["ordersDetails"].cancelledByClientOrders.array.push(jsonObj);
              me["ordersDetails"].cancelledByClientOrders.total += results[i].get("transaction").total;
            }else if(status == "In Kitchen"){
              me["ordersDetails"].inKitchenOrders.array.push(jsonObj);
              me["ordersDetails"].inKitchenOrders.total += results[i].get("transaction").total;
            }else if(status == "Out for Delivery"){
              me["ordersDetails"].outForDeliveryOrders.array.push(jsonObj);
              me["ordersDetails"].outForDeliveryOrders.total += results[i].get("transaction").total;
            }else if(status == "Complete"){
              me["ordersDetails"].completedOrders.array.push(jsonObj);
              me["ordersDetails"].completedOrders.total += results[i].get("transaction").total;
            }
            me["user"].orders.push(jsonObj)
            me["user"].ordersMap[results[i].id] = jsonObj;
          }
          me.user.orders.sort(sortOrdersByTimeEarliestFirst);
          resolve(me);
        },
        error: function(reuslts, error) {
          reject(error);
        }
      });
    });
  }

  function getDayStartDateObj(date){
    var d = new Date ( date.getTime() + (date.getTimezoneOffset() * 60000));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getDayEndDateObj(date){
    var d = new Date ( date.getTime() + (date.getTimezoneOffset() * 60000));
    d.setHours(23, 59, 59, 999);
    return d;
  }

  function sortOrdersByTimeEarliestFirst(a, b) {
    var aTime = new Date(a.createdAt).getTime();
    var bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  }

  Parse.Cloud.define("fetchAllOrders", function(request, response) {
    fetchAllOrders(request.params.date).then((orders)=>{
      response.success(orders);
    }).catch((error)=>{
      response.error(error);
    });
  });

  function fetchOrders(parseUser){
    return new Promise((resolve, reject) => {  
      var me = {};
      var order = new Parse.Query("User_Order_");
      order.equalTo("user",parseUser);
      order.include("order");
      order.find({
        success: function(results) {
          // console.log("orders fetched : " + results.length);
          me["user"].orders = [];
          me["user"].ordersMap = {};
          
          for(var i=0; i<results.length; i++){
            me.user.orders.push(JSON.parse(JSON.stringify(results[i].get("order"))));
            me.user.ordersMap[results[i].get("order").id] = JSON.parse(JSON.stringify(results[i].get("order")));
          }
          
          me.user.orders.sort(me.sortOrdersByTimeEarliestFirst);
          resolve(me);
        },
        error: function(reuslts, error) {
          reject(error);
        }
      });
    });
  }

  Parse.Cloud.define("fetchOrders", function(request, response) {
    fetchOrders(request.user).then((orders)=>{
      response.success(orders);
    }).catch((error)=>{
      response.error(error);
    });
  }); 

  function fetchContacts(parseUser){
    return new Promise((resolve, reject) => {    
      var me = {};
      var contact = new Parse.Query("Contact");
      contact.equalTo("user",parseUser);
      contact.find({
        success: function(results) {
          // console.log("contacts fetched : " + results);
          me["user"].contacts = [];
          for(var i=0; i<results.length; i++){
            me.user.contacts.push(JSON.parse(JSON.stringify(results[i].get("contact")))) 
          }
          resolve(me);
        },
        error: function(reuslts, error) {
          reject(error);
        }
      });
    });  
  }

  Parse.Cloud.define("fetchContacts", function(request, response) {
    fetchOrders(request.user).then((contacts)=>{
      response.success(contacts);
    }).catch((error)=>{
      response.error(error);
    });
  }); 

  function fetchAddresses(parseUser){
    return new Promise((resolve, reject) => {
      var me = {};
      var address = new Parse.Query("User_Address_");
      address.equalTo("user",me.user.parseUserObject);
      address.include("address");
      address.find({
        success: function(results) {
          // console.log("addresses fetched : " + results);
          me["user"].addresses = [];
          for(var i=0; i<results.length; i++){
            me.user.addresses.push(JSON.parse(JSON.stringify(results[i].get("address")))) 
          }
          resolve(me);
        },
        error: function(reuslts, error) {
          reject(error);
        }
      });
    });
  }

  Parse.Cloud.define("fetchAddresses", function(request, response) {
    fetchOrders(request.user).then((address)=>{
      response.success(address);
    }).catch((error)=>{
      response.error(error);
    });
  }); 