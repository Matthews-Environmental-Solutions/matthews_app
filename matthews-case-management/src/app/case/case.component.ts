import { Component } from '@angular/core';
import { Facility } from '../models/facility.model';
import { Case } from '../models/case.model';
import { AuthService } from '../auth/auth.service';
import { UserInfo } from '../models/userinfo.model';

@Component({
  selector: 'app-case',
  templateUrl: './case.component.html',
  styleUrls: ['./case.component.scss'],
})
export class CaseComponent {
  facilities: Facility[] = [
    { value: '1', viewValue: 'Facility 1' },
    { value: '2', viewValue: 'Facility 2' },
    { value: '3', viewValue: 'Facility 3' },
  ];

  unscheduledCases: Case[] = [
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2"),
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2"),
    new Case("834FGF2", "John", "Doe", 79, "Cardboard", "Male", "Dev 2"),
    new Case("824KRB3", "Ekaterina", "Kocsorwa", 16, "Hardwood", "Child", "Dev 2"),
    new Case("824KRB4", "Jane", "Tratinelli", 56, "Hardwood", "Fimale", "Dev 2")
  ];

  loggedInUser: UserInfo | undefined;

  constructor(private authService: AuthService) {
    let userinfoString = localStorage.getItem('id_token_claims_obj');
    let jsonLoggedInUser = JSON.parse(userinfoString ? userinfoString : '');
    
    this.loggedInUser = new UserInfo();
    this.loggedInUser.copyInto(jsonLoggedInUser);
  }

  logout(): void {
    this.authService.logout();
  }
}
