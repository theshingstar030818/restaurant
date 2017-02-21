import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import Parse from 'parse';

/*
  Generated class for the MenuService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MenuService {

	menu: any;

  constructor(public http: Http) {
    let me = this;
    console.log("MenuService ....");
    Parse.Cloud.run('getMenu').then(function(menu) {
    	me.menu = menu;
	});
  }

  testCloud(){
  	Parse.Cloud.run('getMoreFeed', { 
        
      }).then(function(posts) {
        console.log(posts);
      });
    
  }

}
