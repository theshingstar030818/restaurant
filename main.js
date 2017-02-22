

Parse.Cloud.define("getMenu", function(request, response) {
  	console.log("cloud : getMenu");
	var menuReturnObject = {

	};

  	var Menu = Parse.Object.extend("Menu");
	var menuQuery = new Parse.Query(Menu);
	menuQuery.include("images");
	menuQuery.include("items");
	menuQuery.find({
	  success: function(menu) {
	  	console.log("menu has : " + menu.length + " many items");
	    menuReturnObject["array"] = menu;
	    menuArrayToMap(menu).then((map) => {
	    	menuReturnObject["map"] = map;
	    	console.log("user : " + request.user);
	    	getAllMenuItems(request.user).then((menuItemsObject)=>{
	    		console.log("response.success");
	    		menuReturnObject["allMenuItems"] = menuItemsObject;
	    		response.success(menuReturnObject);
	    	});	    	
	    });
	  },
	  error: function(error) {
	    response.error(error);
	  }
	});
});

getAllMenuItems(user){
  
    var menuItemMap={};
    var ajaxCallsRemaining;
    return new Promise((resolve, reject) => {
      var MenuItem = Parse.Object.extend("MenuItem");
      var menuItemQuery = new Parse.Query(MenuItem);
      if(user.get("type")!="admin"){menuItemQuery.equalTo("isDeleted", false)}  
      menuItemQuery.find({
        success: function(array) {
          ajaxCallsRemaining = array.length;
          for(var i=0;i<array.length;i++){
            menuItemMap[array[i].id] = {
              object:array[i],
              reviews:null,
              images:null
            };
              getRelationObjects(array[i], "reviews").then((reviews) => {
              menuItemMap[reviews["obj"].id].reviews = reviews["returnObject"];
              getRelationObjects(reviews["obj"], "images").then((images) => {
                console.log("getRelationObjects images returnd : " + images);
                menuItemMap[images["obj"].id].images = images["returnObject"];
                --ajaxCallsRemaining;
                console.log("ajaxCallsRemaining : " + ajaxCallsRemaining);
                if (ajaxCallsRemaining <= 0) {
                  console.log("resolve menuItemMap");
                  menuItemMap["array"] = array;
                  menuItemMap["map"] = arrayToMap(array);
                  resolve(menuItemMap);
                }
              });
            });
          }
        },
        error: function(error) {
          reject(error);
        }
      });
    });
}

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