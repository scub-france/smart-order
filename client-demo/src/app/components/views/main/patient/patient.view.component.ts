import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-patient-view',
  templateUrl: './patient.view.component.html',
  styleUrls: ['./patient.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class PatientViewComponent implements OnInit {

  public account: string;
  public formGroup: FormGroup;

  public constructor(private router: Router,
                     private web3Service: Web3Service,
                     private formBuilder: FormBuilder) {
  }

  /**
   * Method used to sign the 'commitment' input from the formgroup with the selected patient address.
   */
  public sign(): void {
    this.formGroup.get('signature').setValue(this.web3Service.sign(this.account, this.formGroup.get('commitment').value));
  }

  /**
   * Angular method called when this component is displayed.
   */
  public ngOnInit(): void {

    this.formGroup = this.formBuilder.group({
      commitment: [''],
      signature: ['']
    });

    this.web3Service.getAccounts().subscribe(accounts => {
      this.account = accounts[3];
    });
  }
}
