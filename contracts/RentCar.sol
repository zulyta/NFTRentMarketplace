// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./NFT.sol";

contract RentCar is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    using SafeMathUpgradeable for uint256;

    bytes32 public constant RENTER_ROLE = keccak256("RENTER_ROLE");

    NFT private nftContract;
    address private marketplaceOwner;
    uint256 private commissionPercentage;

    struct Rental {
        uint256 carIndex;
        uint256 tokenId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        bool active;
        bool returned;
    }

    Rental[] private rentals;
    mapping(address => uint256[]) private renterRentals;
    mapping(address => uint256[]) private carRentals;

    event RentalCreated(
        address indexed renter,
        uint256 rentalId,
        uint256 carIndex,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    );
    event RentalReturned(address indexed renter, uint256 rentalId, uint256 endDate);

    function initialize(address _nftContractAddress, address _marketplaceOwner, uint256 _commissionPercentage) initializer public {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(RENTER_ROLE, msg.sender);

        nftContract = NFT(_nftContractAddress);
        marketplaceOwner = _marketplaceOwner;
        commissionPercentage = _commissionPercentage;
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function setCommissionPercentage(uint256 _commissionPercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
        commissionPercentage = _commissionPercentage;
    }

    function createRental(
        uint256 carIndex,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    ) external payable onlyRole(RENTER_ROLE) {
        require(startDate < endDate, "Invalid rental dates");
        require(tokenIdExists(tokenId), "Token ID does not exist");
        require(isCarAvailable(carIndex), "Car is not available for rental");

        uint256 rentalId = rentals.length;
        Rental storage rental = rentals.push();
        rental.carIndex = carIndex;
        rental.tokenId = tokenId;
        rental.renter = msg.sender;
        rental.startDate = startDate;
        rental.endDate = endDate;
        rental.active = true;
        rental.returned = false;

        renterRentals[msg.sender].push(rentalId);
        carRentals[nftContract.ownerOf(tokenId)].push(rentalId);

        emit RentalCreated(msg.sender, rentalId, carIndex, tokenId, startDate, endDate);

        uint256 rentalCost = calculateRentalCost(rentalId);
        require(msg.value >= rentalCost, "Insufficient funds");

        uint256 commission = rentalCost.mul(commissionPercentage).div(100);
        uint256 amountToOwner = rentalCost.sub(commission);

        payable(marketplaceOwner).transfer(commission);
        payable(nftContract.ownerOf(tokenId)).transfer(amountToOwner);
    }

    function returnRental(uint256 rentalId) external onlyRole(RENTER_ROLE) {
        require(rentalId < rentals.length, "Invalid rental ID");
        Rental storage rental = rentals[rentalId];
        require(rental.renter == msg.sender, "Not the renter of this rental");
        require(rental.active, "Rental is not active");
        require(rental.endDate < block.timestamp, "Rental has not ended yet");

        rental.active = false;
        rental.returned = true;

        emit RentalReturned(msg.sender, rentalId, rental.endDate);
    }

    function calculateRentalCost(uint256 rentalId) public view returns (uint256) {
        require(rentalId < rentals.length, "Invalid rental ID");
        Rental storage rental = rentals[rentalId];
        (, uint256 guarantee, uint256 interestRate) = nftContract.getCar(rental.carIndex);

        uint256 rentalDuration = rental.endDate.sub(rental.startDate);

        if (rentalDuration <= 1 days) {
            return guarantee;
        } else {
            uint256 extraDays = rentalDuration.sub(1 days);
            uint256 interest = extraDays.mul(interestRate);
            return guarantee.add(interest);
        }
    }

    function tokenIdExists(uint256 tokenId) private view returns (bool) {
        uint256 totalSupply = nftContract.totalSupply();
        return tokenId < totalSupply;
    }

    function isCarAvailable(uint256 carIndex) private view returns (bool) {
        uint256[] memory carRentalsList = carRentals[nftContract.ownerOf(carIndex)];
        for (uint256 i = 0; i < carRentalsList.length; i++) {
            Rental storage rental = rentals[carRentalsList[i]];
            if (rental.active && rental.carIndex == carIndex) {
                if (block.timestamp >= rental.startDate && block.timestamp <= rental.endDate) {
                    return false;
                }
            }
        }
        return true;
    }

    function getRental(uint256 rentalId)
        public
        view
        returns (
            uint256 carIndex,
            uint256 tokenId,
            address renter,
            uint256 startDate,
            uint256 endDate,
            bool active,
            bool returned
        )
    {
        require(rentalId < rentals.length, "Invalid rental ID");
        Rental storage rental = rentals[rentalId];
        return (
            rental.carIndex,
            rental.tokenId,
            rental.renter,
            rental.startDate,
            rental.endDate,
            rental.active,
            rental.returned
        );
    }

    function getRenterRentals(address renter) public view returns (uint256[] memory) {
        return renterRentals[renter];
    }

    function getCarRentals(address carOwner) public view returns (uint256[] memory) {
        return carRentals[carOwner];
    }

    function getTotalRentals() public view returns (uint256) {
        return rentals.length;
    }

    function withdrawFunds() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
