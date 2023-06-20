# GHG-chain 
The application is an example of the use of smart contracts: Product, Quality and Rating.
Tested with Ubuntu 22.04 (jammy).

## Requirements

You must have previously installed the following tools:
- [Hyperledger Besu](https://besu.hyperledger.org/en/stable/private-networks/tutorials/quickstart/)
- [node.js](https://nodejs.org/it/download/) 

From the application folder run:
```bash
npm install
```

After starting the Besu network, verify that the main node is responding in localhost port 8545, otherwise change main.js to the correct port.
Launch the application with:

```bash
npm start
```

## Operations

The initial screen of the program provides an interface where you can choose from 3 user accounts, the first of which has administrator privileges, which
can assign roles to himself and others.
There are these roles available: carrier, farmer, producer and sensor.
Multiple roles can be assigned to the same account.

After selecting the account to proceed with, one of the following can be chosen:
- Transactions
  - [Insert actor](#insert-actor)
  - [Insert quality contract](#insert-quality-contract)
  - [Insert raw material](#insert-raw-material)
  - [Insert product](#insert-product)
  - [Sensor send data](#sensor-send-data)
  - [Transfer product](#transfer-product)
  - [Complete product transfer](#complete-product-transfer)
- Calls
  - [Product ID Owner](#product-id-owner)
  - [Product ID Info](#product-id-info)
  - [Account Reputation](#account-reputation)
- Other
  - [Logout](#logout)
  - [Exit](#exit)
  
### Insert actor

Only for administrator. Permit to add roles to accounts.

### Insert quality contract

Only for administrator. Permit to enter a quality contract involving upper and low temperature bounds.

### Insert raw material

Only for producer. Permit to enter a raw material (without other products).

### Sensor send data

Only for sensor. Simulates a sensor that sends the current product temperature.

### Insert product

Only for farmer/producer. Permit to enter a product (with other products).

### Transfer product

Only for administrator. Initializes the transfer of a product to another partecipant.

### Complete product transfer

Only for partecipant setted from the previous operation. Partecipant completes the transfer of a product, with a feedback to product previous owner.

### Product ID Owner

Gets the owner account of the product.

### Product ID Info

Gets the information of a product.

### Account Reputation

Gets the reputation value of an account.

### Logout

Allows to switch accounts.

### Exit

Exit the application.

## Running Example

- All account private key (pk) could be found in GHG-Chain/QBFT-Network/genesis.json. Do not use this private key on a public blockchain; use it for testing purposes only!
- The rating and feedback values are normalized integer values between 0 and 100.

1. After starting the Hyperledger Besu network, start the application.
2. Select the administrator account and assign the roles of carrier, farmer, producer and sensor;
3. Create a quality contract with the [Insert quality contract](#insert-quality-contract) function, assign an arbitrary name and enter 5 and 10 as the minimum and maximum temperature values; 
4. Use the [Logout](#logout) function and then select the farmer account chosen in step 2;
5. Through the [Insert raw material](#insert-raw-material) command create a new raw material with an arbitrary name and GHG value, then choose the quality contract generated in step 3 and the sensor/s created in step 2;
6. Use the [Logout](#logout) function and then select the administrator account;
7. Use the [Transfer product](#transfer-product) function and transfer the product created earlier to the carrier account;
8. Use the [Logout](#logout) function and then select the carrier account;
9. With [Complete product transfer](#complete-product-transfer) function complete the product transfer with an arbitrary feedback value;
10. Repeat step 6 to step 9 but using the producer's account instead of the carrier;
11. With producer's account and [Insert product](#insert-product) function create a new product with previous created product as component;
12. Transfer this new product from producer's account to carrier's account(Repeat step 6 to step 9);
13. Use [Account Reputation](#account-reputation) function to consult reputations value of farmer, carrier and producer;
14. Use [Exit](#exit) to stop the application;
