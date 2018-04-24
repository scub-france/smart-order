import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { Web3Service } from "../web3/web3.service";
import { Order } from "../../model/order.model";
import { Prescription } from "../../model/prescriptions.model";
import { observable } from "rxjs/symbol/observable";

const Ethers = require('ethers');
const artifact = require('../../../../../core-contract/build/contracts/SmartOrder.json');
const contract = require('truffle-contract');

@Injectable()
export class OrderService {

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

  public fetchData(id: string): Observable<Order> {
    return Observable.create(observer => {
      this.ethersInterface.functions.getOrder(id).then(data => {
        let order: Order = new Order();
        order.validity = data['validity'].toNumber();
        order.prescriptions = data['prescriptions'].map(elt => {
          let prescription: Prescription = new Prescription();
          prescription.designation = elt[0];
          prescription.amount = elt[1].toNumber();
          prescription.unit = elt[2];
          return prescription;
        });
        observer.next(order);
        observer.complete();
      });
    });
  }

  public getAddress(): Observable<string> {
    return Observable.create(observer => {
      this.SmartOrder
        .deployed()
        .then(instance => {
          observer.next(instance.address);
          observer.complete();
        })
        .catch(e => {
          console.log(e);
          observer.error(e);
        });
    });
  }

  public watchIssuance(issuer: string): Observable<any> {
   return Observable.create(observer => {
     const logIssuance = this.web3Interface.LogIssuance({issuer: issuer}, {fromBlock: 0, toBlock: 'latest'});
     logIssuance.watch((err, data) => {
       observer.next(data.args);
     });
   });
  }

  public watchIssuanceQuery(issuer: string): Observable<any> {
    return Observable.create(observer => {
      const logIssuanceQuery = this.web3Interface.LogIssuanceQuery({issuer: issuer}, {fromBlock: 0, toBlock: 'latest'});
      logIssuanceQuery.watch((err, data) => {
        let order: Order = new Order();
        order.id = data.args.queryId;
        order.issuer = data.args.issuer;
        order.recipient = data.args.recipient;
        order.version = 1;
        observer.next(order);
      });
    });
  }

  private preparePrescriptions(prescriptions: Prescription[]): Array<Array<string>> {
    return prescriptions.map((p: Prescription) => {
      return [p.designation, '' + p.amount, p.unit];
    });
  }

  public issueOrder(order: Order): Observable<any> {
    return Observable.create(observer => {
      const prescriptionsDto = this.preparePrescriptions(order.prescriptions);
      this.web3Interface.getOracleQueryPrice.call("URL")
        .then(value => {
          return this.ethersInterface.functions.issueOrder(order.issuer, order.recipient, prescriptionsDto, order.validity, order.signatureIssuer, order.signatureRecipient, {value: value.add(1).toNumber()});
        }).then(res => {
        observer.next(res);
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }

}
