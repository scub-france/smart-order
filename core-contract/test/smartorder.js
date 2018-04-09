var SmartOrder = artifacts.require("./SmartOrder.sol");

// Using ethers because web3.js doesn't support struct in function args.
// c.f: https://github.com/ethereum/web3.js/issues/1241
var ethers = require('ethers');

// Using 1st account of truffle develop
var wallet = new ethers.Wallet('0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
var provider = new ethers.providers.JsonRpcProvider("http://localhost:9545");
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

            SmartOrder.deployed().then(() => {
                done();
            });
        });

        it('should issue an order query', (done) => {
            filters = [];

            SmartOrder.deployed().then(instance => {
                let contract = new ethers.Contract(instance.address, instance.abi, wallet);
                var _issuer = walletIssuer.address;
                var _recipient = walletRecipient.address;
                var _prescriptions = [['5-hydroxytryptamine', '1', 'mg'], ['4-(2-aminoéthyl)benzène-1,2-diol', '2', 'g']];
                var _validity = 0;

                // TODO: add _prescriptions to commitment (won't work with web3 sign)
                var commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [walletIssuer.address, walletRecipient.address, _validity]);
                var _sigIssuer = web3.eth.sign(walletIssuer.address, commitment);
                var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);

                instance.smartOrder_getPrice.call().then((value) => {
                    contract.functions.issueOrder(_issuer, _recipient, _prescriptions, _validity, _sigIssuer, _sigRecipient, {value: value.add(1).toNumber()});
                });

                let logIssuanceQuery = instance.LogIssuanceQuery();
                let logIssuance = instance.LogIssuance();
                let logFailedIssuance = instance.LogFailedIssuance();
                filters.push(logIssuanceQuery, logIssuance, logFailedIssuance);

                logIssuanceQuery.watch(function (err, data) {
                    console.log('LogIssuanceQuery : ' + data.args.queryId);
                    logIssuance.watch(function (err, data) {
                        console.log('LogIssuance : ' + data.args.queryId);
                        done();
                    });
                });

                logFailedIssuance.watch(function (err, data) {
                    console.log('LogFailedIssuance : ' + data.args.queryId);
                    done(new Error('Log Failed issuance must not be called'));
                });

            });
        });


        it('should issue an order query', (done) => {
            filters = [];

            SmartOrder.deployed().then(instance => {
                let contract = new ethers.Contract(instance.address, instance.abi, wallet);
                var _issuer = walletIssuer.address;
                var _recipient = walletRecipient.address;
                var _prescriptions = [['5-hydroxytryptamine', '1', 'mg'], ['4-(2-aminoéthyl)benzène-1,2-diol', '2', 'g']];
                var _validity = 0;

                // TODO: add _prescriptions to commitment (won't work with web3 sign)
                var commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [walletIssuer.address, walletRecipient.address, _validity]);
                var _sigIssuer = web3.eth.sign(walletIssuer.address, commitment);
                var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);

                instance.smartOrder_getPrice.call().then((value) => {
                    contract.functions.issueOrder(_issuer, _recipient, _prescriptions, _validity, _sigIssuer, _sigRecipient, {value: value.add(1).toNumber()});
                });

                let logIssuanceQuery = instance.LogIssuanceQuery();
                let logIssuance = instance.LogIssuance();
                let logFailedIssuance = instance.LogFailedIssuance();
                filters.push(logIssuanceQuery, logIssuance, logFailedIssuance);

                logIssuanceQuery.watch(function (err, data) {
                    console.log('LogIssuanceQuery : ' + data.args.queryId);
                    logIssuance.watch(function (err, data) {
                        console.log('LogIssuance : ' + data.args.queryId);
                        done();
                    });
                });

                logFailedIssuance.watch(function (err, data) {
                    console.log('LogFailedIssuance : ' + data.args.queryId);
                    done(new Error('Log Failed issuance must not be called'));
                });

            });
        });

    });

});
