import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { OrderService } from "../../../../services/order/order.service";
import { Order } from "../../../../model/order.model";

@Component({
  selector: 'app-doctor-view',
  templateUrl: './doctor.view.component.html',
  styleUrls: ['./doctor.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class DoctorViewComponent implements OnInit {

  private account: any;

  public showForm: boolean = false;
  public isNew: boolean = false;

  public formGroup: FormGroup;
  public orders: Object = {};

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

  public getAddress(): string {
    return this.account;
  }

  public addItem(): void {
    const itemFormGroup: FormGroup = this.formBuilder.group({
      designation: [null, Validators.required],
      amount: [null, Validators.required],
      unit: [null, Validators.required],
      dosage: [null, Validators.required]
    });
    (<FormArray>this.formGroup.get('prescriptions')).push(itemFormGroup);
  }

  public removeItem(index: number): void {
    (<FormArray>this.formGroup.get('prescriptions')).removeAt(index);
  }

  public getFingerprint(): string {
    const issuer : string = this.formGroup.get('issuer').value;
    const recipient: string = this.formGroup.get('recipient').value;
    if(this.web3Service.isAddress(issuer) && this.web3Service.isAddress(recipient))
      return this.web3Service.keccak(['address', 'address'], [issuer, recipient]);
    else return '';
  }

  // This function signs the current commitment and fills its form input
  public sign(): void {
    this.formGroup.get('signatureIssuer').setValue(this.web3Service.sign(this.account, this.getFingerprint()));
  }

  public submit(): void {
    let order: Order = this.formGroup.getRawValue();
    this.orderService.issueOrder(order).subscribe(res => {
      this.toastrService.info('Transaction broadcasted, order issuance is being processed', 'Processing');
    }, err => {
      this.toastrService.error('Transaction rejected by EVM', 'Error');
    });
  }

  public show(id: string): void {
    this.isNew = false;
    this.resetForm();
    this.orderService.fetchData(id).subscribe(order => {

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

  private resetForm(): void {
    this.formGroup = this.formBuilder.group({
      id: [null],
      issuer: [this.account, Validators.required],
      recipient: [null, Validators.required],
      timestamp: [null, Validators.required],
      validity: [null, Validators.required],
      signatureIssuer: [null, Validators.required],
      signatureRecipient: [null, Validators.required],
      prescriptions: this.formBuilder.array([]),
      version: [null]
    });
  }

  public hideForm(): void {
    this.isNew = false;
    this.showForm = false;
  }

  public ngOnInit(): void {

    // Init accounts
    this.web3Service.getAccounts().subscribe(accounts => {
      this.account = accounts[2];
      this.resetForm();

      // Subscribe to user's issuance events
      this.orderService.watchIssuanceQuery(this.account).subscribe(order => {
        this.orders[order.id] = order;
      });

      this.orderService.watchIssuance(this.account).subscribe(event => {
        this.orders[event.queryId].version = 2;
        this.hideForm();
      });

    }, err => alert(err));
  }
}
