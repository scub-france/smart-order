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

    event LogIssuanceQuery(bytes32 indexed queryId, address indexed issuer, address indexed recipient, uint block);
    event LogFailedIssuance(bytes32 indexed queryId, uint block);
    event LogIssuance(bytes32 indexed queryId, uint block, address indexed issuer, address indexed recipient);

    event LogDeliveryQuery(bytes32 indexed orderId, bytes32 indexed queryId, uint block, address indexed pharmacist, uint8 version);
    event LogFailedDelivery(bytes32 indexed queryId, uint block);
    event LogDelivery(bytes32 indexed queryId, uint8 index, uint amount);

    event LogStep(address msg);


    // Structs
    // *****************************************************************************************************************
    struct Prescription {
        string designation;
        uint amount;
        string unit;
        string dosage;
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
        bytes32 orderId;
        uint[] deltas;
        bool pending;
    }


    // Attributes
    // *****************************************************************************************************************
    mapping(bytes32 => Order) private orders;
    mapping(bytes32 => Delivery) private deliveries;
    mapping(bytes32 => bool) private knownOrders;

    // Functions
    // *****************************************************************************************************************
    function issueOrder(address _issuer, address _recipient, string[][] _prescriptions, uint _validity, bytes _sigIssuer, bytes _sigRecipient)
    payable public whenNotPaused {

        require(oraclize_getPrice("URL") < msg.value);

        // Let's verify commitment hash & signatures
        bytes memory commitment = slice(msg.data, 0, SafeMath.sub(msg.data.length, 224));
        bytes32 fingerprint = keccak256("\x19Ethereum Signed Message:\n32", keccak256(commitment));

        // Avoid transaction data replayability
        require(knownOrders[fingerprint] == false);
        knownOrders[fingerprint] = true;

        // Ensure validity of signatures
        require(ECRecovery.recover(fingerprint, _sigIssuer) == _issuer);
        require(ECRecovery.recover(fingerprint, _sigRecipient) == _recipient);

        // Send authentication request to Oracle
        bytes32 queryId = oraclize_query(10, "URL", "http://92.154.91.195:8083/v1/validate/doctor", toAsciiString(_issuer));

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
            prescription.dosage = _prescriptions[i][3];
            orders[queryId].prescriptions.push(prescription);
        }

        emit LogIssuanceQuery(queryId, _issuer, _recipient, block.number);
    }

    function deliver(bytes32 _orderId, bytes _sigPharmacist, bytes _sigRecipient, uint[] _deltas)
    payable external whenNotPaused {

        require(oraclize_getPrice("URL") < msg.value);
        require(orders[_orderId].version > 1);
        require(orders[_orderId].validity == 0 || block.timestamp <= orders[_orderId].validity);
        require(_deltas.length > 0 && _deltas.length <= orders[_orderId].prescriptions.length);

        // Let's check for recipient agreement
        bytes32 commitment = keccak256("\x19Ethereum Signed Message:\n32", keccak256(_orderId, orders[_orderId].version));
        require(ECRecovery.recover(commitment, _sigRecipient) == orders[_orderId].recipient);

        address adrPharmacist = ECRecovery.recover(commitment, _sigPharmacist);
        prepareDelivery(_orderId, adrPharmacist, _deltas);
    }

    function prepareDelivery(bytes32 _orderId, address _adrPharmacist, uint[] _deltas)
    internal {

        // Bump order.version to update future commitment hash
        orders[_orderId].version += 1;

        // Send authentication request to Oracle
        // FIXME : Temp with a localhost because ip is shut down for the moment..
        // FIXME /!\ Remember localhost are not accessible by ethereum-bridge, then use localtunnel to expose on a fake url.
        bytes32 queryId = oraclize_query(10, "URL", "http://92.154.91.195:8083/v1/validate/pharmacist", toAsciiString(_adrPharmacist));

        // Storing delivery
        deliveries[queryId].orderId = _orderId;
        deliveries[queryId].deltas = _deltas;
        deliveries[queryId].pending = true;

        // Log delivery query
        emit LogDeliveryQuery(_orderId, queryId, block.number, _adrPharmacist, orders[_orderId].version);
    }

    function __callback(bytes32 _oraclizeID, string _result)
    public whenNotPaused {

        require(msg.sender == oraclize_cbAddress() || msg.sender == owner);

        // Order issuance callback
        if (orders[_oraclizeID].version == 1) {

            if (parseInt(_result) == 0) {
                // TODO: test result == 0 (problems with odrder.prescriptions deletion ?)
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
                    for (uint8 index = 0; index < deliveries[_oraclizeID].deltas.length; index++) {
                        uint requested = deliveries[_oraclizeID].deltas[index];
                        if (requested > orders[orderId].prescriptions[index].amount) {
                            requested = orders[orderId].prescriptions[index].amount;
                        }
                        orders[orderId].prescriptions[index].amount = SafeMath.sub(orders[orderId].prescriptions[index].amount, requested);
                        emit LogDelivery(_oraclizeID, index, requested);
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
    // https://github.com/GNSPS/solidity-bytes-utils
    function slice(bytes _bytes, uint _start, uint _length)
    internal pure returns (bytes) {

        require(_bytes.length >= (_start + _length));

        bytes memory tempBytes;
        assembly {
            switch iszero(_length)
            case 0 {
            // Get a location of some free memory and store it in tempBytes as
            // Solidity does for memory variables.
                tempBytes := mload(0x40)

            // The first word of the slice result is potentially a partial
            // word read from the original array. To read it, we calculate
            // the length of that partial word and start copying that many
            // bytes into the array. The first word we copy will start with
            // data we don't care about, but the last `lengthmod` bytes will
            // land at the beginning of the contents of the new array. When
            // we're done copying, we overwrite the full first word with
            // the actual length of the slice.
                let lengthmod := and(_length, 31)

            // The multiplication in the next line is necessary
            // because when slicing multiples of 32 bytes (lengthmod == 0)
            // the following copy loop was copying the origin's length
            // and then ending prematurely not copying everything it should.
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                // The multiplication in the next line has the same exact purpose
                // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    mstore(mc, mload(cc))
                }

                mstore(tempBytes, _length)

            //update free-memory pointer
            //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }

    function getOrder(bytes32 _orderId)
    public view returns (Order) {
        return orders[_orderId];
    }

    function toAsciiString(address _x)
    internal pure returns (string) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(_x) / (2 ** (8 * (19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(byte _b)
    internal pure returns (byte) {
        if (_b < 10) return byte(uint8(_b) + 0x30);
        else return byte(uint8(_b) + 0x57);
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