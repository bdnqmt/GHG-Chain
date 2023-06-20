class Call {

    constructor(contract) {
        this.contract = contract;
    }
	
	
	getProduct(product_id) {        
        return new Promise((resolve) => {
            this.contract.methods.getProductResource(product_id).call()
		    .catch((error) => {
				console.log("Error: " + error.message);
			}
			).then((resource) => {
				resolve(resource);
			});
        });
    }
	
	getProductCurrentId() { 
        return new Promise((resolve, reject) => {
            this.contract.methods.getProductLastId().call()                
			.then((receipt) => {
				resolve(receipt);
			})
			.catch((error) => {
				console.log("Error: " + error.message);
				reject(error.message);
			});
        });
    }
	
    getProductInfo(product_id) {        
        return this.getProduct(product_id).then((resource) => {
			this.print_resource_info(resource);
		});
    }
	
    getProductOwner(product_id) {
        return new Promise((resolve) => {
            this.contract.methods.getProductOwner(product_id).call()
            .then((receipt) => {
                if (receipt !== undefined) console.log(receipt);
                resolve();
			})    
			.catch((error) => {
				console.log("Error: " + error.message);
			});                
        });
    }
	
	getProductQualityExceed(product_id) {
        
        return new Promise((resolve) => {
            this.contract.methods.getProductQualityExceed(product_id).call()
                .then((resource) => {
                    resolve(resource);
                })
				.catch((error) => {
                    console.log("Error: " + error.message);
                });
        });
    }
	
	getQuality(quality_id) { 
        return new Promise((resolve, reject) => {
            this.contract.methods.getQualityBounds(quality_id).call()                
			.then((receipt) => {
				resolve(receipt);
			})
			.catch((error) => {
				console.log("Error: " + error.message);
				reject(error.message);
			});
        });
    }
    
    getQualityCurrentId() { 
        return new Promise((resolve, reject) => {
            this.contract.methods.getQualityLastId().call()                
			.then((receipt) => {
				resolve(receipt);
			})
			.catch((error) => {
				console.log("Error: " + error.message);
				reject(error.message);
			});
        });
    }
	
	getReputation(address) { 
        return new Promise((resolve, reject) => {
            this.contract.methods.getStakeholderReputation(address).call()                
			.then((receipt) => {
				if (receipt !== undefined) console.log(receipt);
				resolve(receipt);
			})
			.catch((error) => {
				console.log("Error: " + error.message);
				reject(error.message);
			});
        });
    }
	
    getRoles(address) { 
        return new Promise((resolve, reject) => {
            this.contract.methods.getStakeholderRoles(address).call()                
			.then((receipt) => {
				resolve(receipt);
			})
			.catch((error) => {
				console.log("Error: " + error.message);
				reject(error.message);
			});
        });
    }
	
    print_resource_info(resource) {
        if (resource !== undefined) {
            console.log("---------------------------");
            const { 0: name, 1: activities_names, 2: activities_GHG, 3: product_list, 4: GHG} = resource;
            console.log("name -> " + name);
            console.log("Total GHG -> " + GHG);
            console.log("Activities list -> " + activities_names);
            console.log("Activities GHG list -> " + activities_GHG);

            if (product_list == "") {
                console.log("Components product IDs -> no one");
            }
            else {
                console.log("Components product IDs -> " + product_list);
            }
            console.log("---------------------------");
        }
    }

}

module.exports = Call;