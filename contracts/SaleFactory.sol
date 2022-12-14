// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/// @title Custom NFT Contract (ERC721 compliant)
/// @author Manav Vagdoda (vagdonic.github.io)

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./WhitelistFactory.sol";

contract Sale is ERC721, ERC721URIStorage{
   
    IWhitelist whitelistContract;
    
    uint256  openingTime;
    uint256  closingTime;
    address public  owner;
    uint256 public presaleMintRate;
    uint256 public publicMintRate;
    string public baseURI;
    string public baseExtension = ".json";
    address PLATFORM_BENEFICIARY=0xbe68eE8a43ce119a56625d7E645AbAF74652d5E1;
    uint MINTING_FEE_FRACTION=100; // 100th fraction means  1% minting fee
   
    uint public totalSupply;
    mapping(uint =>uint) updatedNFTPrice;
    enum Stage {locked, presale, publicsale}

    modifier onlyBeneficiary{
      require(PLATFORM_BENEFICIARY==msg.sender);
      _;
    } 
    modifier onlyOwner{
        require(owner==msg.sender,"You are not the owner");
        _;
    }
    // 0x2C0c67324F5B35EfBbb027e3798E388c06BE3DA4
    // 0x159bedaB39B971583cCd58F17744B709C9860567 - beneficiary
  
    // 0xf51C21c44A836125A81da92556aaf5d67C7ca6d5,"Bitcoin Prime","bitcoin",0xf5a6Bf94e82972c8bf7B23858Ec62a8f840B8d79,"ipfs://QmVK3Cnfpuou3rg71kgBFxqo1rSmsBvCFCw9upHntbQhU6/",1665914714,1665919507,1000000000000000,2000000000000000,10
    
    constructor(
      address whitelistContractAddress,
      string memory name,
      string memory symbol,
      address _owner,
      string memory _baseURI,
      uint startTime,
      uint endTime,
      uint _presaleMintRate,
      uint _publicMintRate,
      uint _totalSupply
      
      ) 
      ERC721(name, symbol)
      {
      whitelistContract=IWhitelist(whitelistContractAddress);
      owner = _owner;
      PLATFORM_BENEFICIARY=msg.sender;
      openingTime=startTime;
      closingTime=endTime;
      presaleMintRate=_presaleMintRate;
      publicMintRate=_publicMintRate;
      baseURI=_baseURI;
      totalSupply=_totalSupply;
              
    }

    

    function getNFTPrice(uint tokenId)public view returns(uint){
      uint price=0;
      if(checkStage()==Stage.presale)
        price=presaleMintRate;
      
      else if (checkStage()==Stage.publicsale)
        price=publicMintRate;
      
      if(updatedNFTPrice[tokenId]!=0)
        price=updatedNFTPrice[tokenId];
        uint minting_fee = price/MINTING_FEE_FRACTION;
        price =  price+ minting_fee;

      return price;

    }

    function withdraw()public onlyBeneficiary{
           payable(PLATFORM_BENEFICIARY).transfer(address(this).balance);
    }
    function MintThisToken(uint tokenId)internal {
     if(!_exists(tokenId))
        _safeMint(msg.sender,tokenId);
     
    }
    function purchaseThisToken(uint tokenId)public payable{
      // can not mint before time
      require(checkStage()!=Stage.locked,"Sale has not started yet");
      if(checkStage()==Stage.presale){ 
           require(isWhitelisted(msg.sender),"PRESALE:You are not Whitelisted !");         
         }


      uint _price=getNFTPrice(tokenId);

      require(msg.value>=_price,"Insufficient Funds sent for Token Purchase");

      MintThisToken(tokenId);

      if(ownerOf(tokenId)!=msg.sender){
        require(getApproved(tokenId)==address(this),"Token is not available to transfer");
        address tokenOwner = ownerOf(tokenId);
        this.safeTransferFrom(ownerOf(tokenId),msg.sender,tokenId);
        _price=updatedNFTPrice[tokenId];
        uint minting_fee = _price/MINTING_FEE_FRACTION;
        uint amountToSend = _price- minting_fee;
        payable(tokenOwner).transfer(amountToSend);

      }
      else{
         payable(PLATFORM_BENEFICIARY).transfer(_price);
      }

    }

    function setNFTPrice(uint tokenId,uint price)public {
      require(ownerOf(tokenId)==msg.sender,"Only Owners can change Price of NFT");
      updatedNFTPrice[tokenId]=price;

    }
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
         string memory finalURI = integerToString(tokenId);
          finalURI = string(abi.encodePacked(baseURI, finalURI, baseExtension));
          return finalURI;
    }

   

    function integerToString(uint256 _i) internal pure returns (string memory str) {
      if (_i == 0)
      {
        return "0";
      }
      uint256 j = _i;
      uint256 length;
      while (j != 0)
      {
        length++;
        j /= 10;
      }
      bytes memory bstr = new bytes(length);
      uint256 k = length;
      j = _i;
      while (j != 0)
      {
        bstr[--k] = bytes1(uint8(48 + j % 10));
        j /= 10;
      }
      str = string(bstr);
}




  function TimedCrowdsale(uint256 _openingTime, uint256 _closingTime) public onlyOwner{
    require(_openingTime >= block.timestamp,"Invalid Sale Opening Time");
    require(_closingTime >= _openingTime,"Invalid Sale Closing Time");
    openingTime = _openingTime;
    closingTime = _closingTime;
  }

  

    function checkStage() public view returns (Stage stage){
      if(block.timestamp < openingTime) {
        stage = Stage.locked;
        return stage;
      }
      else if(block.timestamp >= openingTime && block.timestamp <= closingTime) {
        stage = Stage.presale;
        return stage;
      }
      else if(block.timestamp >= closingTime) {
        stage = Stage.publicsale;
        return stage;
        }
    }


    function isWhitelisted(address xyz) public returns (bool) {
    if(whitelistContract.isWhitelisted(xyz))
        return true;
    return false;

    }

    function setPLATFORM_BENEFICIARY(address newBeneficiary)public onlyBeneficiary{
      PLATFORM_BENEFICIARY=newBeneficiary;
    }
    // mintFee -75
    // 100
    //
    function setMINTING_FEE_FRACTION(uint newFee)public onlyBeneficiary{
      MINTING_FEE_FRACTION=newFee;
    }
    function startTime()public view returns(uint){
      return openingTime;
    }
    
    function endTime()public view returns(uint){
      return closingTime;
    }
    function isTokenIdExists(uint tokenId)public view returns(bool){
      if(_exists(tokenId)==true)
        return true;
      return false;
    }
    
}