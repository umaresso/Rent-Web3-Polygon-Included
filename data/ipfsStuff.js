import {
  getCustomNetworkWebsiteRentContract,
  websiteRentContract,
} from "./WebsiteRent";

const axios = require("axios");
export const getAllDappsUris = async (contract, setter) => {
  let currentIPFSLink = await contract.allWebsitesIPFSCid();

  if (currentIPFSLink == "") {
    if (setter) {
      setter([]);
    }
    return [];
  }
  let link = `https://${currentIPFSLink}.ipfs.w3s.link/dappInfo.json`;
  const response = await axios.get(link);
  if (setter) {
    setter(response.data.dapps);
  }
  return response.data.dapps;
};
function embedGateway(hash) {
  if (hash.toString().startsWith("http")) return hash;

  let link = "https://gateway.pinata.cloud/ipfs/" + hash;
  return link;
}

export const getTokenMetadata = async (tokenUriHash) => {
  let tokenUri = embedGateway(tokenUriHash);
  const response = await axios.get(tokenUri);
  let metadata = response.data;
  // console.log("metadata inside ipfs fetch is ", metadata);
  return metadata;
};

export const getTokensMetaData = async (tokenURIs, setter) => {
  let metadataArray = [];
  return tokenURIs?.map(async (item, index) => {
    return getTokenMetadata(item).then(async (metadata) => {
      metadataArray.push(metadata);
      if (index + 1 == tokenURIs.length) {
        if (setter) {
          setter(metadataArray);
        }
        return metadataArray;
      }
    });
  });
};
export const fetchDappsContent = async (
  Cids,
  setter,
  loader,
  NetworkChain,
  web3modalRef
) => {
  let dappArray = [];
  await Cids.map(async (cid, index) => {
    let _link = `https://${cid}.ipfs.w3s.link/metadata.json`;
    const response = await axios.get(_link);
    let dapp = response.data;
    dapp.image = getImageLinkFromIPFS(dapp.image);
    if (dapp.url) {
      let websiteRentContract = await getCustomNetworkWebsiteRentContract(
        NetworkChain,
        web3modalRef
      );
      let renttime = await websiteRentContract.rentTime(dapp.url);
      let rentPrice = await websiteRentContract.getDappRentPrice(dapp.url);
      dapp.rentPrice = parseFloat(rentPrice / 10 ** 18);
      if (parseInt(renttime) * 1000 > new Date().getTime()) {
        console.log("rented already !");
        dapp.rented = true;
      } else {
        console.log("Not rented !");
        dapp.rented = false;
      }
    }
    console.log("Dapp is ", dapp);
    dappArray.push(dapp);

    if (setter != undefined && index + 1 == Cids.length) {
      console.log("Dapps are : ", dappArray);
      setter(dappArray);
      loader(false);
      return dappArray;
    }
  });
  return dappArray;
};
export function getImageLinkFromIPFS(cid) {
  let link = `https://${cid}.ipfs.w3s.link/img.PNG`;
  return link;
}

export const getAllContractAddressess = async (contract, setter) => {
  try {
    let currentIPFSLink = await contract.contractAddressesIpfsLink();
    //console.log("ipfs link for contracts is ", currentIPFSLink);
    if (currentIPFSLink == "") {
      if (setter) {
        setter([]);
      }
      return [];
    }
    let link = `https://${currentIPFSLink}.ipfs.w3s.link/contracts.json`;
    const response = await axios.get(link);
    // console.log("the contracts are ", response.data.contracts);
    if (setter) {
      setter(response.data.contracts);
    }
    return response.data.contracts;
  } catch (e) {
    console.log("Contract addresses Fetch Error", e);
  }
};

export const getAllContractTokens = async (contract, setter) => {
  try {
    let currentIPFSLink = await contract.contractTokensIpfsLink();
    console.log("ipfs link for contractsTokens is ", currentIPFSLink);
    if (currentIPFSLink == "") {
      if (setter) {
        setter([]);
      }
      return [];
    }
    let link = `https://${currentIPFSLink}.ipfs.w3s.link/contractTokens.json`;
    const response = await axios.get(link);
    // console.log("response is ", response);
    //  console.log("the contract tokens are ", response.data.contractTokens);
    if (setter) {
      setter(response.data.contractTokens);
    }
    return response.data.contractTokens;
  } catch (e) {
    console.log("getAllContract Tokens error ", e);
  }
};
export function getIpfsImageLink(_link) {
  if (_link.toString().startsWith("ipfs://")) {
    let Cid = _link.toString().slice(7);
    let link = "https://gateway.pinata.cloud/ipfs/" + Cid;
    return link;
  }
  return _link;
}