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
    this.sub = this.caseService.getCases().subscribe({
      next: cases => {
        this.cases = cases;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  cancelSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
  }

  async pressed(): Promise<void>  {

    console.log('One tap pressed');
  }

  async active(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Your settings have been saved.',
      duration: 2000
    });
    toast.present();
    console.log('Long tap pressed');
  }
}
