import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export const GET_NEXT_ID_AND_PRICE = `
import HaikuNFT from 0xHAIKUNFTADDRESS

pub fun main(): {UInt64: UFix64} {

    return {HaikuNFT.totalSupply: HaikuNFT.currentPrice()}
}
`;

export async function getNextIDAndPrice() {
  const response = await fcl
  .send([
    fcl.script(GET_NEXT_ID_AND_PRICE)
  ])
  .then(fcl.decode);

  const id = Object.keys(response)[0];
  return {
    id: parseInt(id),
    price: response[id]
  };
}

export const GET_HAIKU = `
import HaikuNFT from 0xHAIKUNFTADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS

pub fun main(id: UInt64, address: Address): String {
  let account = getAccount(address)
  let capability = account.getCapability(HaikuNFT.HaikuCollectionPublicPath)
  let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")

  return ref.borrowHaiku(id: id).text
}
`;

export const GET_HAIKUS = `
import HaikuNFT from 0xHAIKUNFTADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS

pub fun main(haikus: { UInt64: Address }): { UInt64: String } {
  let response: {UInt64: String} = {}
  for id in haikus.keys {
    let address = haikus[id]!
    let account = getAccount(address)
    let capability = account.getCapability(HaikuNFT.HaikuCollectionPublicPath)
    let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")
    response[id] = ref.borrowHaiku(id: id).text
  }

  return response
}
`;

export async function getHaikus(haikus) {
  return await fcl
    .send([
      fcl.script(GET_HAIKUS),
      fcl.args([
        fcl.arg(haikus, t.Dictionary({key: t.UInt64, value: t.Address}))
        //fcl.arg(address, t.Address),
        //fcl.arg(id, t.UInt64),
      ]),
    ])
    .then(fcl.decode);
}

export async function getBalance(user) {
  return await fcl
  .send([
    fcl.script`
      import FungibleToken from 0xFUNGIBLETOKENADDRESS
      import FUSD from 0xFUSDADDRESS
      
      pub fun main(account: Address): UFix64 {
      
          let vaultRef = getAccount(account)
              .getCapability(/public/fusdBalance)
              .borrow<&FUSD.Vault{FungibleToken.Balance}>()
              ?? panic("Could not borrow Balance reference to the Vault")
      
          return vaultRef.balance
      }
    `,
    fcl.args([
      fcl.arg(user.addr, t.Address), // <-- t.Address this time :)
    ]),
  ])
  .then(fcl.decode);
}

export async function getUserHaikus(user) {
  return await fcl
  .send([
    fcl.script`
      import HaikuNFT from 0xHAIKUNFTADDRESS
      import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
      
      pub fun main(address: Address): {UInt64: String} {
        let account = getAccount(address)
        let capability = account.getCapability(HaikuNFT.HaikuCollectionPublicPath)
        let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")
      
        let haikus: {UInt64: String} = {}
      
        for id in ref.getIDs() {
          let nft = ref.borrowNFT(id: id)
          haikus[id] = ref.borrowHaiku(id: id).text
        }
      
        return haikus
      }
    `,
    fcl.args([
      fcl.arg(user.addr, t.Address), // <-- t.Address this time :)
    ]),
  ])
  .then(fcl.decode);
}