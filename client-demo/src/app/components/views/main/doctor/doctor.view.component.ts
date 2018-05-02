import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../../../services/order/order.service';
import { Order } from '../../../../model/order.model';

@Component({
  selector: 'app-doctor-view',
  templateUrl: './doctor.view.component.html',
  styleUrls: ['./doctor.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class DoctorViewComponent implements OnInit {

  public account: string;
  public showForm: boolean = false;
  public isNew: boolean = false;

  public formGroup: FormGroup;
  public orders: Object = {};
  public fingerprint: string;
  public qrCodeType: 'url' | 'canvas' | 'img' = 'url';
  public qrCodeValue: string;

  public constructor(private router: Router,
                     private web3Service: Web3Service,
                     private formBuilder: FormBuilder,
                     private orderService: OrderService,
                     private toastrService: ToastrService) {
  }

  public new(): void {
    this.resetForm();
    this.addItem();
    this.isNew = true;
    this.showForm = true;
  }

  /**
   * Method used to add a new row in the formgroup to handle a new prescription inputs.
   */
  public addItem(): void {
    const itemFormGroup: FormGroup = this.formBuilder.group({
      designation: ['', Validators.required],
      amount: [0, Validators.required],
      unit: ['', Validators.required],
      dosage: ['', Validators.required]
    });
    (<FormArray>this.formGroup.get('prescriptions')).push(itemFormGroup);
    this.getFingerprint();
  }

  /**
   * Method used to remove a given prescription from the formgroup.
   * @param {number} index
   */
  public removeItem(index: number): void {
    (<FormArray>this.formGroup.get('prescriptions')).removeAt(index);
    this.getFingerprint();
  }

  /**
   * Method used to calculate current order fingerprint.
   */
  public getFingerprint(): void {
    this.fingerprint = this.orderService.getIssuanceFingerprint(this.formGroup.getRawValue());
    this.qrCodeValue = this.fingerprint;

  }

  /**
   * Method used to sign the current order fingerprint with selected doctor address.
   */
  public sign(): void {
    this.formGroup.get('signatureIssuer').setValue(this.web3Service.sign(this.account, this.fingerprint));
  }

  /**
   * Method used to submit the formgroup and proceed to order issuance.
   */
  public submit(): void {
    let order: Order = this.formGroup.getRawValue();
    this.orderService.issueOrder(order).subscribe(res => {
      this.toastrService.info('Transaction broadcasted, order issuance is being processed', 'Processing');
      this.hideForm();
      this.resetForm();
    }, err => {
      this.toastrService.error('Transaction rejected by EVM', 'Error');
    });
  }

  /**
   * Method used to load the formgroup with data of an existing Order.
   * @param {string} id
   */
  public show(id: string): void {
    this.isNew = false;
    this.resetForm();
    this.orderService.findOrder(id).subscribe(order => {

      // Merging remote data into local object
      this.orders[id] = Object.assign(this.orders[id], order);

      // Adding rows for items
      for(let i=0; i<this.orders[id].prescriptions.length ; i++) {
        this.addItem();
      }

      // Updating form with object
      this.formGroup.patchValue(this.orders[id]);
      this.showForm = true;
    });
  }

  /**
   * Method used to clear the formgroup.
   */
  private resetForm(): void {
    this.formGroup = this.formBuilder.group({
      id: [null],
      issuer: [this.account, Validators.required],
      recipient: [null, Validators.required],
      timestamp: [null, Validators.required],
      validity: [0, Validators.required],
      signatureIssuer: [null, Validators.required],
      signatureRecipient: [null, Validators.required],
      prescriptions: this.formBuilder.array([]),
      version: [0]
    });
  }

  /**
   * Method used to hide the form displaying an order details.
   */
  public hideForm(): void {
    this.isNew = false;
    this.showForm = false;
  }

  /**
   * Angular method called when this component is displayed.
   */
  public ngOnInit(): void {

    // Init accounts
    this.web3Service.getAccounts().subscribe(accounts => {
      this.account = accounts[2];
      this.resetForm();

      // Watch for issuance queries
      this.orderService.watchIssuanceQuery({issuer: this.account}).subscribe(data => {
        this.orderService.findOrder(data.queryId).subscribe(order => {
          this.orders[order.id] = order;

          // Watch for issuance event
          if(order.version === 1) {
            this.orderService.watchIssuance({issuer: this.account, queryId: order.id}).subscribe(event => {
              this.orders[order.id].version = 2;
              this.hideForm();
            });
          }
        });
      });
    }, err => alert(err));
  }
}
