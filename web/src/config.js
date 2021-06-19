import {config} from "@onflow/fcl"

console.log(process.env);

config()
  .put("accessNode.api", process.env.REACT_APP_ACCESS_NODE) // Configure FCL's Access Node
  .put("challenge.handshake", process.env.REACT_APP_WALLET_DISCOVERY) // Configure FCL's Wallet Discovery mechanism
  //.put("0xProfile", process.env.REACT_APP_CONTRACT_PROFILE) // Will let us use `0xProfile` in our Cadence
  
  
if (process.env.REACT_APP_FLOW_NETWORK === "emulator") {
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0xee82856bf20e2aa6")
    .put("0xTOKENADDRESS", "0x0ae53cb6e3f42a79")
    .put("0xNONFUNGIBLETOKENADDRESS", "0xf8d6e0586b0a20c7")
    .put("0xHAIKUNFTADDRESS", "0xf8d6e0586b0a20c7")
}