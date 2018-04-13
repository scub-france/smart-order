/**
 * WARNING !
 * Writing smart-contracts with Solidity is a tricky task.
 * Developers are invited to go and read https://www.dasp.co for an introduction on known vulnerabilities.
 * There is also a link to https://consensys.github.io/smart-contract-best-practices/ which is worth the read.
 */

var SmartOrder = artifacts.require("./SmartOrder.sol");

// Using ethers because web3.js doesn't support struct in function args.
// c.f: https://github.com/ethereum/web3.js/issues/1241
var ethers = require('ethers');

let ethereum_provider;
if (process.env.ETHEREUM_PROVIDER) {
    ethereum_provider = process.env.ETHEREUM_PROVIDER;
} else {
    ethereum_provider = "http://localhost:9545";
}
var provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER);

/**
 * GLOBAL VARS
 */
// Account used for contract deployment
var wallet = new ethers.Wallet('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');            // 0
wallet.provider = provider;

// Account used by oraclize
var walletOracle = new ethers.Wallet('0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f');      // 1
walletOracle.provider = provider;

// Account used by a doctor
var walletIssuer = new ethers.Wallet('0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1');      // 2
walletIssuer.provider = provider;

// Account used by a recipient
var walletRecipient = new ethers.Wallet('0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c');   // 3
walletRecipient.provider = provider;

// Account used by a pharmacist
var walletPharmacist = new ethers.Wallet('0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418');  // 4
walletPharmacist.provider = provider;

// Account used by an attacker
var walletUnknown = new ethers.Wallet('0x659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63');     // 5
walletUnknown.provider = provider;

/**
 * UTILS
 * @returns {{issuer: *, recipient: *, prescriptions: *[], validity: number}}
 */
function getValidOrderObject() {
    let order = {
        issuer: walletIssuer.address,
        recipient: walletRecipient.address,
        prescriptions: [['5-hydroxytryptamine', '1', 'mg'], ['4-(2-aminoéthyl)benzène-1,2-diol', '2', 'g']],
        validity: 0
    };

    // TODO: add _prescriptions to commitment (won't work with web3 sign)
    const commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [order.issuer, order.recipient, order.validity]);
    order.sigIssuer = web3.eth.sign(walletIssuer.address, commitment);
    order.sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
    return order;
}

/**
 * UNIT TESTS
 */
contract('SmartOrder', accounts => {
    describe('hooks', function () {

        /**
         * Clear event listeners between events.
         */
        let filters;
        beforeEach(function () {
            console.log('*************************************************************************************');
            filters = [];
        });

        afterEach(function () {
            if (filters) {
                console.log('clearing ' + filters.length + ' filters...');
                filters.forEach((filter) => {
                    filter.stopWatching();
                });
            }
        });

        /**
         * Check for contract deployment and subscribe to debug events.
         */
        let contract;
        it('should be deployed', next => {
            SmartOrder.deployed().then((instance) => {

                // Storing ethers interface for contract instance.
                contract = new ethers.Contract(instance.address, instance.abi, wallet);

                // Subscribing to its debug events.
                let height = web3.eth.getBlock('latest').number;
                let logStep = instance.LogStep({}, {fromBlock: height, toBlock: 'latest'});
                logStep.watch(function (err, data) {
                    console.log('LogStep : ' + data.args.msg);
                });

                next();
            });
        });


        /**
         *  Order Issuance Tests
         */
        it('should reject order issuance because of wrong issuer address', next => {
            SmartOrder.deployed().then(instance => {

                // Crafting parameters
                // Wrong issuer and good signature
                let order = getValidOrderObject();
                order.issuer = walletUnknown.address;

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions
                        .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                        .then(res => {
                            next(new Error('EVM did not revert..'));
                        })
                        .catch(err => {
                            next();
                        });
                });
            });
        });

        // TODO : wrong address format ?
        // https://www.dasp.co/#item-9

        it('should reject order issuance because of wrong issuer signature', next => {
            SmartOrder.deployed().then(instance => {

                // Crafting parameters
                // Signing commitment with wrong key
                let order = getValidOrderObject();
                const commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [order.issuer, order.recipient, order.validity]);
                order.sigIssuer = web3.eth.sign(walletUnknown.address, commitment);

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions
                        .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                        .then(res => {
                            next(new Error('EVM did not revert..'));
                        })
                        .catch(err => {
                            next();
                        });
                });
            });
        });

        it('should reject order issuance because of wrong recipient address', next => {
            SmartOrder.deployed().then(instance => {

                // Crafting parameters
                // Wrong issuer and good signature
                let order = getValidOrderObject();
                order.recipient = walletUnknown.address;

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions
                        .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                        .then(res => {
                            next(new Error('EVM did not revert..'));
                        })
                        .catch(err => {
                            next();
                        });
                });
            });
        });

        it('should reject order issuance because of wrong recipient signature', next => {
            SmartOrder.deployed().then(instance => {

                // Crafting parameters
                // Signing commitment with wrong key
                let order = getValidOrderObject();
                const commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [order.issuer, order.recipient, order.validity]);
                order.sigRecipient = web3.eth.sign(walletUnknown.address, commitment);

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions
                        .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                        .then(res => {
                            next(new Error('EVM did not revert..'));
                        })
                        .catch(err => {
                            next();
                        });
                });
            });
        });

        it('should reject order issuance without enough funding', next => {
            SmartOrder.deployed().then(instance => {

                // Calling contract function
                let order = getValidOrderObject();
                contract.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient)
                    .then(res => {
                        next(new Error('This transaction should have been rejected'));
                    })
                    .catch(err => {
                        next();
                    });
            });
        });

        it('should reject order issuance because issuer is unknown', next => {
            SmartOrder.deployed().then(instance => {

                // Subscribing to events
                let height = web3.eth.getBlock('latest').number;
                let logIssuanceQuery = instance.LogIssuanceQuery({}, {fromBlock: height, toBlock: 'latest'});
                logIssuanceQuery.watch(function (err, data) {
                    console.log('logIssuanceQuery : ' + data.args.queryId);

                    let logIssuance = instance.LogIssuance({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    let logFailedIssuance = instance.LogFailedIssuance({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    filters.push(logIssuanceQuery, logIssuance, logFailedIssuance);

                    logIssuance.watch(function (err, data) {
                        next(new Error('LogIssuance must not be called'));
                    });

                    logFailedIssuance.watch(function (err, data) {
                        next();
                    });
                });

                // Calling contract function
                let order = getValidOrderObject();
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions.issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()});
                });
            });
        });

        let _orderId;
        it('should issue an order', next => {
            SmartOrder.deployed().then(instance => {

                // Subscribing to events
                let height = web3.eth.getBlock('latest').number;
                let logIssuanceQuery = instance.LogIssuanceQuery({}, {fromBlock: height, toBlock: 'latest'});
                logIssuanceQuery.watch(function (err, data) {
                    console.log('logIssuanceQuery : ' + data.args.queryId);

                    let logIssuance = instance.LogIssuance({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    let logFailedIssuance = instance.LogFailedIssuance({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    filters.push(logIssuanceQuery, logIssuance, logFailedIssuance);

                    logIssuance.watch(function (err, data) {
                        // Remembering orderId for future test
                        _orderId = data.args.queryId;
                        console.log('LogIssuance : ' + _orderId);
                        next();
                    });

                    logFailedIssuance.watch(function (err, data) {
                        next(new Error('Log Failed issuance must not be called'));
                    });
                });

                // Preparing order issuance params & Calling contract function
                const order = getValidOrderObject();
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions.issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()});
                });
            });
        });


        /**
         * Delivery Tests
         */
        it('should accept a delivery', next => {
            SmartOrder.deployed().then(instance => {

                if (!_orderId) {
                    next(new Error('No existing orders..'));
                }

                // Subscribing to events
                let height = web3.eth.getBlock('latest').number;
                let logDeliveryQuery = instance.LogDeliveryQuery({orderId: _orderId}, {
                    fromBlock: height,
                    toBlock: 'latest'
                });

                logDeliveryQuery.watch(function (err, data) {
                    console.log('LogDeliveryQuery : ' + data.args.queryId);

                    let logDelivery = instance.LogDelivery({queryId: data.args.queryId}, {
                        fromBlock: height + 1,
                        toBlock: 'latest'
                    });

                    let logFailedDelivery = instance.LogFailedDelivery({queryId: data.args.queryId}, {
                        fromBlock: height + 1,
                        toBlock: 'latest'
                    });

                    filters.push(logDeliveryQuery, logDelivery, logFailedDelivery);

                    // Waiting for events from contract to end this test
                    let cpt = 0;
                    logDelivery.watch(function (err, data) {
                        console.log('LogDelivery : ' + data.args.queryId);
                        if (++cpt === _deltas.length) {
                            next();
                        }
                    });

                    logFailedDelivery.watch(function (err, data) {
                        next(new Error('Delivery should not fail'));
                    });
                });

                // Preparing order issuance params
                var commitment = ethers.utils.solidityKeccak256(['bytes32'], [_orderId]);
                var _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                var _deltas = [0, 2];

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions.deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()});
                });
            });
        });

        // it('should reject delivery ', next => {
        //
        // });


        /**
         * Oracle Tests
         */
        // it('should reject call of __callback from wrong msg.sender', next => {
        //
        // });

    });
});
