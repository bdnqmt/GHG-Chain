// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;
//pragma experimental SMTChecker;

import "./Utils.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Account is Ownable {
    
    mapping(address=>string[]) private _accountsRoles;
    mapping(address=>uint) private _reputationMissCounter;    

    uint public constant _REPUTATION_MIN_THRESHOLD = 40;
    uint public constant _THRESHOLD_COUNTER = 30;
    string public constant _CARRIER_ROLE = "carrier";
    string public constant _FARMER_ROLE = "farmer";
    string public constant _PRODUCER_ROLE = "producer";
    string public constant _SENSOR_ROLE = "sensor";    
    string[] private _roles = [_CARRIER_ROLE, _FARMER_ROLE, _PRODUCER_ROLE, _SENSOR_ROLE]; 

    function addRole(string calldata role, address account) 
    external onlyOwner validRole(role) {
        require(
            !hasRole(role, account),
            "Account already has this role!!!"
            );
        _accountsRoles[account].push(role);                
    }    

    function checkAccountReputation(address account, uint reputation)
    external onlyOwner returns(bool) {
        if (reputation < _REPUTATION_MIN_THRESHOLD) {
            _reputationMissCounter[account]+=1;
        } 
        if (_reputationMissCounter[account] > _THRESHOLD_COUNTER) {
            _reputationMissCounter[account] = 0;
            Utils.stringListRemove(_CARRIER_ROLE, _accountsRoles[account]);
            Utils.stringListRemove(_FARMER_ROLE, _accountsRoles[account]);
            Utils.stringListRemove(_PRODUCER_ROLE, _accountsRoles[account]);
            Utils.stringListRemove(_SENSOR_ROLE, _accountsRoles[account]);            
            return true;
        }        
        return false;
    }

    function getAccountRoles(address account)
    external view returns(string[] memory) {        
        return _accountsRoles[account];
    }

    function getRoles()
    external view returns(string[] memory) {        
        return _roles;
    }

    function hasRole(address account)
    external view returns(bool) {        
        return _accountsRoles[account].length > 0;
    }

    function hasRole(string memory role, address account)
    public view validRole(role) returns(bool)
    {
        return Utils.stringListExists(role, _accountsRoles[account]);
    }

    function hasRoleCarrier(address account)
    external view returns(bool)
    {
        return hasRole(_CARRIER_ROLE, account);
    }

    function hasRoleFarmer(address account)
    external view returns(bool)
    {
        return hasRole(_FARMER_ROLE, account);
    }

    function hasRoleProducer(address account)
    external view returns(bool)
    {
        return hasRole(_PRODUCER_ROLE, account);
    }

    function hasRoleSensor(address account)
    external view returns(bool)
    {
        return hasRole(_SENSOR_ROLE, account);
    }

    function isValidRole(string memory role)
    public view returns(bool) {
        return Utils.stringListExists(role, _roles);
    }

    function removeRolefromAccount(string calldata role, address account)
    external onlyOwner validRole(role) {
        Utils.stringListRemove(role, _accountsRoles[account]);
    }    
    
    modifier validRole(string memory role) {
        require(isValidRole(role),"Not valid role!");
        _;
    }
}