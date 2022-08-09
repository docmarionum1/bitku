import HaikuNFT from "../contracts/HaikuNFT.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"

// Run with `flow emulator -v` to get log statements of each metadata view
pub fun main(address: Address, id: UInt64): MetadataViews.Display {
  let account = getAccount(address)
  let capability = account.getCapability(HaikuNFT.HaikuCollectionPublicPath)
  let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")

  let nft = ref.borrowHaiku(id: id)!

  let display = MetadataViews.getDisplay(nft)!
  log(display)

  let editions = MetadataViews.getEditions(nft)!
  log(editions)

  let externalURL = MetadataViews.getExternalURL(nft)!
  log(externalURL)

  let license = MetadataViews.getLicense(nft)!
  log(license)

  let NFTCollectionData = MetadataViews.getNFTCollectionData(nft)!
  log(NFTCollectionData)

  let NFTCollectionDisplay = MetadataViews.getNFTCollectionDisplay(nft)!
  log(NFTCollectionDisplay)

  let serial = MetadataViews.getSerial(nft)!
  log(serial)

  let nftView = MetadataViews.getNFTView(id: id, viewResolver: nft)
  log(nftView)

  return display
}