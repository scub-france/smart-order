import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';

@Component({
  selector: 'app-oracle-view',
  templateUrl: './oracle.view.component.html',
  styleUrls: ['./oracle.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class OracleViewComponent implements OnInit {

  account: any;
  accounts: any;

  public constructor(private router: Router,
                     private web3Service: Web3Service) {
  }

  public ngOnInit(): void {
    this.web3Service.getAccounts().subscribe(accs => {
      this.accounts = accs;
      this.account = this.accounts[0];
    }, err => alert(err));
  }
}
