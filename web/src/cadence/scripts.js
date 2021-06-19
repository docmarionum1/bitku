import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

export async function getNextIDAndPrice() {
  const response = await fcl
  .send([
    fcl.script`
      import HaikuNFT from 0xf8d6e0586b0a20c7
      
      pub fun main(): {UInt64: UFix64} {
      
          return {HaikuNFT.totalSupply: HaikuNFT.currentPrice()}
      }
    `,
  ])
  .then(fcl.decode);

  const id = Object.keys(response)[0];
  return {
    id: parseInt(id),
    price: response[id]
  };
}

export async function getHaiku(address, id) {
  return await fcl
    .send([
      fcl.script`
        import HaikuNFT from 0xf8d6e0586b0a20c7
        import NonFungibleToken from 0xf8d6e0586b0a20c7
        
        pub fun main(address: Address, id: UInt64): String {
          let account = getAccount(address)
          let capability = account.getCapability(/public/HaikuCollection)
          let ref = capability.borrow<&{HaikuNFT.HaikuCollectionPublic, NonFungibleToken.CollectionPublic}>() ?? panic("Could not borrow")

          return ref.borrowHaiku(id: id).text
        }
      `,
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(id, t.UInt64),
      ]),
    ])
    .then(fcl.decode);
}

export async function getBalance(user) {
  return await fcl
  .send([
    fcl.script`
      import FungibleToken from 0xFUNGIBLETOKENADDRESS
      import FlowToken from 0xTOKENADDRESS
      
      pub fun main(account: Address): UFix64 {
      
          let vaultRef = getAccount(account)
              .getCapability(/public/flowTokenBalance)
              .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
              ?? panic("Could not borrow Balance reference to the Vault")
      
          return vaultRef.balance
          
          
          //return getAccount(account).balance
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
      import HaikuNFT from 0xf8d6e0586b0a20c7
      import NonFungibleToken from 0xf8d6e0586b0a20c7
      
      pub fun main(address: Address): {UInt64: String} {
        let account = getAccount(address)
        let capability = account.getCapability(/public/HaikuCollection)
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