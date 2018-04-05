import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-view',
  templateUrl: './account.view.component.html',
  styleUrls: ['./account.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class AccountViewComponent implements OnInit {

  public accounts: Array<any> = [];
  public formGroup: FormGroup;

  public constructor(private router: Router,
                     private web3Service: Web3Service,
                     private formBuilder: FormBuilder) {
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      from: [null, Validators.required],
      to: [null, Validators.required],
      amount: [null, Validators.required]
    });

    this.web3Service.getAccounts().subscribe(res => {
      this.accounts = res;
      this.formGroup.get('from').setValue(res[0]);
    }, err => alert(err));
  }

  public getAccountBalance(index: number): string {
    let value = '';
    if (index === 0 && this.web3Service.isAddress(this.formGroup.get('from').value)) {
      value = this.web3Service.getAccountBalance(this.formGroup.get('from').value);
    }
    else if(index === 1 && this.web3Service.isAddress(this.formGroup.get('to').value)) {
      value = this.web3Service.getAccountBalance(this.formGroup.get('to').value);
    }
    return value;
  }

  // public submit(): void {
  //   this.web3Service.transfer(from, to, amount);
  // }
}
