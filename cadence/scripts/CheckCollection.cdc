import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import HaikuNFT from "../contracts/HaikuNFT.cdc"

pub fun main(): [String] {
  let account = getAccount(0xe03daebed8ca0615)

  let capability = account.getCapability(/public/HaikuCollection)

  let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")

  let a: [String] = []

  for id in ref.getIDs() {
    let nft = ref.borrowNFT(id: id)
    a.append(ref.borrowHaiku(id: id).text)
    //if nft.isInstance(Type<&HaikuNFT.NFT>()) {
    //  a.append(ref.borrowHaiku(id: id).text)
    //}
  }

  return a


  // log(ref)
  // log(ref.getIDs())
  // log("hi")
  // return ref.getIDs()


}