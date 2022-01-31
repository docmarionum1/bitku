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
    price: parseFloat(response[id])
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

// TODO: this needs to better handle a case where the bitku doesn't exist at that address anymore.
// This wil require a change to the HaikuNFT contract (HaikuNFT.Collection.borrowNFT) to make it return
// nil instead of panic
export const GET_HAIKUS = `
import HaikuNFT from 0xHAIKUNFTADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import FIND, Profile from 0xFINDADDRESS

pub fun main(haikus: { UInt64: Address }): { UInt64: { String: String } } {
  let response: {UInt64: {String: String}} = {}
  for id in haikus.keys {
    let address = haikus[id]!
    let account = getAccount(address)
    let capability = account.getCapability(HaikuNFT.HaikuCollectionPublicPath)
    let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>()
    if ref == nil {
      continue
    }
    let haiku = ref!.borrowHaiku(id: id)
    if haiku == nil {
      continue
    }

    // Include find avatar and user name if the account has a find profile
    var findAvatar = ""
    var findName = ""

    let leaseCap = account.getCapability<&FIND.LeaseCollection{FIND.LeaseCollectionPublic}>(FIND.LeasePublicPath)
    if leaseCap.check() {
      let profile = Profile.find(address).asProfile()
      if profile != nil {
        findAvatar = profile.avatar
        findName = profile.findName
      }
    }

    
    
    response[id] = {
      "text": haiku!.text,
      "address": address.toString(),
      "findName": findName,
      "findAvatar": findAvatar
    }

    
  }

  return response
}
`;

export async function getHaikus(haikus) {
  const haikuText = await fcl
    .send([
      fcl.script(GET_HAIKUS),
      fcl.args([
        fcl.arg(haikus, t.Dictionary({ key: t.UInt64, value: t.Address }))
      ]),
    ])
    .then(fcl.decode);
  return haikuText;
}

export async function getBalance(user) {
  const balance = await fcl
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

  return parseFloat(balance);
}

export async function getUserHaikus(user) {
  const haikus = await fcl
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
          haikus[id] = ref.borrowHaiku(id: id)!.text
        }
      
        return haikus
      }
    `,
      fcl.args([
        fcl.arg(user.addr, t.Address), // <-- t.Address this time :)
      ]),
    ])
    .then(fcl.decode);

  for (const id in haikus) {
    haikus[id] = { text: haikus[id], address: user.addr };
  }

  return haikus;
}

export async function getFindProfile(user) {
  const groups = user.match(/^0x0*([a-zA-Z0-9]{0,16})$/);
  if (groups) {
    try {
      return await fcl
        .send([
          fcl.script`
          import FIND, Profile from 0x097bafa4e0b48eef
  
          pub fun main(address: Address) :  Profile.UserProfile? {
              return Profile.find(address).asProfile()
          }
        `,
          fcl.args([
            fcl.arg(`0x${groups[1]}`, t.Address),
          ]),
        ])
        .then(fcl.decode);
    } catch { }
  }

  return await fcl
    .send([
      fcl.script`
        import FIND, Profile from 0x097bafa4e0b48eef

        pub fun main(name: String) :  Profile.UserProfile? {
            return FIND.lookup(name)?.asProfile()
        }
      `,
      fcl.args([
        fcl.arg(user, t.String),
      ]),
    ])
    .then(fcl.decode);
}