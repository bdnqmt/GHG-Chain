// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";


contract Product is ERC721, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Resource {
        string name;
        string[] activityList;
        uint[] activityGHGList;
        uint[] otherResourceList;
        uint GHG;
    }   

    mapping(uint=>Resource) private resources;
        
    constructor() 
        ERC721("Product", "PDC"){
    }

    function _beforeTokenTransfer(address from, address to, uint firstTokenId, uint batchSize)
    internal virtual override onlyOwner
    {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
    
    //Not burnable
    function _burn(uint tokenId) internal override(ERC721, ERC721URIStorage) {
        require(tokenId == 0, "Token not burnable!");
        super._burn(tokenId);
    }
    
    function create(Resource calldata resource, address owner)
    external onlyOwner returns(uint)  {
        
        _tokenIds.increment();
        uint tokenId = _tokenIds.current();
        
        _safeMint(owner, tokenId);
        resources[tokenId] = resource;

        return tokenId;
    }

    function currentToken() external view returns(uint) {
        return _tokenIds.current();
    } 

    function getResource(uint tokenId)
    external view validTokenId(tokenId) returns(Resource memory) {
        return resources[tokenId];
    }

    function isValidTokenId(uint tokenId) public view returns(bool) {
        return tokenId != 0 && tokenId <= _tokenIds.current();
    }

    function tokenURI(uint tokenId)
    public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function transferFrom(address from, address to, uint tokenId) public virtual override onlyOwner{ 
        _safeTransfer(from, to, tokenId, "");
    }

    modifier validTokenId(uint tokenId) {
        require(isValidTokenId(tokenId),"Not valid product Token ID!");
        _;
    }
}
