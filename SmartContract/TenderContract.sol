// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransparentTender {

    mapping(address => bool) public governmentOfficials;

    modifier onlyGov() {
        require(governmentOfficials[msg.sender], "Not a government official");
        _;
    }

    constructor() {
        governmentOfficials[msg.sender] = true; 
    }

    receive() external payable {}

    function addGovernmentOfficial(address newOfficial) external onlyGov {
        governmentOfficials[newOfficial] = true;
    }
    struct Contractor {
        uint256 contractorId;
        bool registered;
        string companyName;
        string ipfsProfileHash;
        uint256 competenceScore;
    }


    mapping(address => Contractor) public contractors;
    uint256 public contractorCount = 0;
    address[] public contractorList;
    mapping(uint256 => address) public contractorIdToAddress;


    event ContractorApproved(address indexed contractor, uint256 score);

function approveContractor(
    address _contractor, 
    string memory _ipfsHash, 
    uint256 _aiGeneratedScore
) external onlyGov {
    require(!contractors[_contractor].registered, "Already registered");
    require(_aiGeneratedScore <= 100, "Score out of bounds");

    contractorCount++;
    contractorList.push(_contractor);
    contractorIdToAddress[contractorCount] = _contractor;

    contractors[_contractor] = Contractor({
        contractorId: contractorCount,
        registered: true,
        companyName: "",
        ipfsProfileHash: _ipfsHash,
        competenceScore: _aiGeneratedScore
    });

        
    emit ContractorApproved(_contractor, _aiGeneratedScore);
}

    struct Tender {
        uint256 tenderId;
        string ipfsTenderHash;
        uint256 commitDeadline;
        uint256 revealDeadline;
        bool winnerSelected;
        address winner;
        uint256 winningBidAmount;
    }

    uint256 public tenderCount = 0;
    mapping(uint256 => Tender) public tenders;
    mapping(uint256 => address[]) public tenderBidders;
    uint256[] public tenderIds;

    event TenderCreated(uint256 tenderId, string ipfsHash, uint256 commitDeadline, uint256 revealDeadline);

    function createTender(
        string memory _ipfsHash,
        uint256 _commitDeadline,
        uint256 _revealDeadline
    ) external onlyGov {
        // FIX: Ensure deadlines are in the future
        require(_commitDeadline > block.timestamp, "Commit deadline must be in future");
        require(_revealDeadline > _commitDeadline, "Reveal must be after commit");

        tenderCount++;
        tenderIds.push(tenderCount);

        tenders[tenderCount] = Tender({
            tenderId: tenderCount,
            ipfsTenderHash: _ipfsHash,
            commitDeadline: _commitDeadline,
            revealDeadline: _revealDeadline,
            winnerSelected: false,
            winner: address(0),
            winningBidAmount: 0
        });

        emit TenderCreated(tenderCount, _ipfsHash, _commitDeadline, _revealDeadline);
    }

    struct Bid {
        bytes32 commitHash;
        uint256 revealedAmount;
        bool revealed;
    }

    mapping(uint256 => mapping(address => Bid)) public bids;

    function submitBid(uint256 tenderId, bytes32 _commitHash) external {
        require(contractors[msg.sender].registered, "Not a contractor");
        require(block.timestamp <= tenders[tenderId].commitDeadline, "Bidding closed");

        // FIX: Explicitly check for zero-hash to prevent duplicates
        if (bids[tenderId][msg.sender].commitHash == bytes32(0)) {
            tenderBidders[tenderId].push(msg.sender);
        }

        bids[tenderId][msg.sender].commitHash = _commitHash;
    }

    function revealBid(uint256 tenderId, uint256 amount, bytes32 secret) external {
        Tender storage t = tenders[tenderId];
        require(block.timestamp > t.commitDeadline, "Cannot reveal yet");
        require(block.timestamp <= t.revealDeadline, "Reveal phase over");

        // Verify the hash matches what they committed earlier
        bytes32 computedHash = keccak256(abi.encodePacked(amount, secret));
        require(bids[tenderId][msg.sender].commitHash == computedHash, "Hash mismatch! Wrong secret or amount");

        bids[tenderId][msg.sender].revealedAmount = amount;
        bids[tenderId][msg.sender].revealed = true;
    }

    event WinnerSelected(uint256 tenderId, address winner, uint256 finalScore);

    function evaluateWinner(uint256 tenderId) external onlyGov {
        Tender storage t = tenders[tenderId];
        require(block.timestamp > t.revealDeadline, "Reveal phase not over");
        require(!t.winnerSelected, "Winner already selected");

        uint256 bestScore = type(uint256).max; // Lower is better
        address bestBidder = address(0);
        uint256 winningAmount = 0;

        address[] memory bidders = tenderBidders[tenderId];
        require(bidders.length > 0, "No bidders found");

        for (uint256 i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            Bid memory bid = bids[tenderId][bidder];


            if (!bid.revealed) continue;

            uint256 price = bid.revealedAmount; 
            uint256 competence = contractors[bidder].competenceScore;

            uint256 finalScore = (price * 70) + ((100 - competence) * 30);

            if (finalScore < bestScore) {
                bestScore = finalScore;
                bestBidder = bidder;
                winningAmount = price;
            }
        }

        t.winnerSelected = true;
        t.winner = bestBidder;
        t.winningBidAmount = winningAmount;

        emit WinnerSelected(tenderId, bestBidder, bestScore);
    }

    struct Milestone {
        string description;
        string ipfsProofHash;
        bool approved;
        uint256 paymentAmount;
        bool paid;
    }

    mapping(uint256 => Milestone[]) public milestones;
    mapping(uint256 => uint256) public tenderFunds; 

    event MilestonePayment(uint256 tenderId, uint256 milestoneId, address contractor, uint256 amount);


    function fundTender(uint256 tenderId) external payable onlyGov {
        require(tenders[tenderId].tenderId != 0, "Tender does not exist");
        tenderFunds[tenderId] += msg.value;
    }

    function addMilestone(uint256 tenderId, string memory desc, uint256 _paymentAmount) external onlyGov {
        milestones[tenderId].push(Milestone({
            description: desc,
            ipfsProofHash: "",
            approved: false,
            paymentAmount: _paymentAmount,
            paid: false
        }));
    }

    function uploadMilestoneProof(uint256 tenderId, uint256 milestoneId, string memory _proofHash) external {
        require(msg.sender == tenders[tenderId].winner, "Not the winner");
        milestones[tenderId][milestoneId].ipfsProofHash = _proofHash;
    }

    function approveMilestone(uint256 tenderId, uint256 milestoneId) external onlyGov {
        Milestone storage m = milestones[tenderId][milestoneId];
        require(!m.approved, "Already approved");
        require(bytes(m.ipfsProofHash).length > 0, "No proof submitted");

        m.approved = true;

        
        if (m.paymentAmount > 0 && !m.paid) {
            require(tenderFunds[tenderId] >= m.paymentAmount, "Insufficient tender funds");
            m.paid = true;
            tenderFunds[tenderId] -= m.paymentAmount;

            address winner = tenders[tenderId].winner;
            (bool success, ) = payable(winner).call{value: m.paymentAmount}("");
            require(success, "Payment transfer failed");

            emit MilestonePayment(tenderId, milestoneId, winner, m.paymentAmount);
        }
    }


    function getMilestones(uint256 tenderId) external view returns (Milestone[] memory) {
        return milestones[tenderId];
    }

    function getTenderIds() external view returns (uint256[] memory) {
        return tenderIds;
    }


    function getContractorList() external view returns (address[] memory) {
        return contractorList;
    }
    function getContractorDetails(address _addr) external view returns (
        uint256 contractorId,
        bool registered,
        string memory companyName,
        string memory ipfsProfileHash,
        uint256 competenceScore
    ) {
        Contractor storage c = contractors[_addr];
        return (c.contractorId, c.registered, c.companyName, c.ipfsProfileHash, c.competenceScore);
    }


    function getAllTenders() external view returns (Tender[] memory) {
        Tender[] memory allTenders = new Tender[](tenderCount);
        for (uint256 i = 0; i < tenderCount; i++) {
            allTenders[i] = tenders[i + 1]; 
        }
        return allTenders;
    }
    
    function getTenderBidders(uint256 tenderId) external view returns (address[] memory) {
        return tenderBidders[tenderId];
    }


    function getTenderWinner(uint256 tenderId) external view returns (
        address winnerAddress,
        string memory companyName,
        string memory ipfsProfileHash,
        uint256 competenceScore,
        uint256 winningBidAmount,
        bool winnerSelected
    ) {
        Tender storage t = tenders[tenderId];
        winnerSelected = t.winnerSelected;
        winnerAddress = t.winner;
        winningBidAmount = t.winningBidAmount;

        if (t.winnerSelected) {
            Contractor storage c = contractors[t.winner];
            companyName = c.companyName;
            ipfsProfileHash = c.ipfsProfileHash;
            competenceScore = c.competenceScore;
        }
    }

    
    function getTenderProgress(uint256 tenderId) external view returns (
        uint256 totalMilestones,
        uint256 submittedCount,
        uint256 approvedCount,
        uint256[] memory statuses
    ) {
        Milestone[] storage ms = milestones[tenderId];
        totalMilestones = ms.length;
        statuses = new uint256[](totalMilestones);

        for (uint256 i = 0; i < totalMilestones; i++) {
            if (ms[i].approved) {
                statuses[i] = 2;
                approvedCount++;
                submittedCount++; 
            } else if (bytes(ms[i].ipfsProofHash).length > 0) {
                statuses[i] = 1;
                submittedCount++;
            }
        }
    }

}