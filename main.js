

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
        console.log("menu has : " + menu.length + " many items");
        menuReturnObject["array"] = menu;
        menuArrayToMap(menu).then((map) => {
          menuReturnObject["map"] = map;
          console.log("response.success");
          response.success(menuReturnObject);
        });
      },
      error: function(error) {
        response.error(error);
      }
    });
  });

  function menuArrayToMap(array){
    console.log("cloud : menuArrayToMap");
    var menuMap = {};
    var ajaxCallsRemaining = array.length;
    console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
    return new Promise((resolve, reject) => {
      for (var i = 0; i < array.length; i++) {
        console.log("Menu obj : " + array[i].id);
        menuMap[array[i].id] = {
          object:array[i],
          items:null,
          images:null
        };
        getRelationObjects(array[i], "items").then((items) => {
          console.log("getRelationObjects items returnd : " + items);
          menuMap[items["obj"].id].items = items["returnObject"];
          getRelationObjects(items["obj"], "images").then((images) => {
            console.log("getRelationObjects images returnd : " + images);
            menuMap[images["obj"].id].images = images["returnObject"];
            --ajaxCallsRemaining;
            console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
            if (ajaxCallsRemaining <= 0) {
              console.log("resolve menuMap");
              resolve(menuMap);
            }
          });
        });
      }
    });
  }

  function getRelationObjects(obj,relationName){
    console.log("cloud : getRelationObjects for obj : " + obj.id + " relationName : " + relationName);
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
          console.log("getRelationObjects-> relationName: " + relationName  + " total : " + results.length);
          returnObject.array = results;
          returnObject.map = arrayToMap(results);
          console.log("resolve getRelationObjects : returnObject : " + returnObject);
          resolve({returnObject:returnObject, obj:obj});
        }
      });
    });
  }

  function arrayToMap(array){
    console.log("converting arrayToMap length : " + array.length);
    var map = {};
    for (var i = 0; i < array.length; i++) {
      map[array[i].id] = array[i];
    }
    console.log("arrayToMap return : " + map);
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
    }).cathc((error)=>{
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
    }).cathc((error)=>{
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
    }).cathc((error)=>{
      response.error(error);
    });
  });