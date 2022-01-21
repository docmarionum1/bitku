import HaikuNFT from 0xf61e40c19db2a9e2

transaction(num: UInt64) {
  prepare(signer: AuthAccount) {}

  execute {
    HaikuNFT.preMintHaikus(num: num)
  }
}