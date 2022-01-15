import HaikuNFT from 0x3885d9d426d2ef5c

transaction(num: UInt64) {
  prepare(signer: AuthAccount) {}

  execute {
    HaikuNFT.preMintHaikus(num: num)
  }
}