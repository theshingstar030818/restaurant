import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import Parse from 'parse';

/*
  Generated class for the ImageService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ImageService {

  constructor(
  	public http: Http
  ) {}

  getParseFileBase64(fileInput){
  	let me = this;
	let reader = new FileReader();
	return new Promise((resolve, reject) => { 
	  	if (fileInput.target.files.length == 1) {
		  	reader.onload = function (e : any) {
			      if(e.target.result){
			      	let parseFileBase64 = me.getParseFile(fileInput.target.files[0].name, { base64: e.target.result });
			      	resolve(parseFileBase64);
			      }else{
			      	reject();
			      }
			  }
			  reader.readAsDataURL(fileInput.target.files[0]);
		  
		}else{
			reject({message:"Only one file allowed"});
		}
	});
  }

  // name : String,  encoding : base64-encoded 
  getParseFile(name, encoding){
    name = name.replace(/[^a-zA-Z0-9_.]/g, '');
    let parseFile = new Parse.File( name, encoding);
    return parseFile;
  }

}
