class Send {

    constructor(contract, contractAddress, sendTransaction) {
        this.contract = contract;
		this.contractAddress = contractAddress;
		this.sendTransaction = sendTransaction;
    }

    addActor(account, actor, role) {
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.addRole(role, actor);
			this.sendTransaction(account, txnObject, this.contractAddress)
			.then(() => {
				resolve("Success");
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }
	
	createQuality(account, name, low_temperature, upper_temperature) {
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.createQuality(name, [low_temperature, upper_temperature]);
            this.sendTransaction(account, txnObject, this.contractAddress)
			.then((result) => {
				resolve("Success");
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }
	
	createProduct(account, name, activitiesNames, activitiesGHG, resourcesIDs, qualityId, sensors) {
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.createProduct(name, activitiesNames, activitiesGHG, resourcesIDs, qualityId, sensors);
            this.sendTransaction(account, txnObject, this.contractAddress)
			.then((result) => {
				resolve("Success!");
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }
	
	createRawMaterial(account, name, GHG, qualityId, sensors) {        
		let activitiesNames = ['Raw material'];
        let activitiesGHG = [GHG];
        let resourcesIDs = [];
		return this.createProduct(account, name, activitiesNames, activitiesGHG, resourcesIDs, qualityId, sensors);
    }
	
    sensorSendData(account, temperature) {
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.sensorSendData([temperature]);			
			this.sendTransaction(account, txnObject, this.contractAddress)
			.then(() => {
				return this.contract.getPastEvents("allEvents")                
				.then((receipt) => {
					console.log(receipt)
					resolve("Success");
				})
				.catch((error) => {
					console.log("Error: " + error.message);
					resolve(error.message);
				});
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }

    transferResource(account, newOwner, productId){
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.setTransfer(newOwner, productId);
            this.sendTransaction(account, txnObject, this.contractAddress)
			.then(() => {
				resolve("Success");
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }
	
	transferResourceComplete(account, productId, rt, rf){
        return new Promise((resolve) => {
            let txnObject = this.contract.methods.transferResource(productId, rt, rf);
            this.sendTransaction(account, txnObject, this.contractAddress)
			.then(() => {
				resolve("Success");
			})
			.catch((error) => {
				resolve("Error: " + error.message);
			});
        });
    }
	
}

module.exports = Send;