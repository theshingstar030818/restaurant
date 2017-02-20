import {Injectable} from "@angular/core";
// import {MENU} from "./mock-menu";
import {CategoryService} from "./category-service";
import {ItemService} from "./item-service";
import {UserService} from "./user-service";

import Parse from 'parse';

@Injectable()
export class MenuService {
  public menu: any;
  public items: any;
  public menuMap: any;
  public itemsMap: any;

  constructor(
    public categoryService: CategoryService,
    public itemService: ItemService,
    public userService: UserService
    ) {
    
    this.menu = null;
    this.items = null;
    this.menuMap = null;
    this.itemsMap = null;
    this.fetchMenu();
    
  }

  fetchMenu(){
    var me = this;
    // key => menu[i].id
    // value => menu object
    var menuMap = {};
    var itemsMap = {};
    
    var menu = new Parse.Query("Menu");
    var item = new Parse.Query("item");

    if(!this.userService.isAdmin()){
      item.equalTo("isDeleted",false);
    }

    menu.find({
      success: function(menu) {
        
        item.find({
          success: function(items) {
            me.items = items;
            for(var i=0; i< items.length; i++){
              itemsMap[items[i].id] = items[i];
              if(items[i].get("cartegory").id in menuMap){
                console.log(items[i].get("cartegory").get("name") + " found in menuMap.");
                menuMap[items[i].get("cartegory").id].items.push(items[i]);
              }else{
                // console.log(items[i].get("cartegory").get("name") + " not found in menuMap.");
                menuMap[items[i].get("cartegory").id] = {menu: items[i].get("cartegory"),items: [items[i]]};
                // console.log("added menuObj with empty  items array for " + items[i].get("cartegory").get("name") + " to menuMap");
                // console.log(items[i].get("cartegory").get("name") + " in menuMap has key => " + items[i].get("cartegory").id + " value => " + menuMap[items[i].get("cartegory").id]);
              }
            }

            for(var y=0; y<menu.length; y++){
              if(! (menu[y].id in menuMap)){
                //add the remaining menu categories to the menuMap
                menuMap[menu[y].id] = {menu: menu[y],items: []};
              }
            }
            me.menuMap = menuMap;
            me.itemsMap = itemsMap;
            me.itemService.items = me.itemsMap;
            me.categoryService.categories = menuMap;
            me.menu = menu;
            //response.success(menuMap);
          },
          error: function() {
            //response.error("failed on getFullMenu");
          }
        });
      },
      error: function() {
        //response.error("failed on getFullMenu");
      }
    });
  }

  addItem(name, image, imageDetailObject){

    var me = this;

    var Menu = Parse.Object.extend("Menu");
    var menu = new Menu();

    menu.set("name", name);
    menu.set("items", []);
    menu.set("image", image);
    menu.set("imageDetailObject", imageDetailObject);
    return new Promise((resolve, reject) => {
      menu.save(null, {
        success: function(menu) {
          // Execute any logic that should take place after the object is saved.
          // console.log('New menu object created with objectId: ' + menu.id);
          me.menu.push(menu);
          resolve(menu);
        },
        error: function(menu, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          // console.log('Failed to create new object, with error code: ' + error.message);
          reject(error);
        }
      });
    });
  }

  getItem(id) {
    for (var i = 0; i < this.menu.length; i++) {
      if (this.menu[i].id === id) {
        return this.menu[i];
      }
    }
    return null;
  }

  remove(item) {
    this.menu.splice(this.menu.indexOf(item), 1);
  }
}
