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

    it("should be deployed", () => {
        return SmartOrder.deployed().then(function (instance) {
            instance.LogIssuanceQuery().watch(function(err, data) {
                console.log("LogIssuanceQuery");
                console.log(data.args);
            });

            instance.LogIssuance().watch(function(err, data) {
                console.log("LogIssuance");
                console.log(data.args);
            });

            instance.LogFailedIssuance().watch(function(err, data) {
                console.log("LogFailedIssuance");
                console.log(data.args);
            });
        });
    });

    it("should issue an order query", () => {
        return SmartOrder.deployed().then(instance => {
            return new ethers.Contract(instance.address, instance.abi, wallet);
        }).then(contract => {
            var _issuer = walletIssuer.address;
            var _recipient = walletRecipient.address;
            var _prescriptions = [["5-hydroxytryptamine", "1", "mg"], ["4-(2-aminoéthyl)benzène-1,2-diol", "2", "g"]];
            var _validity = 0;

            // TODO: add _prescriptions to commitment (won't work with web3 sign) 
            var commitment = ethers.utils.solidityKeccak256(['address', 'address', 'uint'], [walletIssuer.address, walletRecipient.address, _validity]);
            var _sigIssuer = web3.eth.sign(walletIssuer.address, commitment);
            var _sigRecipient = web3.eth.sign(walletRecipient.address, commitment);

            return contract.functions.issueOrder(_issuer, _recipient, _prescriptions, _validity,  _sigIssuer,  _sigRecipient, {value: 10000});
        });
    });

});
