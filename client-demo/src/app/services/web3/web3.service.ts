import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';

const Web3 = require('web3');
const Ethers = require('ethers');

@Injectable()
export class Web3Service {

  public web3: any;
  public ethers: any;
  public wallet: any;

  constructor() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(environment.HttpProvider));

    this.wallet = new Ethers.Wallet('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
    this.wallet.provider = new Ethers.providers.JsonRpcProvider(environment.HttpProvider);
  }

  public isAddress(input: string): boolean {
    return this.web3.isAddress(input);
  }

  public sign(address: any, data: any): any {
    return this.web3.eth.sign(address, data);
  }

  public keccak(types: string[], values: any[]): string {
    return Ethers.utils.solidityKeccak256(types, values);
  }

  public getAccounts(): Observable<any> {
    return Observable.create(observer => {
      this.web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          observer.error('There was an error fetching your accounts.');
        }

        if (accs.length === 0) {
          observer.error('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        }

        observer.next(accs);
        observer.complete();
      });
    });
  }

}
