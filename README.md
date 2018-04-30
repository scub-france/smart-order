# smart-order

This project aims to showcase the capabilities of solidity as a solution to issue and manage medical orders.

The documentation can be found [here](https://github.com/scub-france/smart-order/wiki).

## Dependencies
### Truffle Suite
[Truffle](https://github.com/trufflesuite/truffle) is a development environment, testing framework and asset pipeline for Ethereum, aiming to make life as an Ethereum developer easier.

### Ethereum Bridge
[Ethereum-Bridge](https://github.com/oraclize/ethereum-bridge), which allows any non-public blockchain instance to interact with the Oraclize service.

Given that the contracts rely on Oraclize, it is necessary to have a connector node running and deployed on a blockchain to test contracts, or interact with them with the angular interface.

### Angular-cli
[Angular cli](https://cli.angular.io/) is a command line interface for Angular.

You're also going to need a working copy of angular-cli (aka. ng) installed in your environment (`npm install -g @angular/cli`).

## How to run
### Docker
If you are not a developer and only want to see this demo in action, you may want to use the docker images.

Using `docker-compose up`, you can launch a functional environment containing the deployed core-contract, ethereum bridge and the client-demo.

### Manual setup
1. Fetch the codebase :  `git clone https://github.com/scub-france/smart-order`
2. Compile & deploy contracts (cf. core-contract's [README](./core-contract/README.md)).
3. Run the oraclize connector (cf. Ethereum Bridge) 

## smart-order/core-contract
This module contains all the files related to the smart contracts.

## Contribute
Contributions are always welcome & encouraged! :smile: If you'd like to contribute, please see [Contributing Guidelines](./CONTRIBUTING.md).
