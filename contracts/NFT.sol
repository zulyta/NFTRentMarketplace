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
    //Crea dos variables la primera es un contador para asignar indentificadores
    //y la segunda guarda el numero total de tokens NFT
    CountersUpgradeable.Counter private _tokenIdCounter;
    uint256 private _totalSupply;

    //Declara la estructura Car, con los atibutos del carro .

    struct Car {
        uint256 tokenId;
        string nameAuto;
        string features;
        uint256 price;
        uint256 guarantee;
        uint256 interestRate;
    }

    //Declara la matriz privada que almacenara los NFT de autos creados
    Car[] private cars;

    //Inicializa una vez desplegado los contratos y asigna roles de administrador y minter 
    function initialize() initializer public {
        __ERC721_init("NFT", "RC");
        __ERC721URIStorage_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }
    //Funcion  que especifica que solo el dueño del market place puede realizar modificaciones
    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    // Funcion crea un nuevo token NFT y lo asigna a una direccion to
    function safeMintOwner(address to, string memory uri, string memory nameAuto, string memory features, uint256 price, uint256 guarantee, uint256 interestRate)
        public
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        cars.push(Car(tokenId, nameAuto, features, price, guarantee, interestRate));
        //incrementamos el contador para obtener un nuevo identificador
        //utiliza safemint para crear el token NFT y asignarlo a la direccion to
        //el metadato del token se establece utilizando _setTokenURI con la ubicacion uri
        _tokenIdCounter.increment();
        _totalSupply++;
    }

      //funcion para crear otro NFT para el que el arrendatario despues de crear un alquiler; 
    function safeMintRental( address to, string memory uri) 
        public
        onlyRole(MINTER_ROLE)
        {
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _tokenIdCounter.increment();
        _totalSupply++;
         }

      //La funcion getCar permite obtener los detalles de un automovil NFT existente
      //recibe un indice y devuelve el identificador del token y sus atributos.  
    function getCar(uint256 index) public view returns (uint256 tokenId, string memory nameAuto, string memory features, uint256 price, uint256 guarantee, uint256 interestRate) {
        require(index < cars.length, "Index de carro invalido");
        Car storage car = cars[index];
        return (car.tokenId, car.nameAuto, car.features, car.price, car.guarantee, car.interestRate);
    }

    //devuelve el numero total de token NFT creados, alamcenado en _totalSupply
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    //Se utiliza para quemar un token
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function burnOwnerToken(uint256 tokenId) external onlyRole(MINTER_ROLE) {
    address owner = ownerOf(tokenId);
    require(owner != address(0), "Propietario de token invalido");
    _burn(tokenId);
    }

    function burnRenterToken(uint256 tokenId) external onlyRole(MINTER_ROLE) {
        address renter = ownerOf(tokenId);
        require(renter != address(0), "Arrendatario de token invalido");
        _burn(tokenId);
    }

    //Devuelve la URI de un token NFT especifico en funcion de su identidad
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    //Verifica si el contrato admite una interfaz especifica
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
