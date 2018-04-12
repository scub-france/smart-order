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

    event LogDeliveryQuery(bytes32 indexed orderId, bytes32 indexed queryId, uint block, address pharmacist); //  , uint8 version
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
        uint8 version;
    }

    struct Delivery {
        bool processing;
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
        bytes32 queryId = oraclize_query(10, "URL", "json(http://localhost:8081/v1/doctor/validate).response", getOracleURLQueryParam(_issuer));

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

    function deliver(bytes32 _orderId, bytes _sigPharmacist, bytes _sigRecipient, uint[] _deltas)
    payable external whenNotPaused {

        // TODO: add gas cost ?
        require(oraclize_getPrice("URL") < msg.value);

        require(orders[_orderId].version > 1);
        require(orders[_orderId].validity == 0 || block.number <= SafeMath.add(orders[_orderId].createdAt, orders[_orderId].validity));
        require(_deltas.length > 0 && _deltas.length <= orders[_orderId].prescriptions.length);

        // Let's check for recipient agreement
        // TODO: add _deltas & version to commitment
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_orderId, _sigPharmacist, _sigRecipient));
        require(ECRecovery.recover(commitment, _sigRecipient) == orders[_orderId].recipient);

        // Bump order.version to update future commitment hash
        orders[_orderId].version += 1;

        // Send authentication request to Oracle
        address adrPharmacist = ECRecovery.recover(commitment, _sigPharmacist);
        bytes32 queryId = oraclize_query(10, "URL", "json(http://localhost:8081/v1/pharmacist/validate).response", getOracleURLQueryParam(adrPharmacist));

        // Storing delivery
        Delivery memory delivery;
        delivery.processing = false;
        delivery.deltas = _deltas;

        // TODO: add order version to log
        LogDeliveryQuery(_orderId, queryId, block.number, adrPharmacist); // orders[_orderId].version
    }

    function __callback(bytes32 _oraclizeID, string _result)
    public whenNotPaused {

        require(msg.sender == oraclize_cbAddress());

        // Order issuance callback
        if (orders[_oraclizeID].version == 1) {
            if (parseInt(_result) > 0) {
                orders[_oraclizeID].version = 2;
                orders[_oraclizeID].createdAt = block.number;
                LogIssuance(_oraclizeID, block.number, orders[_oraclizeID].issuer, orders[_oraclizeID].recipient);
            }
            else {
                delete orders[_oraclizeID];
                LogFailedIssuance(_oraclizeID, block.number);
            }
        }

        // Delivery callback
        else {

            // Mutext to avoid callback reentrance
            if(deliveries[_oraclizeID].processing == false) {
                deliveries[_oraclizeID].processing = true;

                // Unkown pharmacist => Access should not be granted
                if(parseInt(_result) == 0) {
                    LogFailedDelivery(_oraclizeID, block.number);
                }

                // Known pharmacist => update order data
                else {
                    bytes32 orderId = stringToBytes32(_result);
                    orders[orderId].version += 1;
                    for (uint8 index = 0; index < deliveries[_oraclizeID].deltas.length; index++) {
                        uint requested = deliveries[_oraclizeID].deltas[index];
                        if (requested > orders[orderId].prescriptions[index].amount) {
                            requested = orders[orderId].prescriptions[index].amount;
                        }
                        orders[orderId].prescriptions[index].amount = SafeMath.sub(orders[orderId].prescriptions[index].amount, requested);
                        LogDelivery(_oraclizeID, block.number, index, requested);
                    }
                }

                delete deliveries[_oraclizeID];
            }
        }
    }

    // Misc
    // *****************************************************************************************************************
    function stringToBytes32(string memory source)
    internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function toString(address adr)
    internal pure returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(adr) / (2 ** (8 * (19 - i)))));
        return string(b);
    }

    function getOracleURLQueryParam(address pubkey)
    internal returns (string) {
        return strConcat('{"pubkey":"', toString(pubkey), '"}');
    }

    function getOracleQueryPrice(string _type)
    external returns (uint) {
        return oraclize_getPrice(_type);
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