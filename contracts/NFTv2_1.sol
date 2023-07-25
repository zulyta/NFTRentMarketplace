// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract NFTv2_1 is
    Initializable,
    PausableUpgradeable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // @dev Librería CountersUpgradeable para contar los tokens emitidos.
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // @dev Seteos de roles para el contrato
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // @dev Variable para contar los tokens emitidos y el total de tokens
    CountersUpgradeable.Counter private _tokenIdCounter;

    // @dev Variable para el total de tokens
    uint256 private _totalSupply;

    // @dev Estructura Car para representar los atributos de un carro
    struct Car {
        uint256 tokenId;
        string nameAuto;
        string features;
        uint256 price;
        uint256 guarantee;
        uint256 interestRate;
    }

    // @dev Array privado de carroes creados
    Car[] private cars;

    // @dev Inicializador del contrato
    function initialize() public initializer {
        __ERC721_init("NFT Car", "NFTCAR");
        __Pausable_init();
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);
    }

    // @dev Función para pausar el contrato
    // @notice Las funciones pause() y unpause() solo pueden ser ejecutada por los poseedores del rol PAUSER_ROLE
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // @dev Función para despausar el contrato
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // @dev Función segura para que el propietario del contrato cree y otorgue un nuevo token NFT.
    // @param to La dirección del destinatario que recibirá el nuevo token.
    // @param uri La URI asociado al token NFT.
    // @param nameAuto El nombre del carro.
    // @param features Las características o detalles del carro.
    // @param price El precio del carro.
    // @param guarantee El período de garantía en días del carro.
    // @param interestRate La tasa de interés aplicada al préstamo del carro.
    function safeMintOwner(
        address to,
        string memory uri,
        string memory nameAuto,
        string memory features,
        uint256 price,
        uint256 guarantee,
        uint256 interestRate
    ) public {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        cars.push(
            Car(tokenId, nameAuto, features, price, guarantee, interestRate)
        );
        _tokenIdCounter.increment();
        _totalSupply++;
    }

    // @dev Función segura para que cualquier usuario cree y otorgue un nuevo token NFT de alquiler.
    // @param to La dirección del destinatario que recibirá el nuevo token NFT.
    // @param uri La URI asociado al token NFT.
    // @notice La función solo pueden ser ejecutada por los poseedores del rol MINTER_ROLE
    function safeMintRental(
        address to,
        string memory uri
    ) public onlyRole(MINTER_ROLE) {
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenIdCounter.increment();
        _totalSupply++;
    }

    // @dev Función para obtener los detalles de un token NFT de carro mediante su índice.
    // @param index El índice del token NFT de carro en la lista de tokens.
    // @return Retorna los detalles del token NFT de carro.
    function getCar(
        uint256 index
    )
        public
        view
        returns (
            uint256 tokenId,
            string memory nameAuto,
            string memory features,
            uint256 price,
            uint256 guarantee,
            uint256 interestRate
        )
    {
        require(index < cars.length, "El carro no existe");
        Car storage car = cars[index];
        return (
            car.tokenId,
            car.nameAuto,
            car.features,
            car.price,
            car.guarantee,
            car.interestRate
        );
    }

    // @dev Función para obtener la lista completa de carroes registrados.
    // @return Una matriz de estructuras Car[] que contiene todos los carroes registrados.
    function getCars() public view returns (Car[] memory) {
        return cars;
    }

    // @dev Función para obtener el total de tokens NFT creados.
    // @return El total de tokens en circulación.
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    // @dev Función interna para quemar un token NFT específico.
    // @param tokenId Identificador único del token NFT que se va a quemar.
    // @notice Esta función solo puede ser llamada desde contratos heredados: ERC721Upgradeable y ERC721URIStorageUpgradeable
    function _burn(
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    // @dev Función para que el propietario de un token NFT queme su propio token.
    // @param tokenId El identificador único del token NFT que el propietario quiere quemar.
    // @notice La función solo pueden ser ejecutada por los poseedores del rol BURNER_ROLE
    // @notice Esta función solo puede ser llamada por el propietario del token.
    // @notice Se debe asegurar que el propietario del token sea válido y que exista.
    function burnOwnerToken(uint256 tokenId) external onlyRole(BURNER_ROLE) {
        address owner = ownerOf(tokenId);
        require(owner != address(0), "Propietario de token invalido");
        _burn(tokenId);
    }

    // @dev Función para que el arrendatario de un token NFT queme el token.
    // @param tokenId El identificador único del token NFT que el arrendatario quiere quemar.
    // @notice La función solo pueden ser ejecutada por los poseedores del rol BURNER_ROLE
    // @notice Esta función solo puede ser llamada por el arrendatario actual del token.
    // @notice Se debe asegurar que el arrendatario del token sea válido y que exista.
    function burnRenterToken(uint256 tokenId) external onlyRole(BURNER_ROLE) {
        address renter = ownerOf(tokenId);
        require(renter != address(0), "Arrendatario de token invalido");
        _burn(tokenId);
    }

    // @dev Función para obtener la URI asociado a un token NFT.
    // @param tokenId El identificador único del token.
    // @return La URI del metadato asociado al token.
    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // @dev Función para comprobar si el contrato admite una interfaz específica.
    // @param interfaceId El identificador único de la interfaz que se quiere comprobar.
    // @return true si el contrato admite la interfaz especificada, false en caso contrario.
    // @notice Esta función se implementa mediante la herencia de las funciones: ERC721Upgradeable, ERC721URIStorageUpgradeable y AccessControlUpgradeable.
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(
            ERC721Upgradeable,
            ERC721URIStorageUpgradeable,
            AccessControlUpgradeable
        )
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // @dev Función interna para autorizar actualizaciones del contrato.
    // @param newImplementation La dirección de la nueva implementación del contrato que se quiere autorizar.
    // @notice Esta función es utilizada para permitir que los poseedores del rol UPGRADER_ROLE autoricen actualizaciones.
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    // @dev Devuelve la versión actual del contrato en formato string.
    // @return String que representa la versión actual del contrato.
    function version() public pure returns (string memory) {
        return "2.1.0";
    }
}
