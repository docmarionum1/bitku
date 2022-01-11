import {config} from "@onflow/fcl"

console.log(process.env);

config()
  .put("accessNode.api", process.env.REACT_APP_ACCESS_NODE) // Configure FCL's Access Node
  .put("challenge.handshake", process.env.REACT_APP_WALLET_DISCOVERY) // Configure FCL's Wallet Discovery mechanism
  //.put("0xProfile", process.env.REACT_APP_CONTRACT_PROFILE) // Will let us use `0xProfile` in our Cadence

export let FEATURED_ADDRESS = "";
export let LOGO_URL = "";
  
  
if (process.env.REACT_APP_FLOW_NETWORK === "emulator") {
  const contract_address = "0xf8d6e0586b0a20c7";
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0xee82856bf20e2aa6")
    .put("0xTOKENADDRESS", "0x0ae53cb6e3f42a79")
    .put("0xNONFUNGIBLETOKENADDRESS", contract_address)
    .put("0xHAIKUNFTADDRESS", contract_address)
    .put("0xFUSDADDRESS", contract_address);

  FEATURED_ADDRESS = contract_address;
  LOGO_URL = "http://localhost:3000/logo512.png"
} else if (process.env.REACT_APP_FLOW_NETWORK === "testnet") {
  const contract_address = "0x15fa543552f2c1f0";
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0x9a0766d93b6608b7")
    .put("0xTOKENADDRESS", "0x7e60df042a9c0868")
    .put("0xNONFUNGIBLETOKENADDRESS", "0x631e88ae7f1d7c20")
    .put("0xHAIKUNFTADDRESS", contract_address)
    .put("0xFUSDADDRESS", "0xe223d8a629e49c68");

  FEATURED_ADDRESS = contract_address;
  LOGO_URL = "https://testnet.bitku.art/logo512.png"
}
