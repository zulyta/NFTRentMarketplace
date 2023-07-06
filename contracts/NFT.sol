// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract NFT is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable, UUPSUpgradeable {
    //Importamos y usamos la biblioteca CountersUpgradeable para contar los tokens emitidos.
    using CountersUpgradeable for CountersUpgradeable.Counter;
    //Declara una constante MINTER_ROLE como una variable 
    //pública que representa el rol de "minter" en el contrato. 
    //utilizado para limitar quién puede crear nuevos tokens NFT
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    CountersUpgradeable.Counter private _tokenIdCounter;
    uint256 private _totalSupply;

    struct Car {
        uint256 tokenId;
        uint256 guarantee;
        uint256 interestRate;
    }

    Car[] private cars;

    function initialize() initializer public {
        __ERC721_init("NFT", "RC");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    function safeMint(address to, string memory uri, uint256 guarantee, uint256 interestRate)
        public
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        cars.push(Car(tokenId, guarantee, interestRate));
        _tokenIdCounter.increment();
        _totalSupply++;
    }

    function getCar(uint256 index) public view returns (uint256 tokenId, uint256 guarantee, uint256 interestRate) {
        require(index < cars.length, "Invalid car index");
        Car storage car = cars[index];
        return (car.tokenId, car.guarantee, car.interestRate);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
