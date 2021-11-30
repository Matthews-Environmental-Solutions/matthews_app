import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  navigate: any;

  constructor() {
    this.sideMenu();
  }

  sideMenu() {  
    this.navigate =   
    [  
        { 
        title : 'Facility',
        url   : '/facility',
        icon  : 'business-outline' 
        },
      { 
        title : 'Schedule',  
        url   : '/schedule',  
        icon  : 'calendar-outline'  
      },   
      {  
        title : 'AccountInfo',  
        url   : '/accountInfo',  
        icon  : 'person-outline'   
      }
    ];  
  }  
}
