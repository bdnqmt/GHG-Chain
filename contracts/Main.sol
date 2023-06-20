// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;
//pragma experimental SMTChecker;

import "./Account.sol";
import "./ProductManagement.sol";
import "./Rating.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/Math.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract Main is Ownable { 

    event BannedAccount(
        address trader
    );
    
    event QualityWarning(
        address productOwner,
        address sensor,
        uint productId, 
        uint qualityId,
        uint timestamp,
        uint[] values
    );

    uint public constant _REPUTATION_CALC_HISTORY_LENGTH = 10;

    mapping(uint=>uint[][]) private _productRT;

    Account private _account = new Account();    
    ProductManagement private _productManagement;    
    Rating private _rating = new Rating(this.reputationCalc, this.trustCalc);        

    constructor(
        uint maxActivities, uint maxAggregateProducts
    ) {
      _productManagement = new ProductManagement(maxActivities, maxAggregateProducts);
    }

    function addRole(string memory role, address account) 
    external onlyOwner
    {
        if (!_account.hasRole(account)) {
            _rating.createSBT(account);
        }
        _account.addRole(role, account);            
    }

    function createQuality(
      string calldata name, uint[] calldata bounds
    ) external onlyOwner returns(uint)
    {                
        return _productManagement.createQuality(name, bounds);        
    }

    function createProduct(
        string calldata name, string[] memory activities,
        uint[] memory activitiesGHG, uint[] memory products,
        uint qualityId, address[] memory sensors
    ) external returns(uint) {
        require(this.isFarmer(msg.sender)||
                this.isProducer(msg.sender), "Only farmer or producer could create material!");
        for (uint i = 0; i < sensors.length; i++) {
           require(_account.hasRoleSensor(sensors[i]), "Not valid sensor account!");           
        }        
        return _productManagement.createProduct(msg.sender, name, activities, activitiesGHG, products,
               qualityId, sensors);
    }

    function getProductLastId() external view returns(uint) {
        return _productManagement.getProductLastId();
    }

    function getProductOwner(uint productId)
    external view returns(address) {
        return _productManagement.getProductOwner(productId);
    }

    function getProductResource(uint productId)
    external view returns(Product.Resource memory) {
        return _productManagement.getProductResource(productId);
    }

    function getProductQualityExceed(uint productId)
    external view returns(uint) {
        return _productManagement.getProductQualityExceed(productId);
    }

    function getQualityBounds(uint qualityId)
    external view returns(Quality.QualityBounds memory) {
        return _productManagement.getQualityBounds(qualityId);
    }

    function getQualityLastId() external view returns(uint) {
        return _productManagement.getQualityLastId();
    }

    function getStakeholderRoles(address stakeholder) external view returns(string[] memory) {
        return _account.getAccountRoles(stakeholder);         
    }

    function getStakeholderReputation(address stakeholder)
    public view returns(uint) {
        return _rating.getLastReputation(stakeholder);         
    }

    function getStakeholderTrust(address stakeholder)
    public view returns(uint) {
        return _rating.getLastTrust(stakeholder);         
    }

    function isCarrier(address account) 
    public view returns(bool)
    {
         return _account.hasRoleCarrier(account);             
    }

    function isFarmer(address account) 
    public view returns(bool)
    {
         return _account.hasRoleFarmer(account);             
    }

    function isProducer(address account) 
    public view returns(bool) {
        return _account.hasRoleProducer(account);              
    }    

    function isValidTransfer(address from, address to) 
    public view returns(bool)
    {
        return (this.isFarmer(from) && this.isCarrier(to)) ||
               (this.isCarrier(from) && this.isProducer(to))||
               (this.isProducer(from) && this.isCarrier(to));             
    }

    function removeSensorProduct(uint productId)
    external onlyOwner
    {
       _productManagement.removeSensorProduct(productId); 
    }

    function removeRole(string calldata role, address stakeholder)
    external onlyOwner validRole(role) {
        _account.removeRolefromAccount(role, stakeholder);
    }

    function reputationCalc(
        uint[] memory ratings,
        uint[] memory,
        uint[] memory otherValues)
    external pure returns(uint)
    {  
        uint count = 0;        
        uint RTnew = 0;        
        for(uint i = 0; i< ratings.length-1; i++) {
            RTnew += ratings[i];
            count +=1;
        }
        uint RFnew = ratings[ratings.length-1];
        count +=1;
        uint sum = RTnew + RFnew;
        count += otherValues[0];
        sum += otherValues[1];
        uint average = uint(sum/count);
        return average;
    }

    function sensorSendData(uint[] calldata values) external validSensor(msg.sender) {
                   
        uint[] memory ids = _productManagement.getSensorProduct(msg.sender);
        
        for (uint i; i < ids.length; i++) {

            uint productId = ids[i];
            if (_productManagement.checkProductBound(productId, values)) {
				_productManagement.increaseProductQualityExceed(productId);
                emit QualityWarning(_productManagement.getProductOwner(productId), msg.sender,
                                    productId, _productManagement.getProductQuality(productId),
                                    block.timestamp, values);
            }
        }
    }   

    function setTransfer(address to, uint productId) 
    external onlyOwner
    {
        address from = _productManagement.getProductOwner(productId);
        require(from != to, "Source address and Destination address must be different!");
        require(this.isValidTransfer(from,to), "Only producer or trader could trade resources!");
        _productManagement.setProductTransferAddress(to, productId);           
    }
       
    function transferResource(
        uint productId,
        uint[] memory RTnew,
        uint RFnew
    )
    external {
        address to = _productManagement.getProductTransferAddress(productId);
        require(msg.sender == to, "Only designated partecipant could complete transfer!!!");
        address from = _productManagement.getProductOwner(productId);                                     
        _productManagement.setProductTransfer(from, to, productId);
        uint[] memory ratings = new uint[](RTnew.length+1);
        for(uint i = 0; i< RTnew.length; i++) {
            ratings[i] = RTnew[i];
        }
        ratings[RTnew.length] = RFnew;
        uint[] memory otherValues = new uint[](2);
        otherValues[0] = 0; //element's count
        otherValues[1] = 0; //element's sum
        //get ratings(RT + RF) history of the partecipant
        otherValues = getRatingsHistorySum(from, otherValues);
        //NFT{partecipants}(t-1)
        otherValues = getProductWorkflowHistorySum(productId, otherValues);
        _productRT[productId].push(RTnew);
        uint reputation = _rating.setReputation(from, ratings, otherValues);
        _productManagement.resetProductQualityExceed(productId);
        if (_account.checkAccountReputation(from,reputation)) {
            emit BannedAccount(from);
        }          
        _productManagement.setProductTransferAddress(address(0), productId);
    }

    function getRatingsHistorySum(
        address partecipant,
        uint[] memory otherValues
    ) internal view returns(uint[] memory)
    {
        uint i;
        uint j;
        uint[][] memory ratingsHistory = _rating.getRatings(partecipant);
        uint count = 0;        
        i = ratingsHistory.length;
        while(count < _REPUTATION_CALC_HISTORY_LENGTH && i > 0) {
            count +=1;
            i -=1;
            uint[] memory ratingsOld = ratingsHistory[i];
            for(j = 0; j< ratingsOld.length; j++) {
                otherValues[0] +=1;
                otherValues[1] += ratingsOld[j];
            }
        }
        return otherValues;
    }

    function getProductWorkflowHistorySum(
        uint productId,
        uint[] memory otherValues
    ) internal view returns(uint[] memory)
    {
        uint i;
        uint j;
        uint z;
        uint[] memory productComponent = _productManagement.getProductResource(productId).otherResourceList;
        uint[] memory productIds = new uint[](productComponent.length + 1);
        for(i = 0; i< productComponent.length; i++) {
            productIds[i] = productComponent[i];
        }
        productIds[productComponent.length] = productId;
        for(z = 0; z < productIds.length; z++) {
            for(i = 0; i< _productRT[productIds[z]].length; i++) {
                uint[] memory RTold = _productRT[productIds[z]][i];
                for(j = 0; j< RTold.length; j++) {
                    otherValues[0] +=1;
                    otherValues[1] += RTold[j];
                }
            }
        }

        return otherValues;
    }
	
    function trustCalc(
        uint[] memory,
        uint[] memory,
        uint[] memory
    )
    external pure returns(uint)
    {   
        return 0;
    }

    modifier validRole(string calldata role) {
        require(_account.isValidRole(role),"Not valid role!");
        _;
    }

    modifier validSensor(address sensor) {
        require(_account.hasRoleSensor(sensor), "Not valid sensor account!");
        _;
    }

}