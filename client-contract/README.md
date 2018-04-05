# Ethereum Boilerplate
This project is based on an [Angular-Truffle](https://github.com/Nikhil22/angular4-truffle-starter-dapp) seed which was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.
It is an angular4 + [truffle](https://github.com/trufflesuite/truffle) starter app. 

Write, compile & deploy smart contracts for Ethereum. Share your code with others thanks to the addition of routing & components.

## How to use
### Part 1 : Setting up
1. `git clone https://src.scub.net/jlaine/ethereum-boilerplate`
2. `cd ethereum-boilerplate`
3. `npm install`

You're also going to need a working copy of angular-cli (aka. ng) installed in your environment (`npm install -g @angular/cli`).

### Part 2 : Smart-contracts
Open a new console and type `truffle develop` to open a truffle invite & setup a local development blockchain network.

Then in the truffle console you'll be able to execute the following commands :
1. `compile` to compile your contracts
2. `migrate` to deploy your contracts to the network. 
You can use `--reset` in case of contract update to force recompilation.

### Part 3 : Browser access
1. `npm start` to build & serve the application. 
2. Open a browser and go to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.. 

## Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

Please respect the existing file organization. For instance, move the cli-generated components from src/app/component-name to the appropriate folder (which for a new contract would be src/app/components/views/main/component-name).

## Running unit tests
1. Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
2. Run `truffle test` to run tests associated with your solidity smart contracts. The test folder for this can be found in the `test` directory at the root level of this project

## Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Contribute
Contributions are always welcome & encouraged! :smile: If you'd like to contribute, please see [Contributing Guidelines](CONTRIBUTING.md).

## Technologies & Languages Used
1. Angular4 (Typescript/Javascript)
2. Truffle (Solidity)

##Contracts
- MetaCoin : the aim of this contract is to issue a currency on top of ethereum. All balances are tracked by the smart-contract.


- Oracle : simple contracts showcasing the use of oraclize. In order to work, this contract needs you to have an instance of [ethereum-bridge](https://github.com/oraclize/ethereum-bridge) running.


- Factory & Child : a contract (Factory) able to spawn on demand instances of 'Child' contracts. The child contract addresses are stored in the factory.

##Ethereum-bridge
This tool enables any non-public blockchain instance to interact with the Oraclize service.
1. `git clone https://github.com/oraclize/ethereum-bridge` 
2. `cd ethereum-bridge` : navigate to git folder
3. `npm install`
4. `node bridge -H localhost:9545 -a 1 --dev --loglevel verbose` deploys contract using the account 1 found on the localhost:9545 node.
