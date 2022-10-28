import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  userName = 'Pedro';

  userData = {
    email: 'pedrinhoreidelas777@gmail.com',
    role: 'Adm',
  }

  title = 'angular';
}
