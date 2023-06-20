const MODULES_PATH = "../node_modules/";
const inquirer = require(MODULES_PATH + 'inquirer');

const SENSOR_MAX_NUMBER = 3;

const account_choices = function(address, permissions) {
    let choices = [];
	for (let i = 0; i < address.length; i++) {
		choices.push(address[i] + " -> [ " + permissions[i] + " ]");
	}
	return choices;
}

const sensor_choices = function(product, sensors) {
	for (let i = 1; i <= Math.min(sensors.length, SENSOR_MAX_NUMBER); i++) {
        let sensor = [{
            name: 'sensor_' + i,
            type: 'rawlist',
            message: 'Choice sensor ' + i + ' account: ',
            choices: sensors,
        }];
        product = product.concat(sensor);
    }
	return product;
}

const valid_name = function(value) {
    let reg = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (reg.test(value)) {
        return 'Insert only numbers and letters';
    }
    if (value.length > 0 && value.length <= 32) {
        return true;
    } else {
        return 'Require at least one chars and max 32 length!';
    }
}

const valid_pk = function(value) {
    let reg = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if (reg.test(value)) {
        return 'Insert only numbers and letters';
    }
    if (value.length === 64) {
        return true;
    } else {
        return 'PK require 64 chars';
    }
}

const valid_rating = function(value) {
    let reg = /^\d+$/;
    let numero = parseInt(value);
    
	if (reg.test(value) && !isNaN(numero) && numero >= 0 && numero <= 100) {
        return true;
    } else {
        return 'Insert a value between 0 and 100';
    }
}


const valid_id = function(value) {
    let reg = /^\d+$/;
    let numero = parseInt(value);
    if (reg.test(value) && !isNaN(numero) && numero > 0 && numero < Math.pow(2, 256) - 1) {
        return true;
    } else {
        return 'Insert a positive 256 bit integer!';
    }
}

const valid_GHG = function(value) {
    let reg = /^\d+$/;
    let numero = parseInt(value);
    
	if (reg.test(value) && !isNaN(numero) && numero > 0 && numero < 1000) {
        return true;
    } else {
        return 'Insert a positive integer between 1 and 1000';
    }
}


const valid_low_temperature = function(value) {
    if (parseInt(value) === 0) {
		return true;
	} 
	else {
        return valid_GHG(value);
    }
}

const valid_upper_temperature = function(value, answers) {
    let result = valid_low_temperature(value);
    if (result) {
        if (parseInt(value) >= parseInt(answers['low_temperature']) ) {
			return true;
		} else {
			return 'Insert a temperature >= ' + answers['low_temperature'];
		}
    }	
	return result;
}


exports.form_actor_ins = function (address, permissions, roles) {

    const actor_ins = [
        {
            type: 'rawlist',
            name: "account",
            message: "Select account to assign role to: ",
            choices: account_choices(address, permissions),
        },
        {
            type: 'rawlist',
            name: "role",
            message: "Select role: ",
            choices: roles,
        }
    ];
    return inquirer.prompt(actor_ins);
};

///// QUALITY CONTRACT /////

exports.form_quality = function () {
	const quality = [
        {
            name: 'name',
            type: 'input',
            message: 'Quality contract name: ',
            validate: valid_name
        },
		{
            name: 'low_temperature',
            type: 'input',
            message: 'Low temperature: ',
            validate: valid_low_temperature
        },
        {
            name: 'upper_temperature',
            type: 'input',
            message: 'Upper Temperature: ',
            validate: valid_upper_temperature
        }
    ];
    return inquirer.prompt(quality);
};

exports.form_raw_material = function (quality, sensors) {
	let raw_material = [
        {
            name: 'name',
            type: 'input',
            message: 'Raw material name: ',
            validate: valid_name
        },
        {
            name: 'GHG',
            type: 'input',
            message: 'GHG value: ',
            validate: valid_GHG
        },		
        {
            name: 'quality',
            type: 'rawlist',
            message: 'Choice product quality: ',
            choices: quality,
        }
    ];
	
	raw_material = sensor_choices(raw_material, sensors);
	
    return inquirer.prompt(raw_material);
};

exports.form_pre_product = function () {
    const pre_product = [
        {
            name: 'resource_number',
            type: 'input',
            message: 'Number of resource to complete the product: ',
            validate: function (value) {
                let reg = /^\d+$/;
                let numero = parseInt(value);
                
				if (reg.test(value) && !isNaN(numero) && numero > 0 && numero < 5) {
                    return true;
                } else {
                    return 'Insert a number between 1 and 5';
                }
            }
        },

        {
            name: 'activities_number',
            type: 'input',
            message: 'Number of activities to complete the product: ',
            validate: function (value) {
                let reg = /^\d+$/;
                let numero = parseInt(value);
                
                if (reg.test(value) && !isNaN(numero) && numero > 0 && numero < 5) {
                    return true;
                } else {
                    return 'Insert a number between 1 and 5';
                }
            }
        }
    ];
    return inquirer.prompt(pre_product);
};

exports.form_product = function (quality, sensors, activities_number, resource_number) {

    let product = [
        {
            name: 'name',
            type: 'input',
            message: 'Product name: ',
            validate: valid_name
        },
        {
            name: 'quality',
            type: 'rawlist',
            message: 'Choice product quality: ',
            choices: quality,
        }
    ];
	
	product = sensor_choices(product, sensors);

    for (let i = 0; i < activities_number; i++) {

        let activity = [{
            name: 'activity_name_' + i,
            type: 'input',
            message: 'Name activity number ' + i + ": ",
            validate: valid_name
        },

        {
            name: 'GHG_activity_number_' + i,
            type: 'input',
            message: 'GHG activity number ' + i + ": ",
            validate: valid_GHG
        }];


        product = product.concat(activity);
    }



    for (let i = 0; i < resource_number; i++) {

        resource = {
            name: 'resource_' + i,
            type: 'input',
            message: 'Product ID number_' + i + ": ",
            validate: valid_id
        };
        product = product.concat(resource);
    }

    return inquirer.prompt(product);
};

///// SENSORS SEND DATA /////

exports.form_sensor = function () {
	const sensor_data = [       
		{
            name: 'temperature',
            type: 'input',
            message: 'Insert temperature value: ',
            validate: valid_low_temperature
        }
    ];
    return inquirer.prompt(sensor_data);
};

///// TRANSFER/////

exports.form_transfer = function (buyer) {
    const transfer = [
        {
            type: 'rawlist',
            name: "account",
            message: "Select account to transfer product to: ",
            choices: buyer,
        },
        {
            type: 'input',
            name: "productID",
            message: "Insert product ID to transfer: ",
            validate: valid_id
		}
    ];
    return inquirer.prompt(transfer);
};

exports.form_transfer2 = function () {
    const transfer = [
        {
            type: 'input',
            name: "productID",
            message: "Insert product ID to transfer: ",
            validate: valid_id},
		{
            type: 'input',
            name: "feedback",
            message: "Insert feedback: ",
            validate: valid_rating
		}
    ];
    return inquirer.prompt(transfer);
};


//////////////////////////// CALLS ////////////////////////////////


exports.form_product_id = function () {
    const product =
    {
        name: 'productID',
        type: 'input',
        message: 'Insert product ID: ',
        validate: valid_id
    };
    return inquirer.prompt(product);
};

exports.form_op = function () {
    const op_list = {
		name: "op",
        type: 'rawlist',        
        message: "Select operation: ",
        pageSize: 14,
        choices: [
		    new inquirer.Separator("-----Transactions-----"),
		    "Insert actor", "Insert quality contract", "Insert raw material", "Sensor: send data",
			"Insert product", "Transfer product",
			"Complete product transfer",
			new inquirer.Separator("-----Calls-----"),
            "Product ID Owner",
			"Product ID Info",
			"Account Reputation",
			new inquirer.Separator("-----Other-----"),
			"Logout", "Exit"],
        default: "Insert actor"
    };
    return inquirer.prompt(op_list);
};


///// ACCOUNT /////

exports.form_account = function (address, permissions) {
    const account = [{
        type: 'rawlist',
        name: "account",
        message: "Select account: ",
        choices: account_choices(address, permissions),
    },
	{
		name: 'pk',
        type: 'password',
        message: "Insert private key: ",
        validate: valid_pk,
	}];
    return inquirer.prompt(account);
};

exports.form_account2 = function (buyer) {
    const account = [{
        type: 'rawlist',
        name: "account",
        message: "Select account: ",
        choices: buyer,
    }];
    return inquirer.prompt(account);
};

exports.SENSOR_MAX_NUMBER = SENSOR_MAX_NUMBER;
exports.valid_GHG = valid_GHG;
exports.valid_id = valid_id;
exports.valid_name = valid_name;