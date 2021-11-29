import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

export interface ICase {
  caseId: string;
  name: string;
  weight: string;
  gender: string;
  containerType: string;
  containerSize: string;
  status: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  cases: ICase[];
  showSearchbar: boolean;
  searchTerm: string;

  constructor(public toastController: ToastController) { }

  ngOnInit() {
    this.showSearchbar = false;
    fetch('../../assets/cases.json').then(res => res.json())
    .then(json => {
      this.cases = json;
    });
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
