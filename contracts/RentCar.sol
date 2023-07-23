// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./NFT.sol";

import "hardhat/console.sol";

contract RentCar is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    //Esta biblioteca , permite realizar operaciones matematicas seguras con enteros
    using SafeMathUpgradeable for uint256;
    //RENTER_ROLE representa el rol del arrendatario
    bytes32 public constant RENTER_ROLE = keccak256("RENTER_ROLE");

    //Crea dos variables la primera es un contador para asignar indentificadores
    //y la segunda guarda el numero total de tokens NFT

    NFT private nftContract;
    address private marketplaceOwner;
    uint256 private commissionPercentage;

    //Estructura del alquiler,
    struct Rental {
        uint256 carIndex;
        uint256 tokenId;
        address renter;
        uint256 startDate;
        uint256 endDate;
        bool active;
        bool returned;
        bool readyForRefund;
    }
    //Se declara variables privadas para almacenar los alquileres en forma de matris
    //tambies los indices de los alquileres de cada renter y cada prop
    Rental[] private rentals;
    mapping(address => uint256[]) private renterRentals;
    mapping(address => uint256[]) private carRentals;
    mapping(uint256 => bool) private carAvailability; 
    // Variable para rastrear la disponibilidad de los automóviles

    //se defien eventos para la creacion de alquileres y devolucion de los auto
    event RentalCreated(
        address indexed renter,
        uint256 rentalId,
        uint256 carIndex,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    );
    event RentalReturned(
        address indexed renter,
        uint256 rentalId,
        uint256 endDate
    );

    //Inicializa el SC y configura los roles
    function initialize(
        address _nftContractAddress,
        address _marketplaceOwner
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //_setupRole(RENTER_ROLE, msg.sender);

        nftContract = NFT(_nftContractAddress);
        marketplaceOwner = _marketplaceOwner;
        commissionPercentage = 10; //10% de comision
    }

    //Se especifica que solo el ADMIN ROLE puede autorizar actualizaciones
    function _authorizeUpgrade(
        address
    ) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /*Permite al ADMIN actualizar el porcentaje de comision   
    function setCommissionPercentage(uint256 _commissionPercentage) external onlyRole(DEFAULT_ADMIN_ROLE) {
       commissionPercentage = _commissionPercentage;
    }*/

    //Esta funcion permite al arrendatario crear un nuevo alquiler
    //el arrendatario debe selecionar el automovil, e indicar las fechas de inicio y fin
    function createRental(
        uint256 carIndex,
        uint256 tokenId,
        uint256 startDate,
        uint256 endDate
    ) external payable {
        require(startDate < endDate, "Datos invalidos");
        require(tokenIdExists(tokenId), "Token ID no existe");
        require(isCarAvailable(carIndex), "Carro no disponible para alquiler");

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

        //emite el evento para noftificar la creacion del alquiler
        emit RentalCreated(
            msg.sender,
            rentalId,
            carIndex,
            tokenId,
            startDate,
            endDate
        );

        uint256 rentalCost = calculateRentalCost(rentalId);
        require(msg.value >= rentalCost, "Insufficientes fondos");

        uint256 commission = rentalCost.mul(commissionPercentage).div(100);
        uint256 amountToOwner = rentalCost.sub(commission);
        //se transifere la comision al owner del marketplace y se paga al prop
        payable(marketplaceOwner).transfer(commission);
        payable(nftContract.ownerOf(tokenId)).transfer(amountToOwner);
    }

    //permite al renter devolver el auto, este debe ingresar el id
    //del auto a devolver, luego se verifica que el id sea valido, para marcar como inactivo y disponible, finalmente el propietario transfiere la garantia
    function returnRental(uint256 rentalId) external payable {
        require(rentalId < rentals.length, "ID de alquiler invalido");
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
        
        //Emite el evento RentalRetur para nofificar la finalizacion del alquiler
        emit RentalReturned(msg.sender, rentalId, rental.endDate);

        rental.active = false; // Cambia a false para marcar el alquiler como finalizado
        rental.returned = true;
        carAvailability[rental.carIndex] = true;
        rental.readyForRefund = true;

         }

  
    function refundGuarantee(uint256 rentalId) external {

         uint256 returnAmount = calculateReturnGarante(rentalId);
         
        require(returnAmount > 0, "No hay monto de devolucion para reembolsar");

         Rental storage rental = rentals[rentalId];
        // Validar que msg.sender es el dueño del NFT
        require(msg.sender == nftContract.ownerOf(rental.tokenId));

        // Validar marcado listo para devolución 
        require(rental.readyForRefund == true, "No listo para devolucion");

        // Transferir garantía a arrendatario
        payable(rental.renter).transfer(returnAmount);

        // // Quemar el NFT de alquiler
        nftContract.burnOwnerToken(rental.tokenId); // Quemar el token del propietario del auto
        nftContract.burnRenterToken(rental.tokenId); // Quemar el token del arrendatario

        }

    /*Esta funcion calcula el costo de un alquiler en funcion de su ID de alquiler, luego
    Luego obtiene el precio, la garantia y el interes definido por el propietario asociado al 
    SC NFT*/

    function calculateRentalCost(
        uint256 rentalId
    ) public view returns (uint256) {
        require(rentalId < rentals.length, "ID de alquiler invalido");
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

    function calculateReturnGarante(
        uint256 rentalId
    ) public view returns (uint256) {
        require(rentalId < rentals.length, "ID de alquiler invalido");
        Rental storage rental = rentals[rentalId];
        (, , , , uint256 guarantee, uint256 interestRate) = nftContract.getCar(
            rental.carIndex
        );

        if (!rental.returned && rental.endDate >= block.timestamp) {
            return guarantee; // Devolución de garantía completa si se devuelve a tiempo y sin daños
        } else if (rental.endDate < block.timestamp && !rental.returned) {
            uint256 lateDays = block.timestamp.sub(rental.endDate).div(86400);
            uint256 lateInterest = lateDays.mul(interestRate);
            if (lateInterest >= guarantee) return guarantee;
            uint256 deduction = guarantee.sub(lateInterest); // Cálculo de la deducción basada en el interés y la garantía
            return deduction; // Devolución de garantía con deducción por días de retraso
        } else {
            return 0; // No hay devolución de garantía si aún no se ha cumplido la fecha de finalización
        }
    }
    /*/Verifica si un token NFT con el ID proporcionado existe, utiliza la funcion totalSupply del SC NFT para 
    obtener el numero total de tokens o autos*/
    function tokenIdExists(uint256 tokenId) private view returns (bool) {
        uint256 totalSupply = nftContract.totalSupply();
        return tokenId < totalSupply;
    }

    /* Verifica si el auto esta disponible para alquiler, obteniendo la lista de alquileres 
    asociados al dueño, itera los alquileres y verifica si existen autos disponibles para
    el rango de fecha ingresado por el arrendatario */

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

    /* esta funcion devuelve la informacion de un alquiler dado, verifica 
    si el alquiler es valido y luego accede a la estructura de datos de alquiler correspondiente
    para obtener la informacion del alquiler  */
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
            bool returned,
            bool readyForRefund
        )
    {
        require(rentalId < rentals.length, "ID de alquiler invalido");
        Rental storage rental = rentals[rentalId];
        return (
            rental.carIndex,
            rental.tokenId,
            rental.renter,
            rental.startDate,
            rental.endDate,
            rental.active,
            rental.returned,
            rental.readyForRefund
        );
    }

    //devuelve el indice del arrendatario, como una matris de alquileres correspondientes.
    function getRenterRentals(
        address renter
    ) public view returns (uint256[] memory) {
        return renterRentals[renter];
    }

    //devuelve el indice del propietario, como una matres de alquileres correspondientes.
    function getCarRentals(
        address carOwner
    ) public view returns (uint256[] memory) {
        return carRentals[carOwner];
    }

    //Devuelve el numero total de alquileres registrados en el contrato
    function getTotalRentals() public view returns (uint256) {
        return rentals.length;
    }

    //Permite al administrador al owner del marketplace retirar los fondos acumulados en el contrato
    function withdrawFunds() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}