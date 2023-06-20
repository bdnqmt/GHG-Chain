// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;
//pragma experimental SMTChecker;

import "./Product.sol";
import "./Quality.sol";
import "./Utils.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract ProductManagement is Ownable {

    mapping(uint=>uint) private _productQuality;
    mapping(uint=>uint) private _productQualityExceed;    
    mapping(uint=>address[]) private _productSensors;
    mapping(address=>uint[]) private _sensorProducts;
    mapping(uint=>address) private _productTransfer;

    uint private _maxActivities;
    uint private _maxAggregateProducts;

    Product private _product = new Product();
    Quality private _quality = new Quality(this.checkBounds);

    constructor(
        uint maxActivities, uint maxAggregateProducts
    ) {
        require(maxActivities > 0, "Not valid max activites value!");
        require(maxAggregateProducts > 0, "Not valid max aggregate products value!");
        _maxActivities = maxActivities;
        _maxAggregateProducts = maxAggregateProducts;
    }

    function addProductSensors(address[] memory sensors, uint productId)
    internal {
        
        delete _productSensors[productId];
        
        for (uint i = 0; i < sensors.length; i++) {
          (bool exists,) = Utils.uintListFindIndex(productId,_sensorProducts[sensors[i]]);
          if (!exists) {
            _sensorProducts[sensors[i]].push(productId);
            _productSensors[productId].push(sensors[i]);
          }           
        }
    }

    function checkBounds(uint[] memory values, uint[] memory bounds)
    external pure returns(bool)
    {   
        for (uint i=0; i < values.length; i++) {
           uint j = i*2;
           uint z = j+1;
           if (bounds[j] > values[i] || bounds[z] < values[i]) {
                return true;
           }            
        }
        return false;
    }

    function checkProductBound(uint productId, uint[] calldata values)
    external view validProductId(productId) returns(bool)
    {
        uint qualityId = _productQuality[productId];
        return _quality.checkBound(qualityId, values);
    } 

    function createQuality(
      string calldata name, uint[] calldata bounds
    ) external onlyOwner returns(uint)
    {                
        Quality.QualityBounds memory qualityBounds = Quality.QualityBounds(
            name, bounds
        );        

        return _quality.create(qualityBounds);         
    }

    function createProduct(
        address producer, string calldata name, string[] memory activities,
        uint[] memory activitiesGHG, uint[] memory products,
        uint qualityId, address[] memory sensors
    ) external validQualityId(qualityId) onlyOwner returns(uint) {
        
        require(activities.length > 0 &&
		        activities.length <= _maxActivities &&
                activities.length == activitiesGHG.length, "Not valid activities number!");
        require(products.length <= _maxAggregateProducts, "Not valid aggregate products number!");
        
        uint totGHG = 0;

        Product.Resource memory resource;

        for (uint i=0; i < products.length; i++) {
            _product.isValidTokenId(products[i]);
            require(_product.ownerOf(products[i]) == producer, string.concat("Producer is not owner of: ", Strings.toString(products[i])));
            resource = _product.getResource(products[i]);
            totGHG += resource.GHG;            
        }

        for (uint i=0; i < activitiesGHG.length; i++) {
            totGHG += activitiesGHG[i];            
        }

        resource = Product.Resource(
            name,
            activities,
            activitiesGHG,
            products,
            totGHG            
        );

        uint productId = _product.create(
            resource, producer
        );

        _productQuality[productId] = qualityId;
        _productQualityExceed[productId] = 0;
        addProductSensors(sensors, productId);

        return productId;
    }

    function getProductLastId() external view returns(uint) {
        return _product.currentToken();
    }

    function getProductOwner(uint productId)
    external view validProductId(productId) returns(address)
    {
        return _product.ownerOf(productId);
    }    
    
    function getProductQuality(uint productId)
    external view returns(uint)
    { 
        return _productQuality[productId];
    }

    function getProductQualityExceed(uint productId)
    external view validProductId(productId) returns(uint)
    { 
        return _productQualityExceed[productId];
    }    

    function getProductResource(uint productId)
    external view validProductId(productId) returns(Product.Resource memory)
    {
        return _product.getResource(productId);
    }

    function getProductSensor(uint productId)
    external view validProductId(productId) returns(address[] memory)
    {
        return _productSensors[productId];
    }

    function getProductTransferAddress(uint productId) 
    external view onlyOwner validProductId(productId) returns(address)
    {
        return _productTransfer[productId];              
    }

    //Return quality bounds
    function getQualityBounds(uint qualityId)
    external view validQualityId(qualityId) returns(Quality.QualityBounds memory)
    {
        return _quality.getQualityBounds(qualityId);
    }

    function getQualityLastId()
    external view returns(uint)
    {
        return _quality.currentId();
    }
    
    function getSensorProduct(address sensor)
    external view returns(uint[] memory)
    {
       return _sensorProducts[sensor];
    }
    
    function increaseProductQualityExceed(uint productId)
    external onlyOwner validProductId(productId) returns(uint)
    {                   
        _productQualityExceed[productId] += 1;
        return _productQualityExceed[productId];
    }

    function removeSensorProduct(uint productId)
    external onlyOwner validProductId(productId) {
        require(_productSensors[productId].length > 0,"Not valid sensor's product ID!");
        address[] storage sensors = _productSensors[productId];
        for (uint i = 0; i < sensors.length; i++) {
           Utils.orderedUintListRemove(productId, _sensorProducts[sensors[i]]);           
        }
        delete _productSensors[productId];
    }

    function resetProductQualityExceed(uint productId)
    external onlyOwner
    { 
        _productQualityExceed[productId] = 0;
    }    

    function setProductTransfer(address from, address to, uint productId) 
    external onlyOwner validProductId(productId)
    {
        _product.transferFrom(from, to, productId);              
    }

    function setProductTransferAddress(address to, uint productId) 
    external onlyOwner validProductId(productId)
    {
        _productTransfer[productId] = to;              
    }
    
    modifier validProductId(uint productId) {
        require(_product.isValidTokenId(productId),"Not valid product ID!");
        _;
    }

    modifier validQualityId(uint qualityId) {
        require(_quality.isValidId(qualityId),"Not valid quality ID!");
        _;
    }   
    
}