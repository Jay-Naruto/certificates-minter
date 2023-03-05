// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Lock is ERC721, Ownable{
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter _tokenIds;
address[] private _whitelisted;
    mapping(uint256 => string) _tokenURIs;
    struct RenderToken{
        uint256 id;
        string uri;
        string space;
    }
      mapping (uint256 => address) private _owners;
    mapping (address => uint256) private _balances;
      mapping(address => bool) private whitelist;

    constructor() ERC721("ProfileImageNfts","PIN"){}

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId]=_tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        require(_exists(tokenId), "URI does not exist on that ID");
        string memory _RUri=_tokenURIs[tokenId];
        return _RUri;
    }

    function getAllToken() public view returns (RenderToken[] memory)
    {
        uint256 latestId=_tokenIds.current();
        RenderToken[] memory res=new RenderToken[](latestId);
        for (uint256 i=0; i < latestId; i++)
        {
            if(_exists(i))
            {
                string memory uri=tokenURI((i));
                res[i]=RenderToken(i,uri, " ");
            }
        }
        return res;
    }
     function addToWhitelist(address[] memory _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
               _whitelisted.push(_addresses[i]);

        }
    }
    function getWhitelisted() public view returns (address[] memory) {
      return _whitelisted;
}
function transferNFT(address from, address to, uint256 tokenId) public {

// safeTransferFrom(from, to, tokenId);
    require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        require(to != address(0), "ERC721: transfer to the zero address");

        _transfer(from, to, tokenId);

 
}

    function removeFromWhitelist(address[] memory _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = false;
        }
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelist[_address];
    }
    function mint(address recipients, string memory _uri) public returns(uint256) {
  require(isWhitelisted(msg.sender), "Sender is not whitelisted");
        uint256 newId=_tokenIds.current();
        _mint(recipients,newId);
        _setTokenURI(newId, _uri);
        _tokenIds.increment();
        return newId;
        
    }
}   