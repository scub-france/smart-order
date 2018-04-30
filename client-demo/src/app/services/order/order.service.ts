import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Web3Service } from '../web3/web3.service';
import { Order } from '../../model/order.model';
import { Prescription } from '../../model/prescriptions.model';

const Ethers = require('ethers');
const artifact = require('../../../../../data/contracts/SmartOrder.json');
const contract = require('truffle-contract');

@Injectable()
export class OrderService {

  private SmartOrder = contract(artifact);
  public web3Interface: any;
  public ethersInterface: any;
  public abiEncoder: any;

  constructor(private web3Service: Web3Service) {
    this.SmartOrder.setProvider(web3Service.web3.currentProvider);
    this.SmartOrder
      .deployed()
      .then(instance => {
        this.web3Interface = instance;
        this.ethersInterface = new Ethers.Contract(instance.address, instance.abi, this.web3Service.wallet);
        this.abiEncoder = new Ethers.utils.AbiCoder;
      });
  }

  /**
   * Calculates the encoded data (minus signatures part) sent in a issuance tx for a given order,
   * @param {Order} order
   * @returns {string}
   */
  private getIssuanceCommitment(order: Order): string {
    let commitment: string = '';
    if (this.web3Service.isAddress(order.recipient)) {
      const sigFunction = this.web3Service.getFunctionSignature(this.web3Interface.abi, 'issueOrder');
      const placeholder = this.web3Service.sign('0x5aeda56215b167893e80b4fe645ba6d5bab767de', 'dummy');
      const prescriptionsDto = this.preparePrescriptions(order.prescriptions);
      const encodedParams = this.abiEncoder.encode(
        ['address', 'address', 'string[][]', 'uint', 'bytes', 'bytes'],
        [order.issuer, order.recipient, prescriptionsDto, order.validity, placeholder, placeholder]).slice(2);
      commitment = (sigFunction + encodedParams).slice(0, -448);
    }
    return commitment;
  }

  /**
   * Calculates the hash identifying a given order.
   * @param {Order} order
   * @returns {string}
   */
  public getIssuanceFingerprint(order: Order): string {
    const commitment = this.getIssuanceCommitment(order);
    if (commitment !== '') {
      return Ethers.utils.solidityKeccak256(['bytes'], [commitment]);
    }
    return commitment;
  }

  /**
   * Find an order with a given id, and read its properties from the blockchain
   * @param {string} id
   * @returns {Observable<Order>}
   */
  public findOrder(id: string): Observable<Order> {
    return Observable.create(observer => {
      this.ethersInterface.functions.getOrder(id).then(data => {
        let order: Order = new Order();
        order.id = id;
        order.createdAt = data['createdAt'].toNumber();
        order.validity = data['validity'].toNumber();
        order.issuer = data['issuer'];
        order.recipient = data['recipient'];
        order.version = data['version'];
        order.timestamp = this.web3Service.getBlockTimestamp(order.createdAt);
        order.prescriptions = data['prescriptions'].map(elt => {
          let prescription: Prescription = new Prescription();
          prescription.designation = elt[0];
          prescription.amount = elt[1].toNumber();
          prescription.unit = elt[2];
          prescription.dosage = elt[3];
          return prescription;
        });
        observer.next(order);
        observer.complete();
      });
    });
  }

  /**
   * Subscribe to Issuance events occurring on the network.
   * @param {Object} filters
   * @returns {Observable<any>}
   */
  public watchIssuance(filters: Object): Observable<any> {
    return Observable.create(observer => {
      const logIssuance = this.web3Interface.LogIssuance(filters, {fromBlock: 0, toBlock: 'latest'});
      logIssuance.watch((err, data) => {
        observer.next(data.args);
      });
    });
  }

  /**
   * Subscribe to IssuanceQuery events occurring on the network.
   * @param {Object} filters
   * @returns {Observable<any>}
   */
  public watchIssuanceQuery(filters: Object): Observable<any> {
    return Observable.create(observer => {
      const logIssuanceQuery = this.web3Interface.LogIssuanceQuery(filters, {fromBlock: 0, toBlock: 'latest'});
      logIssuanceQuery.watch((err, data) => {
        observer.next(data.args);
      });
    });
  }

  /**
   * Arrayify prescriptions objects in order to encode them in tx data.
   * @param {Prescription[]} prescriptions
   * @returns {Array<Array<string>>}
   */
  private preparePrescriptions(prescriptions: Prescription[]): Array<Array<string>> {
    return prescriptions.map((p: Prescription) => {
      return [p.designation, '' + p.amount, p.unit, p.dosage];
    });
  }

  /**
   * Craft & broadcast a transaction to issue a new order.
   * @param {Order} order
   * @returns {Observable<any>}
   */
  public issueOrder(order: Order): Observable<any> {
    return Observable.create(observer => {
      const prescriptionsDto = this.preparePrescriptions(order.prescriptions);
      this.web3Interface.getOracleQueryPrice.call('URL')
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
