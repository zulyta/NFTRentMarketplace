// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./NFTv2_2.sol";

import "hardhat/console.sol";

contract RentCarV2_2 is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // @div Librería SafeMathUpgradeable para realizar operaciones matemáticas seguras con enteros.
    using SafeMathUpgradeable for uint256;

    // @dev Librería CountersUpgradeable para contar las rentas creadas.
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // @dev Variable para contar las rentas creadas y el total de rentas
    CountersUpgradeable.Counter private _rentalIdCounter;

    // @dev Seteos de roles para el contrato
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // @dev Estructura Rental para representar los atributos de un alquiler.
    struct Rental {
        uint256 tokenId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        uint256 totalDays;
        uint256 totalPrice;
        uint256 totalInterest;
        bool active;
        bool returned;
        uint256 mintTokenId;
    }

    // @dev Dirección del propietario del Marketplace.
    address private marketplaceOwner;

    // @dev Porcentaje de comisión que se aplicará al vender un NFT en el Marketplace.
    uint256 private commissionPercentage;

    // @dev Contrato NFT al que está conectado el Marketplace.
    NFTv2_2 private nftContract;

    // @dev Mapeo de todos los alquileres creados.
    mapping(uint256 => Rental) private _rentals;

    // @dev Mapeo de direcciones a listas de IDs de alquileres para los arrendatarios.
    mapping(address => uint256[]) private _renterRentals;

    // @dev Mapeo de direcciones a listas de IDs de alquileres para los propietarios.
    mapping(address => uint256[]) private _carRentals;

    // @dev Evento que se emite cuando se crea un nuevo alquiler.
    // @param renter La dirección del arrendatario que realiza el alquiler.
    // @param rentalId El ID único del alquiler.
    // @param tokenId El ID único del token NFT del coche que se alquila.
    // @param startDate La fecha de inicio del alquiler (timestamp).
    // @param endDate La fecha de finalización del alquiler (timestamp).
    event RentalCreated(
        address indexed renter,
        uint256 indexed rentalId,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    );

    // @dev Evento que se emite cuando se devuelve un carro en alquiler.
    // @param renter La dirección del arrendatario que devuelve el carro en alquiler.
    // @param rentalId El ID único del alquiler que se devuelve.
    // @param endDate La fecha de finalización del alquiler (timestamp).
    event RentalReturned(
        address indexed renter,
        uint256 indexed rentalId,
        uint256 endDate
    );

    // @dev Modificador para verificar que un token NFT existe.
    modifier NFTExists(uint256 tokenId) {
        require(tokenId <= nftContract.totalSupply(), "El token no existe");
        _;
    }

    // @dev Modificador para verificar que el usuario que llama a la función es el propietario del token NFT.
    modifier onlyNFTOwner(uint256 tokenId) {
        require(
            nftContract.ownerOf(tokenId) != msg.sender,
            "No se puede alquilar tu propio carro"
        );
        _;
    }

    // @dev Modificador para verificar que un alquiler existe.
    modifier rentalExists(uint256 rentalId) {
        require(
            rentalId <= _rentalIdCounter.current(),
            "ID de alquiler no existe"
        );
        _;
    }

    // @dev Inicializador del contrato
    function initialize(
        address _nftContractAddress,
        address _marketplaceOwner
    ) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);

        nftContract = NFTv2_2(_nftContractAddress);
        marketplaceOwner = _marketplaceOwner;

        // @dev Comisión del 10% por defecto.
        commissionPercentage = 10;
    }

    // @dev Esta función permite al propietario establecer el porcentaje de comisión.
    // @param _commissionPercentage El porcentaje de comisión que se desea establecer. Debe estar entre 0 y 100.
    // @notice Solo el propietario del contrato puede llamar a esta función.
    function setCommissionPercentage(uint256 _commissionPercentage) external {
        require(
            _commissionPercentage <= 100,
            "Porcentaje debe estar entre 0 y 100"
        );
        commissionPercentage = _commissionPercentage;
    }

    // @dev Función externa para crear un nuevo alquiler.
    // @param tokenId El ID único del token NFT del carro que se alquilará.
    // @param startDate La fecha de inicio del alquiler (timestamp).
    // @param endDate La fecha de finalización del alquiler (timestamp).
    // @notice Los usuarios deben enviar un valor en ETH junto con la transacción para asegurar el alquiler.
    // @notice El valor enviado en ETH debe ser igual o mayor al precio del alquiler, que se calcula en función de las fechas de inicio y finalización.
    // @notice El alquiler se completará si la transacción cumple con los requisitos y si el coche está disponible para el período de tiempo solicitado.
    function createRental(
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    ) external payable whenNotPaused NFTExists(tokenId) onlyNFTOwner(tokenId) {
        require(
            endDate > startDate,
            "La fecha de inicio del alquiler debe ser menor a la fecha final"
        );

        uint256 rentalId = _rentalIdCounter.current();

        uint256 totalDays = endDate.sub(startDate).div(1 days);

        uint256 totalPrice = calculateRentalCost(tokenId, startDate, endDate);

        require(msg.value >= totalPrice, "Fondos insuficientes");

        nftContract.mintRentalToken(msg.sender);

        uint256 mintTokenId = nftContract.totalSupply() - 1;

        _rentals[rentalId] = Rental(
            tokenId,
            msg.sender,
            startDate,
            endDate,
            totalDays,
            totalPrice,
            0,
            true,
            false,
            mintTokenId
        );

        _renterRentals[msg.sender].push(rentalId);
        _carRentals[nftContract.ownerOf(tokenId)].push(rentalId);

        uint256 commission = totalPrice.mul(commissionPercentage).div(100);
        uint256 amountToOwner = totalPrice.sub(commission);

        payable(marketplaceOwner).transfer(commission);
        payable(nftContract.ownerOf(tokenId)).transfer(amountToOwner);

        nftContract.setNFTRented(tokenId, true, false);

        _rentalIdCounter.increment();

        emit RentalCreated(msg.sender, rentalId, tokenId, startDate, endDate);
    }

    // @dev Función externa para permitir que los inquilinos devuelvan un alquiler al Marketplace.
    // @param rentalId El ID único del alquiler que se quiere devolver.
    // @notice Esta función debe ser llamada por el inquilino que desea devolver el alquiler.
    // @notice La función se encargará de realizar las operaciones necesarias para completar la devolución del alquiler.
    function returnRental(uint256 rentalId) external rentalExists(rentalId) {
        Rental storage rental = _rentals[rentalId];

        require(rental.active, "El alquiler no esta activo");
        require(!rental.returned, "El alquier ya ha sido devuelto");
        // require(
        //     rental.endDate < block.timestamp,
        //     "El alquiler aun no ha finalizado"
        // );

        uint256 interest = calculateReturnInterest(rentalId);

        rental.totalInterest = interest;
        rental.active = false;
        rental.returned = true;

        // nftContract.burnRentalToken(rental.mintTokenId); // Burn deshabilitado por required en SC NFT

        nftContract.setNFTRented(rental.tokenId, false, true);

        emit RentalReturned(msg.sender, rentalId, block.timestamp);
    }

    // @dev Función pública de solo lectura para calcular el costo de un alquiler específico.
    // @param tokenId El ID único del token NFT del carro que se alquilará.
    // @param startDate La fecha de inicio del alquiler (timestamp).
    // @param endDate La fecha de finalización del alquiler (timestamp).
    // @return El costo del alquiler, calculado en base a las fechas de alquiler, precio y garantía del carro definidas por el arrendador.
    function calculateRentalCost(
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    ) public view NFTExists(tokenId) returns (uint256) {
        uint256 totalDays = endDate.sub(startDate).div(1 days);

        require(totalDays >= 0, "El periodo minimo de alquiler es de 1 dia");

        uint256 rentalPricePerDay = nftContract
            .getCar(tokenId)
            .rentalPricePerDay;
        uint256 rentalGuarantee = nftContract.getCar(tokenId).rentalGuarantee;

        uint256 totalPrice = rentalPricePerDay.mul(totalDays).add(
            rentalGuarantee
        );

        return totalPrice;
    }

    // @dev Función pública de solo lectura para calcular la cantidad de interés a devolver al arrendatario al finalizar el alquiler.
    // @param rentalId El ID único del alquiler.
    // @return La cantidad de interés a devolver al arrendatario.
    function calculateReturnInterest(
        uint256 rentalId
    ) public view returns (uint256) {
        Rental storage rental = _rentals[rentalId];
        NFTv2_2.Car memory car = nftContract.getCar(rental.tokenId);

        if (block.timestamp > rental.endDate && rental.totalInterest == 0) {
            uint256 lateDays = block.timestamp.sub(rental.endDate).div(1 days);

            uint256 interest = lateDays.mul(
                car.lateReturnInterestPerDay.div(100)
            );

            if (
                interest >= car.rentalGuarantee &&
                block.timestamp < rental.endDate
            ) return car.rentalGuarantee;

            uint256 amount = car.rentalGuarantee.sub(interest);

            return amount;
        } else {
            return 0;
        }
    }

    // @dev Función pública de solo lectura para calcular la cantidad de garantía a devolver al arrendatario al finalizar el alquiler.
    // @param rentalId El ID único del alquiler para el cual se quiere calcular la cantidad de garantía a devolver.
    // @return La cantidad de garantía a devolver al arrendatario.
    // function calculateReturnGarantee(
    //     uint256 rentalId
    // ) public view rentalExists(rentalId) returns (uint256) {
    //     uint256 interest = calculateReturnInterest(rentalId);
    //     return
    //         _rentals[rentalId].totalInterest > interest
    //             ? _rentals[rentalId].totalInterest.sub(interest)
    //             : 0;
    // }

    // @dev Función pública para que el arrendatario del carro retire la garantía del alquiler.
    // @param rentalId El ID único del alquiler para el cual se quiere retirar la garantía.
    function guaranteeRefund(uint256 rentalId) external {
        Rental storage rental = _rentals[rentalId];
        NFTv2_2.Car memory car = nftContract.getCar(rental.tokenId);

        uint256 returnAmount = calculateReturnInterest(rentalId);
        // require(returnAmount > 0, "No hay monto de devolucion para reembolsar");

        require(car.isReadyForReturn == true, "No listo para devolucion");

        require(
            msg.sender == nftContract.ownerOf(rental.tokenId) &&
                rental.returned,
            "Operacion no permitida"
        );

        payable(rental.renter).transfer(returnAmount);

        nftContract.setNFTRented(rental.tokenId, false, false);
    }

    // @dev Función pública de solo lectura para obtener información detallada sobre un alquiler específico a partir de su ID.
    // @param rentalId El ID único del alquiler del cual se quiere obtener la información.
    // @return carIndex El índice del carro asociado con el alquiler.
    // @return tokenId El ID único del token NFT del carro que se alquiló.
    // @return renter La dirección del inquilino que realizó el alquiler.
    // @return startDate La fecha de inicio del alquiler (timestamp).
    // @return endDate La fecha de finalización del alquiler (timestamp).
    // @return active Un booleano que indica si el alquiler está activo (true) o no (false).
    // @return returned Un booleano que indica si el alquiler ha sido devuelto (true) o no (false).
    function getRental(
        uint256 rentalId
    ) public view rentalExists(rentalId) returns (Rental memory) {
        return _rentals[rentalId];
    }

    // @dev Función pública de solo lectura para obtener un array de IDs de alquileres realizados por un arrendatario específico.
    // @param renter La dirección del arrendatario.
    // @return Un array de tipo uint256 que contiene los IDs de alquileres realizados por el arrendatario.
    function getRenterRentals(
        address renter
    ) public view returns (uint256[] memory) {
        return _renterRentals[renter];
    }

    // @dev Función pública de solo lectura para obtener un array de IDs de alquileres asociados con un propietario de carro específico.
    // @param carOwner La dirección del propietario del carro.
    // @return Un array de tipo uint256 que contiene los IDs de alquileres asociados con el propietario del carro.
    function getCarRentals(
        address carOwner
    ) public view returns (uint256[] memory) {
        return _carRentals[carOwner];
    }

    // @dev Función pública de solo lectura para obtener el total de alquileres registrados en el contrato del Marketplace.
    // @return El número total de alquileres registrados en el contrato.
    function getTotalRentals() public view returns (uint256) {
        return _rentalIdCounter.current();
    }

    // @dev Función para retirar los fondos del contrato
    // @notice Solo puede ser ejecutada por el administrador
    function withdrawFunds() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
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
