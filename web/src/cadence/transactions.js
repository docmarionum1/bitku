import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types";

export async function mintHaikuTransaction(nextHaiku) {
  const txId = await fcl.send([
    fcl.transaction`
    import FungibleToken from 0xFUNGIBLETOKENADDRESS
    import FlowToken from 0xTOKENADDRESS
    import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS

    import HaikuNFT from 0xHAIKUNFTADDRESS
    
    // This transaction configures an account to hold Kitty Items.
    
    transaction (haikuID: UInt64, price: UFix64) {
        let collection: &NonFungibleToken.Collection
        let sentVault: @FungibleToken.Vault
        
        prepare(signer: AuthAccount) {
            // if the account doesn't already have a collection
            if signer.borrow<&HaikuNFT.Collection>(from: /storage/HaikuCollection) == nil {

    
                // create a new empty collection
                let collection <- HaikuNFT.createEmptyCollection()
                
                // save it to the account
                signer.save(<-collection, to: /storage/HaikuCollection)
    
                // create a public capability for the collection
                signer.link<&{NonFungibleToken.CollectionPublic, HaikuNFT.HaikuCollectionPublic}>(/public/HaikuCollection, target: /storage/HaikuCollection)
            }
    
            self.collection = signer.borrow<&NonFungibleToken.Collection>(from: /storage/HaikuCollection) 
                 ?? panic("Could not borrow reference to NFT Collection!")

            // Get a reference to the signer's stored vault
            let vaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
              ?? panic("Could not borrow reference to the owner's Vault!")

            // Withdraw tokens from the signer's stored vault
            self.sentVault <- vaultRef.withdraw(amount: price)
        }
    
        execute {
            HaikuNFT.mintHaiku(recipient: self.collection, vault: <- self.sentVault, id: haikuID)
        }
    }
    `,
    fcl.args([
      fcl.arg(nextHaiku.id, t.UInt64),
      fcl.arg(nextHaiku.price, t.UFix64),
    ]),
    fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
    fcl.proposer(fcl.authz), // current user acting as the nonce
    fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
    fcl.limit(9999), // set the compute limit
  ])
  .then(fcl.decode);

  return fcl.tx(txId).onceSealed();
}