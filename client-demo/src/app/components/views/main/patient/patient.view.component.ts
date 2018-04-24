import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient.view.component.html',
  styleUrls: ['./patient.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class PatientViewComponent implements OnInit {

  private account: any;
  public formGroup: FormGroup;

  public constructor(private router: Router,
                     private web3Service: Web3Service,
                     private formBuilder: FormBuilder) {
  }

  // This function signs the current commitment and fills its form input
  public sign(): void {
    this.formGroup.get('signature').setValue(this.web3Service.sign(this.account, this.formGroup.get('commitment').value));
  }

  public getAddress(): string {
    return this.account;
  }

  public ngOnInit(): void {

    this.formGroup = this.formBuilder.group({
      commitment: [null],
      signature: [null],
    });

    this.web3Service.getAccounts().subscribe(accounts => {
      this.account = accounts[3];
    }, err => alert(err));
  }
}
