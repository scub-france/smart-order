var SmartOrder = artifacts.require("./SmartOrder.sol");

// Using ethers because web3.js doesn't support struct in function args.
// c.f: https://github.com/ethereum/web3.js/issues/1241
var ethers = require('ethers');

// Using 1st account of truffle develop
var wallet = new ethers.Wallet('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');

let ethereum_provider;
if (process.env.ETHEREUM_PROVIDER) {
    ethereum_provider = process.env.ETHEREUM_PROVIDER;
} else {
    ethereum_provider = "http://localhost:9545";
}
var provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER);
wallet.provider = provider;

var walletIssuer = new ethers.Wallet('0x0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1');      // 2
walletIssuer.provider = provider;

var walletRecipient = new ethers.Wallet('0xc88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c');   // 3
walletRecipient.provider = provider;

var walletPharmacist = new ethers.Wallet('0x388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418');  // 4
walletPharmacist.provider = provider;


contract('SmartOrder', accounts => {

    describe('hooks', function () {

        let filters;
        afterEach(function () {
            if (filters) {
                console.log('clearing ' + filters.length + ' filters...');
                filters.forEach((filter) => {
                    filter.stopWatching();
                });
            }
        });

        it('should be deployed', (done) => {
            filters = [];
            SmartOrder.deployed().then((instance) => {
                let height = web3.eth.getBlock('latest').number;
                let logStep = instance.LogStep({}, {fromBlock: height, toBlock: 'latest'});
                logStep.watch(function (err, data) {
                    console.log('LogStep : ' + data.args.msg);
                });
                done();
            });
        });

        let _orderId;
        it('should create an order', (done) => {
            filters = [];
            SmartOrder.deployed().then(instance => {
                let contract = new ethers.Contract(instance.address, instance.abi, wallet);
                let height = web3.eth.getBlock('latest').number;

                // Subscribing to events
                let logIssuanceQuery = instance.LogIssuanceQuery({}, {fromBlock: height, toBlock: 'latest'});
                let logIssuance = instance.LogIssuance({}, {fromBlock: height, toBlock: 'latest'});
                let logFailedIssuance = instance.LogFailedIssuance({}, {fromBlock: height, toBlock: 'latest'});
                filters.push(logIssuanceQuery, logIssuance, logFailedIssuance);

                // Preparing order issuance params
                var _issuer = walletIssuer.address;
                var _recipient = walletRecipient.address;
                var _prescriptions = [['5-hydroxytryptamine', '1', 'mg'], ['4-(2-aminoéthyl)benzène-1,2-diol', '2', 'g']];
                var _validity = 0;

                // TODO: add _prescriptions to commitment (won't work with web3 sign)
                var commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [walletIssuer.address, walletRecipient.address, _validity]);
                var _sigIssuer = web3.eth.sign(walletIssuer.address, commitment);
                var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions.issueOrder(_issuer, _recipient, _prescriptions, _validity, _sigIssuer, _sigRecipient, {value: value.add(1).toNumber()});
                });

                // Waiting for events from contract to end this test
                logIssuanceQuery.watch(function (err, data) {
                    console.log('LogIssuanceQuery : ' + data.args.queryId);
                    logIssuance.watch(function (err, data) {
                        console.log('LogIssuance : ' + data.args.queryId);

                        // Remembering orderId for future test
                        _orderId = data.args.queryId;
                        done();
                    });
                });

                logFailedIssuance.watch(function (err, data) {
                    console.log('LogFailedIssuance : ' + data.args.queryId);
                    done(new Error('Log Failed issuance must not be called'));
                });
            });
        });

        it('should make a delivery', (done) => {
            filters = [];

            if (!_orderId) {
                done(new Error('No existing orders..'));
            }

            SmartOrder.deployed().then(instance => {
                let contract = new ethers.Contract(instance.address, instance.abi, wallet);
                let height = web3.eth.getBlock('latest').number;

                // Subscribing to events
                let logDeliveryQuery = instance.LogDeliveryQuery({}, {fromBlock: height, toBlock: 'latest'});
                let logDelivery = instance.LogDelivery({}, {fromBlock: height, toBlock: 'latest'});
                let logFailedDelivery = instance.LogFailedDelivery({}, {fromBlock: height, toBlock: 'latest'});
                filters.push(logDeliveryQuery, logDelivery, logFailedDelivery);

                // Preparing order issuance params
                var commitment = ethers.utils.solidityKeccak256(['bytes32'], [_orderId]);
                var _sigPharmacist = web3.eth.sign(walletPharmacist.address, commitment);
                var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);
                var _deltas = [0, 2];

                // Calling contract function
                instance.getOracleQueryPrice.call("URL").then((value) => {
                    contract.functions.deliver(_orderId, _sigPharmacist, _sigRecipient, _deltas, {value: value.add(1).toNumber()});
                });

                // Waiting for events from contract to end this test
                logDeliveryQuery.watch(function (err, data) {
                    console.log('LogDeliveryQuery : ' + data.args.queryId);
                    let cpt = 0;
                    logDelivery.watch(function (err, data) {
                        console.log('LogDelivery : ' + data.args.queryId);
                        if(++cpt === _deltas.length) {
                            done();
                        }
                    });
                });
            });
        });

    });
});
