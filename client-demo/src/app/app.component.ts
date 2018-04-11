import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Web3Service } from './services/web3/web3.service';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  // TODO add proper types these variables
  account: any;
  accounts: any;


  constructor(private web3Service: Web3Service) {

  }

  public ngOnInit(): void {
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err));
  }
}
