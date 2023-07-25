// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

contract NFTv2_2 is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // @dev Librería CountersUpgradeable para contar los tokens emitidos.
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // @dev Variable para contar los tokens emitidos y el total de tokens
    CountersUpgradeable.Counter private _tokenIdCounter;

    // @dev Variable para contar los tokens de comprobante te venta emitidos y el total de los mismos.
    uint256 private _rentalIdCounter;

    // @dev Seteos de roles para el contrato
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // @dev Estructura Car para representar los atributos de un carro
    struct Car {
        uint256 tokenId;
        string name;
        string imageURI;
        string features;
        string licensePlate;
        uint256 rentalPricePerDay;
        uint256 rentalGuarantee;
        uint256 lateReturnInterestPerDay;
        bool isRented;
    }

    // @dev Lista de todos los tokens NFT de carro creados.
    mapping(uint256 => Car) private _cars;

    // @dev Evento que se emite cuando se crea un nuevo token NFT.
    event CarNFTCreated(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        string imageURI,
        string features,
        string licensePlate,
        uint256 rentalPricePerDay,
        uint256 rentalGuarantee,
        uint256 lateReturnInterestPerDay,
        bool isRented
    );

    // @dev Inicializador del contrato
    function initialize() public initializer {
        __ERC721_init("NFT Car", "NFTCAR");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);

        _rentalIdCounter = 100000; // Seteo momentáneo para el contador de tokens de renta
    }

    // @dev Función segura para que se cree un nuevo token NFT.
    // @param owner La dirección del destinatario que recibirá el nuevo token.
    // @param name El nombre del carro.
    // @param imageURI La URI asociado al token NFT.
    // @param features Las características o detalles del carro.
    // @param price El precio del carro.
    // @param guarantee El período de garantía en días del carro.
    // @param interestRate La tasa de interés aplicada al préstamo del carro.
    function mintCarNFT(
        address owner,
        string memory name,
        string memory imageURI,
        string memory features,
        string memory licensePlate,
        uint256 rentalPricePerDay,
        uint256 rentalGuarantee,
        uint256 lateReturnInterestPerDay
    ) public onlyRole(MINTER_ROLE) {
        require(rentalPricePerDay > 0, "Precio de alquiler no puede ser cero");
        require(rentalGuarantee > 0, "Garantia de alquiler no puede ser cero");

        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, imageURI);

        _cars[tokenId] = Car(
            tokenId,
            name,
            imageURI,
            features,
            licensePlate,
            rentalPricePerDay,
            rentalGuarantee,
            lateReturnInterestPerDay,
            false
        );

        _tokenIdCounter.increment();

        emit CarNFTCreated(
            tokenId,
            owner,
            name,
            imageURI,
            features,
            licensePlate,
            rentalPricePerDay,
            rentalGuarantee,
            lateReturnInterestPerDay,
            false
        );
    }

    // @dev Función segura para que se cree un nuevo token de renta como comprobante.
    // @param owner La dirección del destinatario que recibirá el nuevo token.
    // @return El identificador único del token de renta.
    function mintRentalToken(address owner) public returns (uint256) {
        uint256 tokenId = _rentalIdCounter;
        _safeMint(owner, tokenId);
        _rentalIdCounter++;

        return tokenId;
    }

    // @dev Función para quemar un token de renta específico.
    // @param tokenId El identificador único del token de renta que se va a quemar.
    function burnRentalToken(uint256 tokenId) external {
        address renter = ownerOf(tokenId);
        require(renter != address(0), "Arrendatario de token invalido");
        _burn(tokenId);
    }

    // @dev Función para actualizar el estado alquilado de un NFT.
    // @param tokenId El identificador único del token.
    // @param isRented El nuevo estado alquilado del token.
    function setNFTRented(
        uint256 tokenId,
        address owner,
        bool isRented
    ) public {
        require(_exists(tokenId), "El token no existe");
        require(
            ownerOf(tokenId) == owner,
            "El token no pertenece al propietario"
        );
        _cars[tokenId].isRented = isRented;
    }

    // @dev Función para obtener los atributos de un token NFT.
    // @param tokenId El identificador único del token.
    // @return Una estructura Car que contiene los atributos del token NFT.
    function getCar(uint256 tokenId) public view returns (Car memory) {
        require(_exists(tokenId), "El token no existe");
        return _cars[tokenId];
    }

    // @dev Función para obtener la lista completa de carroes registrados.
    // @return Una matriz de estructuras Car[] que contiene todos los carroes registrados.
    function getCars() public view returns (Car[] memory) {
        uint256 totalCars = _tokenIdCounter.current();
        Car[] memory _allCars = new Car[](totalCars);
        for (uint256 i = 0; i < totalCars; i++) {
            _allCars[i] = getCar(i);
        }
        return _allCars;
    }

    // @dev Función para obtener el total de tokens NFT creados.
    // @return El total de tokens en circulación.
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // @dev Función interna para quemar un token NFT específico.
    // @param tokenId Identificador único del token NFT que se va a quemar.
    // @notice Esta función solo puede ser llamada desde contratos heredados: ERC721Upgradeable y ERC721URIStorageUpgradeable
    function _burn(
        uint256 tokenId
    ) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
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
        return "2.2.1";
    }
}
