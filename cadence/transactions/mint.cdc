import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import HaikuNFT from "../contracts/HaikuNFT.cdc"

// This transaction configures an account to hold Kitty Items.

transaction {
    let collection: &NonFungibleToken.Collection
    
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&HaikuNFT.Collection>(from: /storage/NFTCollection) == nil {

            // create a new empty collection
            let collection <- HaikuNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: /storage/NFTCollection)

            // create a public capability for the collection
            signer.link<&{NonFungibleToken.CollectionPublic}>(/public/NFTCollection, target: /storage/NFTCollection)
        }

        self.collection = signer.borrow<&NonFungibleToken.Collection>(from: /storage/NFTCollection) 
             ?? panic("Could not borrow reference to NFT Collection!")

        //self.collection = signer.getCapability(/public/NFTCollection)
    }

    execute {
        HaikuNFT.mintHaiku(recipient: self.collection)
    }
}
