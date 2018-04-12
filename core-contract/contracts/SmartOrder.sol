pragma experimental ABIEncoderV2 ;
pragma solidity ^0.4.21;

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

    event LogDeliveryQuery(bytes32 indexed orderId, bytes32 indexed queryId, uint block, address pharmacist, uint8 version);
    event LogFailedDelivery(bytes32 indexed queryId, uint block);
    event LogDelivery(bytes32 indexed queryId, uint block, uint8 index, uint amount);

    event LogStep(string msg);


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
        uint8 version;
    }

    struct Delivery {
        bool pending;
        bytes32 orderId;
        uint[] deltas;
    }


    // Attributes
    // *****************************************************************************************************************
    mapping(bytes32 => Order) private orders;
    mapping(bytes32 => Delivery) private deliveries;


    // Functions
    // *****************************************************************************************************************
    function issueOrder(address _issuer, address _recipient, string[][] _prescriptions, uint _validity, bytes _sigIssuer, bytes _sigRecipient)
    payable public whenNotPaused {

        // TODO: add gas cost ?
        require(oraclize_getPrice("URL") < msg.value);

        // Let's verify the hash & signatures
        // TODO: add _prescriptions to commitment
        // TODO: add issuance validity in commitment to avoid data replayability ?
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_issuer, _recipient, _validity));
        require(ECRecovery.recover(commitment, _sigIssuer) == _issuer);
        require(ECRecovery.recover(commitment, _sigRecipient) == _recipient);

        // Send authentication request to Oracle
        // bytes32 queryId = oraclize_query(10, "URL", "json(http://localhost:8081/v1/doctor/validate).response", getOracleURLQueryParam(_issuer));
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

        emit LogIssuanceQuery(queryId, block.number);
    }

    function deliver(bytes32 _orderId, bytes _sigPharmacist, bytes _sigRecipient, uint[] _deltas)
    payable external whenNotPaused {

        // TODO: add gas cost ?
        require(oraclize_getPrice("URL") < msg.value);

        require(orders[_orderId].version > 1);
        require(orders[_orderId].validity == 0 || block.number <= SafeMath.add(orders[_orderId].createdAt, orders[_orderId].validity));
        require(_deltas.length > 0 && _deltas.length <= orders[_orderId].prescriptions.length);

        // Let's check for recipient agreement
        // TODO: add _deltas & version to commitment
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_orderId));
        require(ECRecovery.recover(commitment, _sigRecipient) == orders[_orderId].recipient);

        address adrPharmacist = ECRecovery.recover(commitment, _sigPharmacist);
        prepareDelivery(_orderId, adrPharmacist, _deltas);
    }

    function prepareDelivery(bytes32 _orderId, address _adrPharmacist, uint[] _deltas)
    internal {

        // Bump order.version to update future commitment hash
        orders[_orderId].version += 1;

        // Send authentication request to Oracle
        // bytes32 queryId = oraclize_query(10, "URL", "json(http://localhost:8081/v1/pharmacist/validate).response", getOracleURLQueryParam(_adrPharmacist));
        bytes32 queryId = oraclize_query(10, "URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHUSD).result.XETHZUSD.c.0");

        // Storing delivery
        deliveries[queryId].orderId = _orderId;
        deliveries[queryId].deltas = _deltas;
        deliveries[queryId].pending = true;

        // Log delivery query
        emit LogDeliveryQuery(_orderId, queryId, block.number, _adrPharmacist, orders[_orderId].version);
    }

    function __callback(bytes32 _oraclizeID, string _result)
    public whenNotPaused {

        require(msg.sender == oraclize_cbAddress());

        // Order issuance callback
        if (orders[_oraclizeID].version == 1) {
            if (parseInt(_result) == 0) {
                delete orders[_oraclizeID];
                emit LogFailedIssuance(_oraclizeID, block.number);
            }
            else {
                orders[_oraclizeID].version = 2;
                orders[_oraclizeID].createdAt = block.number;
                emit LogIssuance(_oraclizeID, block.number, orders[_oraclizeID].issuer, orders[_oraclizeID].recipient);
            }
        }

        // Delivery callback
        else {

            // Mutext to avoid callback reentrance
            if (deliveries[_oraclizeID].pending == true) {
                deliveries[_oraclizeID].pending = false;

                // Known pharmacist => update order data
                if (parseInt(_result) > 0) {

                    bytes32 orderId = deliveries[_oraclizeID].orderId;
                    orders[orderId].version += 1;
                    for (uint8 index = 0; index < deliveries[_oraclizeID].deltas.length; index++) {
                        uint requested = deliveries[_oraclizeID].deltas[index];
                        if (requested > orders[orderId].prescriptions[index].amount) {
                            requested = orders[orderId].prescriptions[index].amount;
                        }
                        orders[orderId].prescriptions[index].amount = SafeMath.sub(orders[orderId].prescriptions[index].amount, requested);
                        emit LogDelivery(_oraclizeID, block.number, index, requested);
                    }
                }

                // Unkown pharmacist => Access should not be granted
                else {
                    emit LogFailedDelivery(_oraclizeID, block.number);
                }

                delete deliveries[_oraclizeID];
            }
        }
    }

    // Misc
    // *****************************************************************************************************************
    function toString(address _adr)
    internal pure returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(_adr) / (2 ** (8 * (19 - i)))));
        return string(b);
    }

    function getOracleURLQueryParam(address _pubkey)
    internal pure returns (string) {
        return strConcat('{"pubKey":"', toString(_pubkey), '"}');
    }

    function getOracleQueryPrice(string _type)
    external returns (uint) {
        return oraclize_getPrice(_type);
    }

    function addFunding()
    external payable whenNotPaused {
        emit LogFunding(block.number, msg.sender, msg.value);
    }

    function()
    public {
        emit LogFailback(block.number, msg.sender);
    }

    function SmartOrder()
    public {

        // TODO: https://docs.oraclize.it/#ethereum-quick-start-custom-gas-limit-and-gas-price
        // WARNING: uncommenting oraclize_setCustomGasPrice freezes contract compilation
        // oraclize_setCustomGasPrice(4000000000 wei);

        emit LogConstructor(block.number, owner);
    }
}