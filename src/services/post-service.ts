import {Injectable} from "@angular/core";
import {POSTS} from "./mock-posts";

@Injectable()
export class PostService {
  private posts: any;

  constructor() {
    this.posts = POSTS;
  }

  getAll() {
    return this.posts;
  }

  getItem(id) {
    for (var i = 0; i < this.posts.length; i++) {
      if (this.posts[i].id === parseInt(id)) {
        return this.posts[i];
      }
    }
    return null;
  }

  remove(item) {
    this.posts.splice(this.posts.indexOf(item), 1);
  }
}
