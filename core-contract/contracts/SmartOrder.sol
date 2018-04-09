pragma experimental ABIEncoderV2 ;
pragma solidity ^0.4.19;

// Libraries
import "../node_modules/zeppelin-solidity/contracts/ECRecovery.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";

// Contracts
import "../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./usingOraclize.sol";

contract SmartOrder is Ownable, Pausable, usingOraclize {

    // Events
    // *****************************************************************************************************************
    event LogConstructor(uint block, address owner);
    event LogFailback(uint block, address sender);
    event LogFunding(uint block, address sender, uint value);

    event LogIssuanceQuery(bytes32 indexed queryId, uint block);
    event LogFailedIssuance(bytes32 indexed queryId, uint block);
    event LogIssuance(bytes32 indexed queryId, uint block, address indexed issuer, address indexed recipient);

    event LogDeliveryQuery(bytes32 indexed queryId, uint block, address pharmacist, uint8 version);
    event LogFailedDelivery(bytes32 indexed queryId, uint block);
    event LogDelivery(bytes32 indexed queryId, uint block, uint8 index, uint amount);


    // Structs
    // *****************************************************************************************************************
    struct Prescription {
        string designation;
        uint amount;
        string unit;
    }

    struct Order {
        uint createdAt;
        uint validity;
        address issuer;
        address recipient;
        Prescription[] prescriptions;
        // Delivery[] deliveries;
        uint8 version;
    }

    struct Delivery {
        bool processing;
        uint[] deltas;
    }


    // Attributes
    // *****************************************************************************************************************
    mapping(bytes32 => Order) private orders;


    // Functions
    // *****************************************************************************************************************
    function issueOrder(address _issuer, address _recipient, string[][] _prescriptions, uint _validity, bytes _sigIssuer, bytes _sigRecipient)
    payable public whenNotPaused {

        require(oraclize_getPrice("URL") < msg.value);

        // Let's verify the hash & signatures
        // TODO: add _prescriptions to commitment
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_issuer, _recipient, _validity));
        require(ECRecovery.recover(commitment, _sigIssuer) == _issuer);
        require(ECRecovery.recover(commitment, _sigRecipient) == _recipient);

        // Send authentication request to Oracle
        // bytes32 queryId = oraclize_query(10, "URL", "http://localhost:8080/v1/doctor/validate", strConcat("{ pubkey: ", toString(_issuer), " }"));
        bytes32 queryId = oraclize_query(10, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0");

        // Storing Order
        // Version is set to 1 to distinguish from empty in orders mapping.
        orders[queryId].version = 1;
        orders[queryId].validity = _validity;
        orders[queryId].issuer = _issuer;
        orders[queryId].recipient = _recipient;
        for (uint i = 0; i < _prescriptions.length; i++) {
            Prescription memory prescription;
            prescription.designation = _prescriptions[i][0];
            prescription.amount = parseInt(_prescriptions[i][1]);
            prescription.unit = _prescriptions[i][2];
            orders[queryId].prescriptions.push(prescription);
        }

        LogIssuanceQuery(queryId, block.number);
    }

    function smartOrder_getPrice() returns (uint) {
        return oraclize_getPrice("URL");
    }

    function deliver(bytes32 _id, bytes _sigPharmacist, bytes _sigRecipient, uint[] _deltas)
    payable external whenNotPaused {

        // TODO: add gas cost ?
        require(oraclize_getPrice("URL") < msg.value);
        require(orders[_id].version >= 2);
        require(orders[_id].validity == 0 || block.number <= SafeMath.add(orders[_id].createdAt, orders[_id].validity));
        require(_deltas.length > 0 && _deltas.length <= orders[_id].prescriptions.length);

        // Let's check for recipient agreement
        // TODO: add version & _deltas to commitment
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_id, _sigPharmacist, _sigRecipient));
        require(ECRecovery.recover(commitment, _sigRecipient) == orders[_id].recipient);

        // Send authentication request to Oracle
        address adrPharmacist = ECRecovery.recover(commitment, _sigPharmacist);
        bytes32 queryId = oraclize_query(10, "URL", "json(http://localhost:8080/v1/pharmacist/validate).response", strConcat("{ pubkey: ", toString(adrPharmacist), " }"));

        // TODO: Storing Delivery request

        LogDeliveryQuery(queryId, block.number, adrPharmacist, orders[_id].version);

        // Bump order.version to update commitment hash
        orders[_id].version += 1;
    }

    function __callback(bytes32 _oraclizeID, string _result)
    public {

        require(msg.sender == oraclize_cbAddress());

        // Order issuance callback
        if (orders[_oraclizeID].version == 1) {
            if (parseInt(_result) > 1) {
                orders[_oraclizeID].version = 2;
                orders[_oraclizeID].createdAt = block.number;
                LogIssuance(_oraclizeID, block.number, orders[_oraclizeID].issuer, orders[_oraclizeID].recipient);
            }
            else {
                delete orders[_oraclizeID];
                LogFailedIssuance(_oraclizeID, block.number);
            }
        }

        // // Delivery callback
        // else {
        //     // TODO: check if a delivery request is pending
        //     // problem : how to retrieve order key ??
        //     // sol : api returns the key instead of a boolean if ok, and returns an invalid key if ko ?

        //     if (parseInt(_result) == 1) {
        //         // Let's try to update order data
        //         //                for (uint8 index = 0; index < orders[oraclizeID].data.length; index++) {
        //         //                    uint requested = _oracleQueries[oraclizeID].data[index];
        //         //                if (requested > _prescriptions[index].amount) {
        //         //                    requested = _prescriptions[index].amount;
        //         //                }
        //         //                _prescriptions[index].amount = SafeMath.sub(_prescriptions[index].amount, requested);
        //         //                     LogDelivery(oraclizeID, block.number, index, requested);
        //         //                }

        //     }
        //     else {
        //         //                 LogFailedDelivery(_oraclizeID, block.number);
        //     }

        //     //            delete deliveries[_oraclizeID];
        // }
    }

    // Misc
    // *****************************************************************************************************************
    function toString(address x)
    internal pure returns (string) {

        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2 ** (8 * (19 - i)))));
        return string(b);
    }

    function addFunding()
    external payable whenNotPaused {

        LogFunding(block.number, msg.sender, msg.value);
    }

    function()
    public {

        LogFailback(block.number, msg.sender);
    }

    function SmartOrder()
    public {
        OAR = OraclizeAddrResolverI(0x6f485c8bf6fc43ea212e93bbf8ce046c7f1cb475);

        // TODO: https://docs.oraclize.it/#ethereum-quick-start-custom-gas-limit-and-gas-price
        // WARNING: uncommenting oraclize_setCustomGasPrice freezes contract compilation
        // oraclize_setCustomGasPrice(4000000000 wei);

        LogConstructor(block.number, owner);
    }
}