// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract Quality is Ownable {
    
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    function(uint[] memory, uint[] memory) external pure returns(bool) _checkBounds;

    struct QualityBounds {
      string name;
      uint[] bounds;
    }

    mapping(uint=>QualityBounds) private _qualitiesBounds;

    constructor(function(uint[] memory, uint[] memory) external pure returns(bool) checkBounds)
    {
        _checkBounds = checkBounds;
    }
    
    function checkBound(uint id, uint[] memory values)
    external validId(id) view returns(bool) {
		return _checkBounds(values, _qualitiesBounds[id].bounds);
    }

    function create(QualityBounds calldata qualityBounds)
    external onlyOwner returns(uint)  {
        uint[] calldata bounds = qualityBounds.bounds;
        require(bounds.length > 0, "Inser at least one bound!");        
        _ids.increment();
        uint id = _ids.current();
        _qualitiesBounds[id] = qualityBounds;
        return id;
    }
    
    function currentId() external view returns(uint) {
        return _ids.current();
    }

    function getQualityBounds(uint id)
    external view validId(id) returns(QualityBounds memory) {
        return _qualitiesBounds[id];
    }

    function isValidId(uint id) public view returns(bool) {
        return id!=0 && id <= _ids.current();
    }

    modifier validId(uint id) {
        require(isValidId(id), "Not valid quality  ID!");
        _;
    }
}