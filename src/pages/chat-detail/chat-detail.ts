import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {ChatService} from '../../services/chat-service';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-chat-detail',
  templateUrl: 'chat-detail.html'
})
export class ChatDetailPage {
  public chat: any;

  constructor(public nav: NavController, public chatService: ChatService) {
    // get sample data only
    //this.chat = chatService.getItem(navParams.get('id'));
    this.chat = chatService.getItem(0);
  }
}
