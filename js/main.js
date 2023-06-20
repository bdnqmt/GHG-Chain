const CALL = require("./call");
const CONTRACT_NAME = 'Main';
const CONTRACT_PATH = "./contracts/";
const FORM = require("./form");
const MAX_PRODUCT_ACTIVITIES = 5;
const MAX_PRODUCT_AGGREGATE = 5;
const MODULES_PATH = "../node_modules/";
const ROLE_ADMIN = 'admin';
const ROLE_CARRIER = 'carrier';
const ROLE_FARMER = 'farmer';
const ROLE_PRODUCER = 'producer';
const ROLE_SENSOR = 'sensor';
const ROLES_LIST = [ROLE_CARRIER, ROLE_FARMER, ROLE_PRODUCER, ROLE_SENSOR];
const SEND = require("./send");

const PATH = require(MODULES_PATH + 'path');
const WEB3 = require(MODULES_PATH + 'web3');

const boxen = require(MODULES_PATH + 'boxen');
const contractAbiPath = PATH.resolve(CONTRACT_PATH + CONTRACT_NAME + '.abi');
const contractBinPath = PATH.resolve(CONTRACT_PATH, CONTRACT_NAME + '.bin');
const contractJsonPath = PATH.resolve(CONTRACT_PATH, CONTRACT_NAME + '.json');
const chalk = require(MODULES_PATH + 'chalk');
const clear = require(MODULES_PATH + 'clear');
const figlet = require(MODULES_PATH + 'figlet');
const fs = require(MODULES_PATH + 'fs-extra');
const web3 = new WEB3('http://localhost:8545');

let actors = [
	'0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73',
	'0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
	'0xf17f52151EbEF6C7334FAD080c5704D77216b732',
	'0x03Dd24EE515e6c74cE6EA24Ea94aaC55547e5044',
	'0x6d832866fB72F5f78AE7a4B7cddf1721E8343094',
	'0xE6aBF89FCEB42Cfb5F581550A958e2D364375eF2',
	'0x1180b3f981ceb70e2E39e0EEdB0c1C0A1a1e0eB4',
];
let buyer = undefined;
let call = undefined;
let contract = undefined;
let contractAddress = undefined;
let contractJson = undefined;
let errorMsg = "";
let lastQualityId = undefined;
let qualityContracts = [];
let carriers = undefined;
let farmers = undefined;
let producers = undefined;
let send = undefined;
let sensors = undefined;

/////////////////////////////

function startInterface(){
clear();
console.log(
    chalk.green(
        figlet.textSync('GHG-Chain', { horizontalLayout: 'full' })
    )

);

const greeting = chalk.white.bold("Welcome, press CTRL+C to exit!");
const boxenOptions = {
    borderStyle: "double",
    backgroundColor: "black"
};

console.log(boxen(greeting, boxenOptions));
console.log();
console.log();
}

const boxenStyle = {
    borderStyle: "round",
    backgroundColor: "#00722e"
};

async function getLastQualityId() {	
    return await call.getQualityCurrentId();
}

async function getQualityContracts(lastQualityId) {	
    let qualityContracts = [];
	for (let i = 1; i <= lastQualityId; i++) {
		let bound = await call.getQuality(i);
        qualityContracts.push({
          name: bound[0] + ' temperature interval: '+ bound[1],
          value: i,
        });
    }
    return qualityContracts;
}

async function getActorsPermissions() {
    let permissions = [];	
    for (let i = 0; i < actors.length; i++) {
		if (i === 0) {			
			permissions = permissions.concat([[ROLE_ADMIN]]);
		} else {
			permissions = permissions.concat([[]]);
		}
		if (call !== undefined) {
			let result = await call.getRoles(actors[i]);
			if (result.length > 0) {				
				permissions[i] = permissions[i].concat(result);
			}
		}
		permissions[i].sort();		
	}
	return permissions;
}

function checkPermissions(role, permissions){
	for(let i = 0; i < permissions.length; i++)
      if(permissions[i] === role) return true;
    return false;
}

async function checkProductInput(permissions, account, accountIndex) {
    permissions = await getActorsPermissions();
    if (!checkPermissions(ROLE_FARMER, permissions[accountIndex]) &&
	    !checkPermissions(ROLE_PRODUCER, permissions[accountIndex])){      
	  return "Unauthorized";
    }
    lastQualityId = await getLastQualityId();
    if (lastQualityId <= 0){
        return "There are no quality contract instance!";
    }
    qualityContracts = await getQualityContracts(lastQualityId);                
    sensors = getRuoloList(ROLE_SENSOR, actors, permissions);
    if (sensors.length <= 0){
        return "There are no sensors";
    }
    return "";
}

function getBuyer(actors, permissions){
	carriers = getRuoloList(ROLE_CARRIER, actors, permissions);
	farmers = getRuoloList(ROLE_FARMER, actors, permissions);
	producers = getRuoloList(ROLE_PRODUCER, actors, permissions);    
    return Array.from(new Set([...carriers, ...farmers, ...producers]));
}

function getProductSensor(sensors, product){
	let productSensors = [];
	for (let i = 1; i <= Math.min(FORM.SENSOR_MAX_NUMBER, sensors.length); i++) {
		productSensors = productSensors.concat(product['sensor_' + i]);
	}
    return productSensors;
}

function getRuoloList(role, actors, actorsPermissions){
    list = [];
	actorsPermissions.forEach((actorPermissions, index) => {
		if (checkPermissions(role, actorPermissions)) {
			list.push(actors[index]);
		}
	});
	return list;
}

function loop(permissions, account, accountIndex) {
    
	function jump() {
        console.log("--------------------");
        console.log("--------------------");
        loop(permissions, account, accountIndex);
    }
	
	FORM.form_op().then(async function (operation) {
        console.log();
        console.log(boxen("You have selected: " + operation.op, boxenStyle));
        console.log();

        switch (operation.op) {
            case "Insert actor":
                permissions = await getActorsPermissions();
                if (!checkPermissions(ROLE_ADMIN, permissions[accountIndex])){
                    console.log(boxen(chalk.white.bold("Unauthorized"), boxenStyle));
					jump();
                    break;
                }				
                FORM.form_actor_ins(actors, permissions, ROLES_LIST).then(async function (actor_ins) {
                    let actor = actor_ins.account.substring(0, actor_ins.account.indexOf(' '));
                    console.log(boxen(await send.addActor(account, actor, actor_ins.role), boxenStyle));
					jump();
                });
                break;
				
			case "Insert quality contract":
                permissions = await getActorsPermissions();
                if (!checkPermissions(ROLE_ADMIN, permissions[accountIndex])){
                    console.log(boxen(chalk.white.bold("Unauthorized"), boxenStyle));
					jump();
                    break;
                }				
                FORM.form_quality().then(async function (quality) {
                    console.log(
						boxen(
						  await send.createQuality(
							account,
							quality.name,
							quality.low_temperature,
							quality.upper_temperature
						  ),
						  boxenStyle
					    )
					);
					jump();														
                });
                break;

            case "Insert raw material":                
                errorMsg = await checkProductInput(permissions, account, accountIndex);
                if (errorMsg !== ""){
                    console.log(boxen(chalk.white.bold(errorMsg), boxenStyle));
					jump();
                    break;
                }                
                FORM.form_raw_material(qualityContracts, sensors).then(async function (raw_material) {
					let productSensors = getProductSensor(sensors, raw_material);
                    console.log(boxen(await send.createRawMaterial(account, raw_material.name, raw_material.GHG,
						raw_material.quality, productSensors), boxenStyle));
					console.log(boxen("Product ID: " + await call.getProductCurrentId(), boxenStyle));
					jump();
                });
                break;
			case "Sensor: send data":
				permissions = await getActorsPermissions();
                if (!checkPermissions(ROLE_SENSOR, permissions[accountIndex])){
                    console.log(boxen(chalk.white.bold("Unauthorized"), boxenStyle));
					jump();
                    break;
                }				
				FORM.form_sensor().then(async function (data) {
                    console.log(boxen(await send.sensorSendData(account, data.temperature), boxenStyle));
					jump();					
                });
				break;
            case "Insert product":
                errorMsg = await checkProductInput(permissions, account, accountIndex);
                if (errorMsg !== ""){
                    console.log(boxen(chalk.white.bold(errorMsg), boxenStyle));
					jump();
                    break;
                }
                FORM.form_pre_product().then((pre_product) => {
                    FORM.form_product(qualityContracts, sensors, pre_product.activities_number,
                        pre_product.resource_number).then(async function (product) {
                            
						let activitiesNames = [];
						let activitiesGHG = [];
						let resourcesIDs = [];

						for (let i = 0; i < pre_product.activities_number; i++) {
							activitiesNames = activitiesNames.concat(product["activity_name_" + i]);
							activitiesGHG = activitiesGHG.concat(product["GHG_activity_number_" + i]);
						}

						for (let i = 0; i < pre_product.resource_number; i++) {
							resourcesIDs = resourcesIDs.concat(product["resource_" + i]);
						}
						
						let productSensors = getProductSensor(sensors, product);

						console.log(
							boxen(
								await send.createProduct(account, product.name, activitiesNames,
									activitiesGHG, resourcesIDs, product.quality, productSensors
								),boxenStyle
							)
						);
						console.log(boxen("Product ID: " + await call.getProductCurrentId(), boxenStyle));						
						jump();
                    });
                });
                break;

            case "Transfer product":
                permissions = await getActorsPermissions();
                if (!checkPermissions(ROLE_ADMIN, permissions[accountIndex])){
                    console.log(boxen(chalk.white.bold("Unauthorized"), boxenStyle));
                    jump();
                    break;
                }
				buyer = getBuyer(actors, permissions);				
                if (buyer.length <= 0){
                    console.log(boxen(chalk.white.bold("There are no food suppy chain partecipant"), boxenStyle));
                    jump();
                    break;
                }                
                FORM.form_transfer(buyer).then(async function (transfer) {
                    console.log(boxen(await send.transferResource(account, transfer.account, transfer.productID), boxenStyle));
                    jump();
                });
                break;
			
			case "Complete product transfer":
                permissions = await getActorsPermissions();
                if (!checkPermissions(ROLE_PRODUCER, permissions[accountIndex]) &&
				    !checkPermissions(ROLE_CARRIER, permissions[accountIndex])
				   ){
                    console.log(boxen(chalk.white.bold("Unauthorized"), boxenStyle));
                    jump();
                    break;
                }             
                FORM.form_transfer2().then(async function (transfer) {					
					let mockSensorRating1 = 80;
					let mockSensorRating2 = 90;
					let mockSensorRating3 = 100;
					let mockTemperatureRegulatorRating = 100;
					let mockTransportQualityRating = 80;					
					let resource = await call.getProduct(transfer.productID);
                    console.log(
					    boxen(await send.transferResourceComplete(
								account,
								transfer.productID,
								[mockTemperatureRegulatorRating,
								 mockSensorRating1, mockSensorRating2, mockSensorRating3,
								 mockTransportQualityRating],
								transfer.feedback
							  ),
						      boxenStyle
							  ));
                    jump();
                });
                break;

            case "Product ID Owner":
                FORM.form_product_id().then(async function (product) {

                    await call.getProductOwner(product.productID);
                    jump();
                });
                break;

            case "Product ID Info":
                FORM.form_product_id().then(async function (product) {

                    await call.getProductInfo(product.productID);
                    jump();
                });
                break;
				
			case "Account Reputation":
			    permissions = await getActorsPermissions();
				buyer = getBuyer(actors, permissions);				
                if (buyer.length <= 0){
                    console.log(boxen(chalk.white.bold("There are no food suppy chain partecipant"), boxenStyle));
                    jump();
                    break;
                } 
                FORM.form_account2(buyer).then(async function (account) {

                    await call.getReputation(account.account);
                    jump();
                });
                break;

            case "Logout":
                execute();
                break;

            case "Exit":
                process.exit(1);
        }

    });
}

function initCallSend() {	
	call = new CALL(contract);
	send = new SEND(contract, contractAddress, sendTransaction);
}

const sendTransaction = async function(account, txnObject, to = undefined) {
	return web3.eth.getChainId()
	.then((chainId) => {	
		return web3.eth.getTransactionCount(account.address)
		.then((nonce) => {
			let txn = Object.assign({}, {
				chainId: chainId,
				gasPrice: "0x0",
				gas: "0x1fffffffffffff"
			});
			txn.from = account.address;
			if (to !== undefined) {
				txn.to = to;
			}
			txn.nonce = nonce;
			txn.data = txnObject.encodeABI();
			return web3.eth.accounts.signTransaction(txn, account.privateKey)
			.then((signedTx) => {
				console.log("sending the signed txn");
				return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
			})
		});
	});
}

const deployContract = async function(account) {   
	const abi = JSON.parse(fs.readFileSync(contractAbiPath));  
	const bin = fs.readFileSync(contractBinPath);
	const bytecode = '0x'+ bin;
	let contractData = Object.assign({}, {
		data: bytecode,
		arguments: [MAX_PRODUCT_ACTIVITIES, MAX_PRODUCT_AGGREGATE]
	});		
	const contract = new web3.eth.Contract(abi);  
	const txnObject = contract.deploy(contractData);  
	return sendTransaction(account, txnObject)
	.then((receiptTX) => {
		contractAddress = receiptTX.contractAddress;
		console.log('Contract deployed at ' + contractAddress);
		const artifact = JSON.stringify({ abi, bytecode, contractAddress}, null, 2);
		fs.writeFileSync(contractJsonPath, artifact);
		return new web3.eth.Contract(abi, contractAddress);
	});
}

async function execute(boolDeploy = false){
    let permissions = await getActorsPermissions();
    FORM.form_account(actors, permissions).then((selected) => {
        let address = selected.account.substring(0, selected.account.indexOf(' '));
        let accountIndex = 0;
        for (let i = 0; i < actors.length; i++) {
            if (address === actors[i]) {
                accountIndex = i;
			}
        }
        console.log("You have select account address: " + address);
		account = web3.eth.accounts.privateKeyToAccount(selected.pk);
		if (account.address !== address) {
			console.log(boxen(chalk.white.bold("Wrong private key!"), boxenStyle));
			process.exit(1);
		}
		if(boolDeploy) {
			if (checkPermissions(ROLE_ADMIN, permissions[accountIndex])) {
				deployContract(account).then((result) => {
					contract = result;
					initCallSend();
					loop(permissions, account, accountIndex);
				});	
			} else {
				console.log(boxen(chalk.white.bold("Select admin account to deploy contract!"), boxenStyle));
				process.exit(1);
			}
		} else {
			loop(permissions, account, accountIndex);
		} 
    });
}

startInterface();
contractJson = JSON.parse(fs.readFileSync(contractJsonPath));
web3.eth.getCode(contractJson.contractAddress).then((code) => {	
	if (code !== '0x') {
		contract = new web3.eth.Contract(contractJson.abi, contractJson.contractAddress);
		contractAddress = contractJson.contractAddress;
		initCallSend();
		execute();		
	} else {
	   execute(true);
	}
});