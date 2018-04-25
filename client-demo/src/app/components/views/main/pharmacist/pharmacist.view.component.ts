import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service } from '../../../../services/web3/web3.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { OrderService } from "../../../../services/order/order.service";
import { ToastrService } from "ngx-toastr";
import { DeliveryService } from "../../../../services/delivery/delivery.service";
import { Order } from "../../../../model/order.model";
import { Delivery } from "../../../../model/delivery.model";

@Component({
  selector: 'app-pharmacist-view',
  templateUrl: './pharmacist.view.component.html',
  styleUrls: ['./pharmacist.view.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class PharmacistViewComponent implements OnInit {

  public account: any;

  public showForm: boolean = false;

  public formGroup: FormGroup;
  public order: Order;
  public deliveries: Object = {};

  public constructor(private router: Router,
                     private web3Service: Web3Service,
                     private formBuilder: FormBuilder,
                     private orderService: OrderService,
                     private deliveryService: DeliveryService,
                     private toastrService: ToastrService) {
  }

  public getAddress(): string {
    return this.account;
  }

  // This function signs the current commitment and fills its form input
  public sign(): void {
    this.formGroup.get('signaturePharmacist').setValue(this.web3Service.sign(this.account, this.getFingerprint()));
  }

  public getFingerprint(): string {
    return this.web3Service.keccak(['bytes32', 'uint8'], [this.order.id, this.order.version]);
  }

  public getRecipient(orderId: string): string {
    // return this.orders[orderId].recipient;
    return 'todo';
  }

  private resetForm(): void {
    this.formGroup = this.formBuilder.group({
      orderId: [null],
      signaturePharmacist: [null, Validators.required],
      signatureRecipient: [null, Validators.required],
      deltas: this.formBuilder.array([])
    });
  }

  public submit(): void {
    let delivery: Delivery = this.formGroup.getRawValue();
    this.deliveryService.deliver(delivery).subscribe(res => {
      this.toastrService.info('Transaction broadcasted, delivery is being processed', 'Processing');
      this.hideForm();
      this.resetForm();
    }, err => {
      this.toastrService.error('Transaction rejected by EVM', 'Error');
    });
  }

  public show(orderId: string): void {
    this.resetForm();
    this.formGroup.get('orderId').setValue(orderId);
    this.findOrder();
    this.formGroup.get('orderId').setValue(null);
  }

  public hideForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  public findOrder(): void {
    const orderId: string = this.formGroup.get('orderId').value;
    this.hideForm();
    this.resetForm();
    this.formGroup.get('orderId').setValue(orderId);
    this.orderService.findOrder(orderId).subscribe(order => {
      this.order = order;
      for (let i = 0; i < this.order.prescriptions.length; i++) {
        (<FormArray>this.formGroup.get('deltas')).push(new FormControl(0, Validators.required))
      }
      // TODO: subscribe to its deliveries to show history (+ updates ?)
      this.showForm = true;
    });
  }

  public ngOnInit(): void {

    this.formGroup = this.formBuilder.group({
      orderId: [null],
      signaturePharmacist: [null, Validators.required],
      signatureRecipient: [null, Validators.required],
      deltas: this.formBuilder.array([])
    });

    // Init accounts
    this.web3Service.getAccounts().subscribe(accounts => {
      this.account = accounts[4];
      this.resetForm();

      // Subscribe for delivery queries
      this.deliveryService.watchDeliveryQuery({pharmacist: this.account}).subscribe(delivery => {
        this.deliveries[delivery.id] = delivery;

        // Watch for delivery event
        this.deliveryService.watchDelivery({queryId: delivery.id}).subscribe(event => {
          this.deliveries[event.queryId].pending = false;
        });
      });
    }, err => alert(err));
  }
}
