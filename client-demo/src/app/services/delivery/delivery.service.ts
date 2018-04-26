import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Web3Service } from '../web3/web3.service';
import { Delivery } from '../../model/delivery.model';

const Ethers = require('ethers');
const artifact = require('../../../../../core-contract/build/contracts/SmartOrder.json');
const contract = require('truffle-contract');

@Injectable()
export class DeliveryService {

  private SmartOrder = contract(artifact);
  public web3Interface: any;
  public ethersInterface: any;

  constructor(private web3Service: Web3Service) {
    this.SmartOrder.setProvider(web3Service.web3.currentProvider);
    this.SmartOrder
      .deployed()
      .then(instance => {
        this.web3Interface = instance;
        this.ethersInterface = new Ethers.Contract(instance.address, instance.abi, this.web3Service.wallet);
      });
  }

  public watchDelivery(filters: Object): Observable<any> {
    return Observable.create(observer => {
      const logDelivery = this.web3Interface.LogDelivery(filters, {fromBlock: 0, toBlock: 'latest'});
      logDelivery.watch((err, data) => {
        observer.next(data.args);
      });
    });
  }

  public watchDeliveryQuery(filters: Object): Observable<any> {
    return Observable.create(observer => {
      const logDeliveryQuery = this.web3Interface.LogDeliveryQuery(filters, {fromBlock: 0, toBlock: 'latest'});
      logDeliveryQuery.watch((err, data) => {
        let delivery: Delivery = new Delivery();
        delivery.id = data.args.queryId;
        delivery.orderId = data.args.orderId;
        delivery.pending = true;
        delivery.timestamp = this.web3Service.getBlockTimestamp(data.args.block);
        observer.next(delivery);
      });
    });
  }

  public deliver(delivery: Delivery): Observable<any> {
    return Observable.create(observer => {
      this.web3Interface.getOracleQueryPrice.call('URL')
        .then(value => {
          return this.ethersInterface.functions.deliver(delivery.orderId, delivery.signaturePharmacist, delivery.signatureRecipient, delivery.deltas, {value: value.add(1).toNumber()});
        }).then(res => {
        observer.next(res);
        observer.complete();
      }).catch(err => {
        console.log(err);
        observer.error(err);
      });
    });
  }

}
