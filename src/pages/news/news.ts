import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {PostService} from '../../services/post-service';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-news',
  templateUrl: 'news.html'
})
export class NewsPage {
  // list of posts
  public posts: any;

  constructor(public nav: NavController, public postService: PostService) {
    // set sample data
    this.posts = postService.getAll();
  }
}
