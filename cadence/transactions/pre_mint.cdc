import HaikuNFT from "../contracts/HaikuNFT.cdc"

transaction(num: UInt64) {
  prepare(signer: AuthAccount) {}

  execute {
    HaikuNFT.preMintHaikus(num: num)
  }
}