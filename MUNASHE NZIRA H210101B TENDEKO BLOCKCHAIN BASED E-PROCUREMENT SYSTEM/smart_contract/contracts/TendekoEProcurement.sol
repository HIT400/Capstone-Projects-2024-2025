// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract TendekoStorage {
    struct Tender {
        string tenderID;
        string title;
        uint256 closingDate;
        uint256 valueAmount;
        string valueCurrency;
        string status;
        string hashOfDetails;
        address procuringEntity;
        bool isEvaluated;
    }
    
    struct Bid {
        string bidID;
        string tenderID;
        address supplier;
        uint256 bidAmount;
        uint256 timestamp;
        string hashOfDocuments;
        bool isWinningBid;
    }
    
    struct Award {
        string awardID;
        string tenderID;
        string bidID;
        address supplier;
        uint256 awardDate;
        string hashOfEvaluation;
    }
    
    struct Contract {
        string contractID;
        string tenderID;
        string awardID;
        address supplier;
        uint256 contractDate;
        uint256 contractValue;
        string hashOfContract;
        string status;
    }

    struct TenderInput {
        string tenderID;
        string title;
        uint256 closingDate;
        uint256 valueAmount;
        string valueCurrency;
        string hashOfDetails;
    }

    struct BidInput {
        string tenderID;
        string bidID;
        uint256 bidAmount;
        string hashOfDocuments;
    }

    struct AwardInput {
        string tenderID;
        string awardID;
        string bidID;
        address supplier;
        string hashOfEvaluation;
    }

    struct ContractInput {
        string contractID;
        string tenderID;
        string awardID;
        uint256 contractValue;
        string hashOfContract;
    }

    // Storage
    mapping(string => Tender) internal tenders;
    mapping(string => Bid[]) internal tenderBids;
    mapping(string => Award) internal awards;
    mapping(string => Contract) internal contracts;
    
    // Events
    event TenderCreated(string indexed tenderID, string title, uint256 closingDate);
    event BidSubmitted(string indexed tenderID, string bidID, address indexed supplier);
    event TenderAwarded(string indexed tenderID, string awardID, address indexed supplier);
    event ContractSigned(string indexed tenderID, string contractID, address indexed supplier);
    event TenderStatusUpdated(string indexed tenderID, string status);
}

contract TendekoTenderManagement is TendekoStorage {
    modifier onlyProcuringEntity(string memory tenderID) {
        require(msg.sender == tenders[tenderID].procuringEntity, "Not authorized");
        _;
    }

    function createTender(TenderInput memory input) external {
        tenders[input.tenderID] = Tender({
            tenderID: input.tenderID,
            title: input.title,
            closingDate: input.closingDate,
            valueAmount: input.valueAmount,
            valueCurrency: input.valueCurrency,
            status: "ACTIVE",
            hashOfDetails: input.hashOfDetails,
            procuringEntity: msg.sender,
            isEvaluated: false
        });
        emit TenderCreated(input.tenderID, input.title, input.closingDate);
    }

    function updateTenderStatus(string memory _tenderID, string memory _status) 
        external 
        onlyProcuringEntity(_tenderID) 
    {
        tenders[_tenderID].status = _status;
        emit TenderStatusUpdated(_tenderID, _status);
    }

    function getTender(string memory tenderID) external view returns (
        string memory tenderID_,
        string memory title,
        uint256 closingDate,
        uint256 valueAmount,
        string memory valueCurrency,
        string memory status,
        string memory hashOfDetails,
        address procuringEntity,
        bool isEvaluated
    ) {
        Tender storage tender = tenders[tenderID];
        
        return (
            tender.tenderID,
            tender.title,
            tender.closingDate,
            tender.valueAmount,
            tender.valueCurrency,
            tender.status,
            tender.hashOfDetails,
            tender.procuringEntity,
            tender.isEvaluated
        );
    }

    function getBidsForTender(string memory tenderID) external view returns (Bid[] memory) {
        return tenderBids[tenderID];
    }
}

contract TendekoBidManagement is TendekoStorage {
    function submitBid(BidInput memory input) external {
        require(tenders[input.tenderID].closingDate > block.timestamp, "Tender closed");
        require(bytes(tenders[input.tenderID].status).length > 0, "Tender doesn't exist");
        
        tenderBids[input.tenderID].push(Bid({
            bidID: input.bidID,
            tenderID: input.tenderID,
            supplier: msg.sender,
            bidAmount: input.bidAmount,
            timestamp: block.timestamp,
            hashOfDocuments: input.hashOfDocuments,
            isWinningBid: false
        }));
        emit BidSubmitted(input.tenderID, input.bidID, msg.sender);
    }

    function getBid(string memory tenderID, string memory bidID) external view returns (Bid memory) {
        Bid[] memory bids = tenderBids[tenderID];
        for (uint i = 0; i < bids.length; i++) {
            if (keccak256(abi.encodePacked(bids[i].bidID)) == keccak256(abi.encodePacked(bidID))) {
                return bids[i];
            }
        }
        revert("Bid not found");
    }
}

contract TendekoAwardManagement is TendekoStorage {
    function awardTender(AwardInput memory input) external {
        require(!tenders[input.tenderID].isEvaluated, "Already evaluated");
        require(msg.sender == tenders[input.tenderID].procuringEntity, "Not authorized");
        
        awards[input.awardID] = Award({
            awardID: input.awardID,
            tenderID: input.tenderID,
            bidID: input.bidID,
            supplier: input.supplier,
            awardDate: block.timestamp,
            hashOfEvaluation: input.hashOfEvaluation
        });
        
        tenders[input.tenderID].isEvaluated = true;
        tenders[input.tenderID].status = "COMPLETED";
        
        emit TenderAwarded(input.tenderID, input.awardID, input.supplier);
        emit TenderStatusUpdated(input.tenderID, "COMPLETED");
    }

    function getAward(string memory awardID) external view returns (Award memory) {
        return awards[awardID];
    }
}

contract TendekoContractManagement is TendekoStorage {
    function createContract(ContractInput memory input) external {
        require(awards[input.awardID].supplier != address(0), "Award doesn't exist");
        require(msg.sender == tenders[input.tenderID].procuringEntity, "Not authorized");
        
        contracts[input.contractID] = Contract({
            contractID: input.contractID,
            tenderID: input.tenderID,
            awardID: input.awardID,
            supplier: awards[input.awardID].supplier,
            contractDate: block.timestamp,
            contractValue: input.contractValue,
            hashOfContract: input.hashOfContract,
            status: "ACTIVE"
        });
        emit ContractSigned(input.tenderID, input.contractID, awards[input.awardID].supplier);
    }

    function getContract(string memory contractID) external view returns (Contract memory) {
        return contracts[contractID];
    }
}

contract TendekoEProcurement is TendekoTenderManagement, TendekoBidManagement, TendekoAwardManagement, TendekoContractManagement {
    address public admin;
    address[] public authorizedEntities;
    uint256 public minBidTimeWindow = 7 days; 
    bool public systemActive = true;
    
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event EntityAuthorized(address indexed entity);
    event EntityDeauthorized(address indexed entity);
    event SystemStatusChanged(bool active);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    constructor(address _initialAdmin) {
        require(_initialAdmin != address(0), "Invalid admin address");
        admin = _initialAdmin;
        authorizedEntities.push(_initialAdmin); // Admin is an authorized entity by default
        emit AdminChanged(address(0), _initialAdmin);
        emit EntityAuthorized(_initialAdmin);
    }
    
    // Admin functions to manage the system
    function changeAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        emit AdminChanged(admin, _newAdmin);
        admin = _newAdmin;
    }
    
    function authorizeEntity(address _entity) external onlyAdmin {
        require(_entity != address(0), "Invalid entity address");
        // Add logic to check if entity already exists
        authorizedEntities.push(_entity);
        emit EntityAuthorized(_entity);
    }
    
    function deauthorizeEntity(address _entity) external onlyAdmin {
        // Add logic to remove entity from authorizedEntities array
        emit EntityDeauthorized(_entity);
    }
    
    function setMinBidTimeWindow(uint256 _days) external onlyAdmin {
        minBidTimeWindow = _days * 1 days;
    }
    
    function toggleSystem(bool _active) external onlyAdmin {
        systemActive = _active;
        emit SystemStatusChanged(_active);
    }

}
