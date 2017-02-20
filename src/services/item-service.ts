import {Injectable} from "@angular/core";
// import {ITEMS} from "./mock-items";
import {CategoryService} from "./category-service";

import Parse from 'parse';

@Injectable()
export class ItemService {
  
  public items: any;

  //all options, extras and sizes that the adminmay chose from
  public options: any;
  public extras: any;
  public sizes: any;

  constructor(
    public categoryService: CategoryService
  ) {
    this.options = null;
    this.extras = null;
    this.sizes = null;
    
    this.getOptions();
    this.getExtras();
    this.getSizes();
  }

  addItem(addItemModal){

    var me = this;
    return new Promise((resolve, reject) => {
      console.log("create this item now");
      
      if(addItemModal.edit){
        var item = addItemModal.itemToEdit;
      }else{
        var Item = Parse.Object.extend("item");
        var item = new Item();
      }

      item.set("name", addItemModal.name);
      item.set("price", parseInt(addItemModal.price));
      item.set("outOfStock", addItemModal.outOfStock);
      item.set("isDeleted", addItemModal.isDeleted);
      
      if(addItemModal.thumbFile){
        item.set("thumb", addItemModal.thumbFile);
      }
      
      item.set("description", addItemModal.description);

      var options = this.getOptionsArray(addItemModal.optionsModels);
      var extras = this.getArray(addItemModal.extrasModels);
      var sizes = this.getArray(addItemModal.sizesModels);

      item.set("options", options);
      item.set("extras", extras);
      item.set("sizes", sizes);
      item.set("cartegory", addItemModal.category.menu);
      
      if(addItemModal.imagesFile.lenght>0){
        this.uploadImages(addItemModal.imagesFile, addItemModal.imagesFileDetailObject).then((response) => {
          return response;
        }).then((arrayImagesNames) => {
          var images = []

          var myObject: Array<any>;
          myObject = <any> arrayImagesNames;

          for (var i=0; i<myObject.length; i++) {
            images.push(arrayImagesNames[i].get("file").name());
          }
          item.set("images", images);
          
          item.save(null, {
            success: function(item) {
              console.log("item stored in database : " + item);
              me.items[item.id] = item;
              if(addItemModal.edit){
                me.categoryService.categories[item.get("cartegory").id].items[addItemModal.currItemIndex] = item;
              }else{
                me.categoryService.categories[item.get("cartegory").id].items.push(item);
              }
              
              resolve(item); 
            },
            error: function(item, error) {
              reject(error);
            }
          });
        }).catch((ex) => {
          console.error('Error : ', ex);
        });
      }else{
        item.save(null, {
          success: function(item) {
            console.log("item stored in database : " + item);
            me.items[item.id] = item;
            if(addItemModal.edit){
              me.categoryService.categories[item.get("cartegory").id].items[addItemModal.currItemIndex] = item;
            }else{
              me.categoryService.categories[item.get("cartegory").id].items.push(item);
            }
            resolve(item); 
          },
          error: function(item, error) {
            reject(error);
          }
        });
      }
    });
  }

  uploadImages(imagesArray,imagesDetailsArray){
    var me = this;
    var array = [];
    return new Promise((resolve, reject) => {
      for(var i=0; i<imagesArray.length; i++){
        me.uploadImae(imagesArray[i],imagesDetailsArray[i]).then((response) => {
          return response;
        }).then((image) => {
          array.push(image);
          if(array.length==imagesArray.length){
            resolve(array);
          }
        }).catch((ex) => {
          console.error('Error : ', ex);
        });
      }
    });
  }

  uploadImae(image,imageDetail){
    return new Promise((resolve, reject) => {
      var File = Parse.Object.extend("File");
      var file = new File();

      file.set("file", image);
      file.set("info", imageDetail);
      file.set("isDeleted", false);

      file.save(null, {
        success: function(file) {
          resolve(file);
        },
        error: function(file, error) {
          reject(error);
        }
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

  getOptions(){
    var me = this;
    var option = new Parse.Query("Option");
    option.find({
      success: function(results) {
        me.options = results;
      },
      error: function(reuslts, error) {
        console.log("Error : " + error.message);
      }
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

  getExtras(){
    var me = this;
    var extra = new Parse.Query("Extra");
    extra.find({
      success: function(results) {
        me.extras = results;
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

  getSizes(){
    var me = this;
    var size = new Parse.Query("Size");
    size.find({
      success: function(results) {
        me.sizes = results;
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
  }

  getAll() {
    return this.items;
  }

  getItem(id) {
    if(id in this.items){
      return this.items[id];
    }else{
      return null;
    }
  }

  remove(item) {
    this.items.splice(this.items.indexOf(item), 1);
  }

  getItemForCart(item,  addOns, quantity){
    var cartItem = {};
    var itemAddOns = {
      options:[],
      extras:[],
      size: null
    };
    var key;
    var options = this.addOnsArrayToMap(item.get("options"));
    var extras = this.addOnsArrayToMap(item.get("extras"));
    var sizes = this.addOnsArrayToMap(item.get("sizes"));
    var finalPrice = item.get("price");
    cartItem['orignalItem'] = item;
    
    for(key in addOns.options){
      if(addOns.options[key]){
        itemAddOns.options.push(options[key]);
      }
    }

    for(key in addOns.extras){
      if(addOns.extras[key]){
        itemAddOns.extras.push(extras[key]);
        finalPrice+= parseInt(extras[key].value);
      }
    }
    if( typeof addOns.sizes === 'string' ) {
        // input is a string
        itemAddOns.size = sizes[addOns.sizes];
        finalPrice -= item.get("price");
        finalPrice += parseInt(sizes[addOns.sizes].value);
    }
    cartItem['addOns'] = itemAddOns; 
    cartItem['finalPrice'] = finalPrice; 
    cartItem['quantity'] = quantity;
    return cartItem;
  }

  addOnsArrayToMap(array){
    var map = {};
    for(var i=0; i<array.length; i++){
      map[array[i].name] = array[i];
    }
    return map;
  }

  arrayToMap(array){
    var map = {};
    for(var i=0; i<array.length; i++){
      map[array[i].id] = array[i];
    }
    return map;
  }
}
