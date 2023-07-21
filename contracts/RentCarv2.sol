// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./NFT.sol";

contract RentCarV2 is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    // @div Librería SafeMathUpgradeable para realizar operaciones matemáticas seguras con enteros.
    using SafeMathUpgradeable for uint256;

    // @dev Seteos de roles para el contrato
    bytes32 public constant RENTER_ROLE = keccak256("RENTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    //Crea dos variables la primera es un contador para asignar indentificadores
    //y la segunda guarda el numero total de tokens NFT

    // @dev Contrato NFT al que está conectado el Marketplace.
    NFT private nftContract;

    // @dev Dirección del propietario del Marketplace.
    address private marketplaceOwner;

    // @dev Porcentaje de comisión que se aplicará al vender un NFT en el Marketplace.
    uint256 private commissionPercentage;

    //Estructura del alquiler,
    // @dev Estructura Rental para representar los atributos de un alquiler.
    struct Rental {
        uint256 carIndex;
        uint256 tokenId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        bool active;
        bool returned;
    }

    // @dev Estructura de datos para almacenar los alquileres.
    Rental[] private rentals;

    // @dev Mapeo de direcciones a listas de IDs de alquileres para los arrendatarios.
    mapping(address => uint256[]) private renterRentals;

    // @dev Mapeo de direcciones a listas de IDs de alquileres para los propietarios.
    mapping(address => uint256[]) private carRentals;

    // @dev Evento que se emite cuando se crea un nuevo alquiler.
    // @param renter La dirección del arrendatario que realiza el alquiler.
    // @param rentalId El ID único del alquiler.
    // @param carIndex El índice del carro asociado con el alquiler.
    // @param tokenId El ID único del token NFT del coche que se alquila.
    // @param startDate La fecha de inicio del alquiler (timestamp).
    // @param endDate La fecha de finalización del alquiler (timestamp).
    event RentalCreated(
        address indexed renter,
        uint256 rentalId,
        uint256 carIndex,
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
        uint256 rentalId,
        uint256 endDate
    );

    // @dev Inicializador del contrato
    function initialize(
        address _nftContractAddress,
        address _marketplaceOwner
    ) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(RENTER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);

        nftContract = NFT(_nftContractAddress);
        marketplaceOwner = _marketplaceOwner;

        // @dev Comisión del 10% por defecto.
        commissionPercentage = 10;
    }

    /*Permite al ADMIN actualizar el porcentaje de comision   
    function setCommissionPercentage(uint256 _commissionPercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
       commissionPercentage = _commissionPercentage;
    }*/

    //Esta funcion permite al arrendatario crear un nuevo alquiler
    //el arrendatario debe selecionar el automovil, e indicar las fechas de inicio y fin

    // @dev Función externa para crear un nuevo alquiler.
    // @param carIndex El índice del carro en el Marketplace que se quiere alquilar.
    // @param tokenId El ID único del token NFT del carro que se alquilará.
    // @param startDate La fecha de inicio del alquiler (timestamp).
    // @param endDate La fecha de finalización del alquiler (timestamp).
    // @notice Los usuarios deben enviar un valor en ETH junto con la transacción para asegurar el alquiler.
    // @notice El valor enviado en ETH debe ser igual o mayor al precio del alquiler, que se calcula en función de las fechas de inicio y finalización.
    // @notice El alquiler se completará si la transacción cumple con los requisitos y si el coche está disponible para el período de tiempo solicitado.
    function createRental(
        uint256 carIndex,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    ) external payable {
        require(
            startDate < endDate,
            "La fecha de inicio del alquiler debe ser menor a la fecha final"
        );
        require(tokenIdExists(tokenId), "Token ID no existe");
        require(isCarAvailable(carIndex), "Carro no disponible para alquilar");

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

        emit RentalCreated(
            msg.sender,
            rentalId,
            carIndex,
            tokenId,
            startDate,
            endDate
        );

        uint256 rentalCost = calculateRentalCost(rentalId);
        require(msg.value >= rentalCost, "Fondos insuficientes para alquilar");

        uint256 commission = rentalCost.mul(commissionPercentage).div(100);
        uint256 amountToOwner = rentalCost.sub(commission);

        payable(marketplaceOwner).transfer(commission);
        payable(nftContract.ownerOf(tokenId)).transfer(amountToOwner);
    }

    //permite al renter devolver el auto, este debe ingresar el id
    //del auto a devolver, luego se verifica que el id sea valido, para marcar como inactivo y disponible, finalmente el propietario transfiere la garantia

    // @dev Función externa para permitir que los inquilinos devuelvan un alquiler al Marketplace.
    // @param rentalId El ID único del alquiler que se quiere devolver.
    // @notice Esta función debe ser llamada por el inquilino que desea devolver el alquiler.
    // @notice La función se encargará de realizar las operaciones necesarias para completar la devolución del alquiler.
    function returnRental(uint256 rentalId) external {
        require(rentalId < rentals.length, "ID de alquiler no existe");
        Rental storage rental = rentals[rentalId];
        require(
            rental.renter == msg.sender,
            "No es el arrendatario de este alquiler"
        );
        require(rental.active, "El alquiler no esta activo");
        require(
            rental.endDate < block.timestamp,
            "El alquiler aun no ha finalizado"
        );
        rental.active = false;
        rental.returned = false;

        emit RentalReturned(msg.sender, rentalId, rental.endDate);

        uint256 returnAmount = calculateReturnGarante(rentalId);
        require(returnAmount > 0, "No hay monto de devolucion para reembolsar");

        address carOwner = nftContract.ownerOf(rental.tokenId);
        require(carOwner != address(0), "Propietario de auto invalido");
        payable(msg.sender).transfer(returnAmount);

        rental.active = true;
        rental.returned = true;

        nftContract.burnOwnerToken(rental.tokenId);
        nftContract.burnRenterToken(rental.tokenId);
    }

    /*Esta funcion calcula el costo de un alquiler en funcion de su ID de alquiler, luego
    Luego obtiene el precio, la garantia y el interes definido por el propietario asociado al 
    SC NFT*/

    // @dev Función pública de solo lectura para calcular el costo de un alquiler específico.
    // @param rentalId El ID único del alquiler para el cual se quiere calcular el costo.
    // @return El costo del alquiler, calculado en base a las fechas de alquiler, precio y garantía del carro definidas por el arrendador.
    function calculateRentalCost(
        uint256 rentalId
    ) public view returns (uint256) {
        require(rentalId < rentals.length, "ID de alquiler no existe");
        Rental storage rental = rentals[rentalId];
        (, , , , uint256 price, uint256 guarantee) = nftContract.getCar(
            rental.carIndex
        );

        uint256 rentalDuration = rental.endDate.sub(rental.startDate).div(
            86400
        );
        uint256 totalCost = price.mul(rentalDuration).add(guarantee);

        return totalCost;
    }

    //Funcion que calcula monto de devolucion

    // @dev Función pública de solo lectura para calcular la cantidad de garantía a devolver al arrendatario al finalizar el alquiler.
    // @param rentalId El ID único del alquiler para el cual se quiere calcular la cantidad de garantía a devolver.
    // @return La cantidad de garantía a devolver al arrendatario.
    function calculateReturnGarante(
        uint256 rentalId
    ) public view returns (uint256) {
        require(rentalId < rentals.length, "ID de alquiler no existe");
        Rental storage rental = rentals[rentalId];
        (, , , , uint256 guarantee, uint256 interestRate) = nftContract.getCar(
            rental.carIndex
        );

        if (rental.returned && rental.endDate >= block.timestamp) {
            return guarantee;
        } else if (rental.endDate < block.timestamp && !rental.returned) {
            uint256 lateDays = block.timestamp.sub(rental.endDate).div(86400);
            uint256 lateInterest = lateDays.mul(interestRate);
            uint256 deduction = guarantee.sub(lateInterest);
            return deduction;
        } else {
            return 0;
        }
    }

    // @dev Función privada de solo lectura para verificar si un token con el ID específico existe.
    // @param tokenId El ID del token que se quiere verificar si existe.
    // @return true si el token con el ID especificado existe, false en caso contrario.
    function tokenIdExists(uint256 tokenId) private view returns (bool) {
        uint256 totalSupply = nftContract.totalSupply();
        return tokenId < totalSupply;
    }

    // @ Función privada de solo lectura para verificar si un carro con el índice específico está disponible para alquilar.
    // @param carIndex El índice del carro que se quiere verificar.
    // @return true si el carro con el índice especificado está disponible, false en caso contrario.
    function isCarAvailable(uint256 carIndex) private view returns (bool) {
        uint256[] memory carRentalsList = carRentals[
            nftContract.ownerOf(carIndex)
        ];
        uint256 currentTimestamp = block.timestamp;

        for (uint256 i = 0; i < carRentalsList.length; i++) {
            Rental storage rental = rentals[carRentalsList[i]];

            if (rental.active && rental.carIndex == carIndex) {
                if (
                    (currentTimestamp >= rental.startDate &&
                        currentTimestamp <= rental.endDate) ||
                    (rental.startDate >= currentTimestamp &&
                        rental.startDate <= currentTimestamp) ||
                    (rental.startDate <= currentTimestamp &&
                        rental.endDate >= currentTimestamp)
                ) {
                    return false;
                }
            }
        }

        return true;
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
    )
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
        require(rentalId < rentals.length, "ID de alquiler no existe");
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

    // @dev Función pública de solo lectura para obtener un array de IDs de alquileres realizados por un arrendatario específico.
    // @param renter La dirección del arrendatario.
    // @return Un array de tipo uint256 que contiene los IDs de alquileres realizados por el arrendatario.
    function getRenterRentals(
        address renter
    ) public view returns (uint256[] memory) {
        return renterRentals[renter];
    }

    // @dev Función pública de solo lectura para obtener un array de IDs de alquileres asociados con un propietario de carro específico.
    // @param carOwner La dirección del propietario del carro.
    // @return Un array de tipo uint256 que contiene los IDs de alquileres asociados con el propietario del carro.
    function getCarRentals(
        address carOwner
    ) public view returns (uint256[] memory) {
        return carRentals[carOwner];
    }

    // @dev Función pública de solo lectura para obtener el total de alquileres registrados en el contrato del Marketplace.
    // @return El número total de alquileres registrados en el contrato.
    function getTotalRentals() public view returns (uint256) {
        return rentals.length;
    }

    // @dev Función externa utilizada por el administrador del contrato para retirar los fondos acumulados en el contrato.
    // @notice Solo el administrador del contrato con el rol DEFAULT_ADMIN_ROLE puede llamar a esta función.
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
}
