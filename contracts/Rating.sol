// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";

contract Rating is ERC721, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    function(uint[] memory, uint[] memory, uint[] memory) external pure returns(uint) _reputationCalc;
    function(uint[] memory, uint[] memory, uint[] memory) external pure returns(uint) _trustCalc;

    mapping(address => uint) private _accountSBT;       
    mapping(address => uint[][]) private _ratings;
    mapping(address => uint[]) private _reputations;  
    mapping(address => uint[]) private _trusts;

    constructor(function(uint[] memory, uint[] memory, uint[] memory) external pure returns(uint) reputationCalc,
                function(uint[] memory, uint[] memory, uint[] memory) external pure returns(uint) trustCalc)
    ERC721("Trust", "TRS")
    {
        _reputationCalc = reputationCalc;
        _trustCalc = trustCalc;
    }

    function _beforeTokenTransfer(address from, address to, uint tokenId, uint batchSize)
    internal override(ERC721)
    {
        require(from == address(0), "Token not transferable!");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
 
    function _burn(uint tokenId) internal override(ERC721, ERC721URIStorage) {
        require(tokenId == 0, "Token not burnable!");
        super._burn(tokenId);
    }

    function createSBT(address account)
    external onlyOwner
    {
        uint tokenId = _accountSBT[account];
        if (tokenId <= 0) {
            _tokenIds.increment();
            tokenId = _tokenIds.current();
            _safeMint(account, tokenId);
            _accountSBT[account] = tokenId; 
        }
    }

    function getLastRatings(address account) external view returns(uint[] memory)
    {
        uint[][] memory accountRatings = _ratings[account];
        return accountRatings[accountRatings.length-1];
    }

    function getLastReputation(address account) external view returns(uint)
    {
        uint[] memory accountReputation = _reputations[account];
        return accountReputation[accountReputation.length-1];
    }

    function getLastTrust(address account) external view returns(uint)
    {    
        uint[] memory accountTrust = _trusts[account]; 
        return accountTrust[accountTrust.length-1];
    }

    function getRatings(address account)
    external view returns(uint[][] memory)
    {    
        return _ratings[account];
    }

    function getReputation(address account) external view returns(uint[] memory)
    {    
        return _reputations[account];
    }

    function getTrust(address account) external view returns(uint[] memory)
    {    
        return _trusts[account];
    }

    function isValidTokenId(uint tokenId) public view returns(bool) {
        return tokenId!=0 && tokenId <= _tokenIds.current();
    }

    function setReputation(
        address account,
        uint[] memory ratings,
        uint[] memory otherValues
    )
    external onlyOwner returns(uint)
    {    
        uint reputation = _reputationCalc(ratings, _reputations[account], otherValues);
        _ratings[account].push(ratings);
        _reputations[account].push(reputation);
        return reputation;
    }    

    function setTrust(
        address account,
        uint[] memory otherValues
    )
    public onlyOwner returns(uint)
    {    
        uint trust = _trustCalc(_reputations[account], _trusts[account], otherValues);        
        _trusts[account].push(trust);
        return trust;
    }

    function tokenURI(uint tokenId)
    public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    modifier validTokenId(uint tokenId) {
        require(isValidTokenId(tokenId), "Not valid trust token ID!");
        _;
    }
}