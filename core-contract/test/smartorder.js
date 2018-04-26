/**
 * WARNING !
 * Writing smart-contracts with Solidity is a tricky task.
 * Developers are invited to go and read https://www.dasp.co for an introduction on known vulnerabilities.
 * There is also a link to https://consensys.github.io/smart-contract-best-practices/ which is worth the read.
 */
const SmartOrder = artifacts.require("./SmartOrder.sol");

// Using ethers because web3.js doesn't support struct in function args.
// c.f: https://github.com/ethereum/web3.js/issues/1241
const ethers = require('ethers');


/**
 * GLOBAL VARS
 */
let web3Interface, ethersInterface;
const url = process.env.ETHEREUM_PROVIDER || "http://localhost:9545";
const provider = new ethers.providers.JsonRpcProvider(url);
const abiEncoder = new ethers.utils.AbiCoder;

// Account used for contract deployment (owner)
const walletOwner = new ethers.Wallet('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');       // 0
walletOwner.provider = provider;

// Account used by oraclize
const walletOracle = new ethers.Wallet('0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f');      // 1
walletOracle.provider = provider;

// Account used by a doctor
const walletIssuer = new ethers.Wallet('0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1');      // 2
walletIssuer.provider = provider;

// Account used by a recipient
const walletRecipient = new ethers.Wallet('0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c');   // 3
walletRecipient.provider = provider;

// Account used by a pharmacist
const walletPharmacist = new ethers.Wallet('0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418');  // 4
walletPharmacist.provider = provider;

// Account used by an attacker
const walletUnknown = new ethers.Wallet('0x659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63');     // 5
walletUnknown.provider = provider;

/**
 * This function calculates the signature of a smart-contract function
 * @param name of the contract function
 * @returns signature of the function
 */
function getFunctionSignature(name) {
    var json = web3Interface.abi.find(function(element) {
        return element.name === name;
    });

    var typeName = json.inputs.map(function (i) {
        return i.type;
    }).join(',');

    return web3.sha3(json.name + '(' + typeName + ')').slice(0, 10);
}

/**
 * This function 'calculate' the data (minus the signatures) encoded in a issueOrder transaction.
 * @param order
 * @returns commitment
 */
function getCommitment(order) {
    const sigFunction = getFunctionSignature('issueOrder');
    const dummy = web3.eth.sign(walletIssuer.address, 'dummy');
    const encodedParams = abiEncoder.encode(['address', 'address', 'string[][]', 'uint', 'bytes', 'bytes'], [order.issuer, order.recipient, order.prescriptions, order.validity, dummy, dummy]).slice(2);
    return (sigFunction + encodedParams).slice(0, -448);
}

/**
 * This function returns a valid Order object
 * @returns {{issuer: *, recipient: *, prescriptions: *[], validity: number}}
 */
function getValidOrderObject() {
    const order = {
        issuer: walletIssuer.address,
        recipient: walletRecipient.address,
        prescriptions: [['5-hydroxytryptamine', '1', 'mg', '3/dx5'], ['4-(2-aminoéthyl)benzène-1,2-diol', '2', 'g', '1/dx3m']],
        validity: 0
    };

    // Signature is done on transaction data (minus signatures), in order to avoid current libraries limitations regarding
    // hashing of multidimensional arrays.
    const commitment = getCommitment(order);
    const fingerprint = ethers.utils.solidityKeccak256(['bytes'], [commitment]);
    order.sigIssuer = web3.eth.sign(walletIssuer.address, fingerprint);
    order.sigRecipient = web3.eth.sign(walletRecipient.address, fingerprint);
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
                filters.forEach(filter => {
                    filter.stopWatching();
                });
            }
        });

        /**
         * Check for contract deployment and subscribe to debug events.
         */
        it('should be deployed', next => {
            SmartOrder.deployed().then(instance => {

                // Storing ethers & web3js interfaces for contract instance.
                web3Interface = instance;
                ethersInterface = new ethers.Contract(instance.address, instance.abi, walletOwner);

                // Subscribing to its debug events.
                const height = web3.eth.getBlock('latest').number;
                const logStep = web3Interface.LogStep({}, {fromBlock: height, toBlock: 'latest'});
                logStep.watch(function (err, data) {
                    console.log('LogStep : ' + data.args.msg);
                });

                next();
            });
        });


        /**
         *  Order Issuance Tests
         */
        it('should reject issuance with wrong issuer address', next => {

            // Crafting parameters
            // Wrong issuer and good signature
            const order = getValidOrderObject();
            order.issuer = walletUnknown.address;

            // Calling contract function
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                    .then(res => next(new Error('EVM did not revert..')))
                    .catch(err => next());
            });
        });

        // TODO : wrong address format ?
        // https://www.dasp.co/#item-9
        it('should reject issuance with wrong issuer signature', next => {

            // Signing commitment with wrong key
            const order = getValidOrderObject();
            const commitment = getCommitment(order);
            const fingerprint = ethers.utils.solidityKeccak256(['bytes'], [commitment]);
            order.sigIssuer = web3.eth.sign(walletUnknown.address, fingerprint);

            // Calling contract function
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                    .then(res => next(new Error('EVM did not revert..')))
                    .catch(err => next());
            });
        });

        it('should reject issuance with wrong recipient address', next => {

            // Wrong issuer and good signature
            const order = getValidOrderObject();
            order.recipient = walletUnknown.address;

            // Calling contract function
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                    .then(res => next(new Error('EVM did not revert..')))
                    .catch(err => next());
            });
        });

        it('should reject issuance with wrong recipient signature', next => {

            // Signing commitment with wrong key
            const order = getValidOrderObject();
            const commitment = getCommitment(order);
            const fingerprint = ethers.utils.solidityKeccak256(['bytes'], [commitment]);
            order.sigRecipient = web3.eth.sign(walletUnknown.address, fingerprint);

            // Calling contract function
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                    .then(res => next(new Error('EVM did not revert..')))
                    .catch(err => next());
            });
        });

        it('should reject issuance without enough funding', next => {

            // Calling contract function
            const order = getValidOrderObject();
            ethersInterface.functions
                .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient)
                .then(res => next(new Error('This transaction should have been rejected')))
                .catch(err => next());
        });

        it('should reject issuance because issuer is unknown', next => {

            // Subscribing to events
            const height = web3.eth.getBlock('latest').number;
            const logIssuanceQuery = web3Interface.LogIssuanceQuery({}, {fromBlock: height, toBlock: 'latest'});
            logIssuanceQuery.watch(function (err, data) {
                console.log('logIssuanceQuery : ' + data.args.queryId);

                const logIssuance = web3Interface.LogIssuance({queryId: data.args.queryId}, {
                    fromBlock: height,
                    toBlock: 'latest'
                });

                const logFailedIssuance = web3Interface.LogFailedIssuance({queryId: data.args.queryId}, {
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
            const order = getValidOrderObject();
            order.issuer = walletUnknown.address;

            // Refreshing commitment fingerprint & signatures
            const commitment = getCommitment(order);
            const fingerprint = ethers.utils.solidityKeccak256(['bytes'], [commitment]);
            order.sigIssuer = web3.eth.sign(walletUnknown.address, fingerprint);
            order.sigRecipient = web3.eth.sign(walletRecipient.address, fingerprint);

            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions.issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()});
            });
        });

        let _orderId;
        it('should issue an order', next => {

            // Subscribing to events
            const height = web3.eth.getBlock('latest').number;
            const logIssuanceQuery = web3Interface.LogIssuanceQuery({}, {fromBlock: height, toBlock: 'latest'});
            logIssuanceQuery.watch(function (err, data) {
                console.log('logIssuanceQuery : ' + data.args.queryId);

                const logIssuance = web3Interface.LogIssuance({queryId: data.args.queryId}, {
                    fromBlock: height,
                    toBlock: 'latest'
                });

                const logFailedIssuance = web3Interface.LogFailedIssuance({queryId: data.args.queryId}, {
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
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions.issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()});
            });
        });

        it('should reject issuance because of transaction data replay', next => {
            const order = getValidOrderObject();
            web3Interface.getOracleQueryPrice.call("URL").then(value => {
                ethersInterface.functions
                    .issueOrder(order.issuer, order.recipient, order.prescriptions, order.validity, order.sigIssuer, order.sigRecipient, {value: value.add(1).toNumber()})
                    .then(res => next(new Error('This transaction should have been rejected')))
                    .catch(err => next());
            });
        });


        /**
         * Delivery Tests
         */
        it('should reject delivery with wrong order version commitment', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            // Retrieving current order version
            ethersInterface.functions.getOrder(_orderId).then(order => {

                // Preparing order issuance params with wrong version
                const commitment = ethers.utils.solidityKeccak256(['bytes32', 'uint8'], [_orderId, order.version - 1]);
                const _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                const _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                const _deltas = [1, 1];

                // Calling contract function
                web3Interface.getOracleQueryPrice.call("URL").then(value => {
                    ethersInterface.functions
                        .deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()})
                        .then(res => next(new Error('This transaction should have been rejected')))
                        .catch(err => next());
                });
            })
        });

        it('should reject delivery with wrong recipient signature', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            // Get current order for version
            ethersInterface.functions.getOrder(_orderId).then(order => {

                // Preparing order issuance params
                const commitment = ethers.utils.solidityKeccak256(['bytes32', 'uint8'], [_orderId, order.version]);
                const _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                const _sigRecipient = web3.eth.sign(walletUnknown.address, commitment);
                const _deltas = [1, 1];

                // Calling contract function
                web3Interface.getOracleQueryPrice.call("URL").then(value => {
                    ethersInterface.functions
                        .deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()})
                        .then(res => next(new Error('This transaction should have been rejected')))
                        .catch(err => next());
                });
            });
        });

        it('should reject delivery issuance without enough funding', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            // Get current order for version
            ethersInterface.functions.getOrder(_orderId).then(order => {

                // Preparing order issuance params
                const commitment = ethers.utils.solidityKeccak256(['bytes32', 'uint8'], [_orderId, order.version]);
                const _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                const _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                const _deltas = [1, 1];

                // Calling contract function
                ethersInterface.functions
                    .deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas)
                    .then(res => next(new Error('This transaction should have been rejected')))
                    .catch(err => next());
            });
        });

        it('should reject delivery because pharmacist is unknown', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            // Get current version for Order
            ethersInterface.functions.getOrder(_orderId).then(order => {

                // Preparing order issuance params
                const commitment = ethers.utils.solidityKeccak256(['bytes32', 'uint8'], [_orderId, 2]);
                const _sigPharmacist = web3.eth.sign(walletUnknown.address, commitment);
                const _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                const _deltas = [2, 0];

                // Subscribing to events
                const height = web3.eth.getBlock('latest').number;
                const logDeliveryQuery = web3Interface.LogDeliveryQuery({orderId: _orderId}, {
                    fromBlock: height,
                    toBlock: 'latest'
                });

                logDeliveryQuery.watch(function (err, data) {
                    console.log('LogDeliveryQuery : ' + data.args.queryId);

                    const logDelivery = web3Interface.LogDelivery({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    const logFailedDelivery = web3Interface.LogFailedDelivery({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    filters.push(logDeliveryQuery, logDelivery, logFailedDelivery);

                    // Waiting for events from contract to end this test
                    logDelivery.watch(function (err, data) {
                        next(new Error('LogDelivery should not be called'));
                    });

                    logFailedDelivery.watch(function (err, data) {
                        next();
                    });
                });

                // Calling contract function
                web3Interface.getOracleQueryPrice.call("URL").then(value => {
                    ethersInterface.functions.deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()});
                });

            });
        });

        it('should accept a delivery', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            // Get current version for Order
            ethersInterface.functions.getOrder(_orderId).then(order => {

                // Preparing order issuance params
                const commitment = ethers.utils.solidityKeccak256(['bytes32', 'uint8'], [_orderId, order.version]);
                const _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                const _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                const _deltas = [0, 2];

                // Subscribing to events
                const height = web3.eth.getBlock('latest').number;
                const logDeliveryQuery = web3Interface.LogDeliveryQuery({orderId: _orderId}, {
                    fromBlock: height,
                    toBlock: 'latest'
                });

                // DeliveryQuery event callback
                logDeliveryQuery.watch(function (err, data) {
                    console.log('LogDeliveryQuery : ' + data.args.queryId);

                    // Subscribing to query results events
                    const logDelivery = web3Interface.LogDelivery({queryId: data.args.queryId}, {
                        fromBlock: height,
                        toBlock: 'latest'
                    });

                    const logFailedDelivery = web3Interface.LogFailedDelivery({queryId: data.args.queryId}, {
                        fromBlock: height,
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

                // Calling contract function
                web3Interface.getOracleQueryPrice.call("URL").then(value => {
                    ethersInterface.functions.deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()});
                });
            });
        });


        /**
         * Oracle Tests
         */
        it('should reject call of __callback from wrong msg.sender', next => {

            if (!_orderId) {
                next(new Error('No existing orders..'));
            }

            ethersInterface.estimate.__callback(_orderId, "1").then(value => {
                const tmpInterface = new ethers.Contract(web3Interface.address, web3Interface.abi, walletUnknown);
                tmpInterface.functions.__callback(_orderId, "1", {value: value.add(1).toNumber()})
                    .then(res => next(new Error('This transaction should have been rejected')))
                    .catch(err => next());
            });
        });

    });
});
