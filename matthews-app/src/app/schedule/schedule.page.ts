import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ICase } from '../case/case';
import { CaseService } from '../case/case.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit, OnDestroy {
  cases: ICase[];
  showSearchbar: boolean;
  searchTerm: string;
  sub: Subscription;

  constructor(public toastController: ToastController, private caseService: CaseService) { }

  ngOnInit() {
    this.showSearchbar = false;
  }

  ionViewWillEnter() {
    this.sub = this.caseService.getCases().subscribe({
      next: cases => {
        this.cases = cases;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  deleteCase(id: number) {
    this.caseService.deleteCase(id.toString()).subscribe(result =>
      {
        this.cases.forEach( (item, index) => {
          if(item.id === id) {
            this.cases.splice(index,1);
          }
        });
      });
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }
}
