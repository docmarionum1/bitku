import { config } from "@onflow/fcl";

config()
  .put("accessNode.api", process.env.REACT_APP_ACCESS_NODE) // Configure FCL's Access Node
  .put("discovery.wallet", process.env.REACT_APP_WALLET_DISCOVERY)
  .put("discover.authn.endpoint", process.env.REACT_APP_WALLET_DISCOVERY_API)
  .put("app.detail.title", "Bitku")
  .put("app.detail.icon", "https://bitku.art/logo512.png")


export let FEATURED_ADDRESS = "";
export let LOGO_URL = "";
export let FLOWSCAN_URL = "";


if (process.env.REACT_APP_FLOW_NETWORK === "emulator") {
  const contract_address = "0xf8d6e0586b0a20c7";
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0xee82856bf20e2aa6")
    .put("0xTOKENADDRESS", "0x0ae53cb6e3f42a79")
    .put("0xNONFUNGIBLETOKENADDRESS", contract_address)
    .put("0xHAIKUNFTADDRESS", contract_address)
    .put("0xFUSDADDRESS", contract_address)
    .put("0xFINDADDRESS", "0xa16ab1d0abde3625"); // Testnet

  FEATURED_ADDRESS = contract_address;
  LOGO_URL = "http://localhost:3000/logo512.png";
  FLOWSCAN_URL = "";
} else if (process.env.REACT_APP_FLOW_NETWORK === "testnet") {
  const contract_address = "0x824f612f78d34250";
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0x9a0766d93b6608b7")
    .put("0xTOKENADDRESS", "0x7e60df042a9c0868")
    .put("0xNONFUNGIBLETOKENADDRESS", "0x631e88ae7f1d7c20")
    .put("0xHAIKUNFTADDRESS", contract_address)
    .put("0xFUSDADDRESS", "0xe223d8a629e49c68")
    .put("0xFINDADDRESS", "0xa16ab1d0abde3625");

  FEATURED_ADDRESS = contract_address;
  LOGO_URL = "https://testnet.bitku.art/logo512.png";
  FLOWSCAN_URL = "https://testnet.flowscan.org/transaction/";
} else if (process.env.REACT_APP_FLOW_NETWORK === "mainnet") {
  const contract_address = "0xf61e40c19db2a9e2";
  config()
    .put("0xFUNGIBLETOKENADDRESS", "0xf233dcee88fe0abe")
    .put("0xTOKENADDRESS", "0x1654653399040a61")
    .put("0xNONFUNGIBLETOKENADDRESS", "0x1d7e57aa55817448")
    .put("0xHAIKUNFTADDRESS", contract_address)
    .put("0xFUSDADDRESS", "0x3c5959b568896393")
    .put("0xFINDADDRESS", "0x097bafa4e0b48eef");

  FEATURED_ADDRESS = contract_address;
  LOGO_URL = "https://bitku.art/logo512.png";
  FLOWSCAN_URL = "https://flowscan.org/transaction/";
}
