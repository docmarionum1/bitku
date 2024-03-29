import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types";
import { FLOWSCAN_URL } from "../config";

function showTransactionLink(txId, setError) {
  const flowScanLink = FLOWSCAN_URL + txId;
  setError({
    text: <span> Transaction Submitted. View Status on&nbsp;
      <a href={flowScanLink} target="_blank" rel="noreferrer">Flowscan</a>
      .
    </span>,
    severity: "success"
  });
}

export const MINT_HAIKU_TRANSACTION = `
import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FlowToken from 0xTOKENADDRESS
import FUSD from 0xFUSDADDRESS
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import MetadataViews from 0xMETADATAVIEWSADDRESS
import HaikuNFT from 0xHAIKUNFTADDRESS

transaction (haikuID: UInt64, price: UFix64) {
    let collection: &NonFungibleToken.Collection
    let sentVault: @FungibleToken.Vault
    let receiverRef: &FlowToken.Vault{FungibleToken.Receiver}
    
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&HaikuNFT.Collection>(from: HaikuNFT.HaikuCollectionStoragePath) == nil {


            // create a new empty collection
            let collection <- HaikuNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: HaikuNFT.HaikuCollectionStoragePath)

            // create a public capability for the collection
            signer.link<&{NonFungibleToken.CollectionPublic, HaikuNFT.HaikuCollectionPublic, MetadataViews.ResolverCollection}>(HaikuNFT.HaikuCollectionPublicPath, target: HaikuNFT.HaikuCollectionStoragePath)
        }

        self.collection = signer.borrow<&NonFungibleToken.Collection>(from: HaikuNFT.HaikuCollectionStoragePath) 
             ?? panic("Could not borrow reference to NFT Collection!")

        // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FUSD.Vault>(from: /storage/fusdVault)
          ?? panic("Could not borrow reference to the owner's FUSD Vault!")

        // Get a reference to the signer's FLOW receiver to receive FLOW necessary to ensure they have
        // enough storage
        self.receiverRef =  signer
          .getCapability(/public/flowTokenReceiver)
          .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
        ?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: price)
    }

    execute {
        HaikuNFT.mintHaiku(recipient: self.collection, vault: <- self.sentVault, id: haikuID, flowReceiverRef: self.receiverRef)
    }
}
`;

export async function mintHaikuTransaction(nextHaiku, setError) {
  const txId = await fcl.send([
    fcl.transaction(MINT_HAIKU_TRANSACTION),
    fcl.args([
      fcl.arg(nextHaiku.id, t.UInt64),
      fcl.arg(nextHaiku.price.toFixed(8), t.UFix64),
    ]),
    fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
    fcl.proposer(fcl.authz), // current user acting as the nonce
    fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
    fcl.limit(9999), // set the compute limit
  ])
    .then(fcl.decode);

  showTransactionLink(txId, setError);

  return fcl.tx(txId).onceSealed();
}

// Copied from https://docs.onflow.org/fusd/transactions/
export const SETUP_FUSD_VAULT = `
import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FUSD from 0xFUSDADDRESS

transaction {

  prepare(signer: AuthAccount) {

    // It's OK if the account already has a Vault, but we don't want to replace it
    if(signer.borrow<&FUSD.Vault>(from: /storage/fusdVault) != nil) {
      return
    }
    
    // Create a new FUSD Vault and put it in storage
    signer.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

    // Create a public capability to the Vault that only exposes
    // the deposit function through the Receiver interface
    signer.link<&FUSD.Vault{FungibleToken.Receiver}>(
      /public/fusdReceiver,
      target: /storage/fusdVault
    )

    // Create a public capability to the Vault that only exposes
    // the balance field through the Balance interface
    signer.link<&FUSD.Vault{FungibleToken.Balance}>(
      /public/fusdBalance,
      target: /storage/fusdVault
    )
  }
}
`;

export async function setupFUSDVaultTransaction(setError) {
  const txId = await fcl.send([
    fcl.transaction(SETUP_FUSD_VAULT),
    fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
    fcl.proposer(fcl.authz), // current user acting as the nonce
    fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
    fcl.limit(99), // set the compute limit
  ])
    .then(fcl.decode);

  showTransactionLink(txId, setError);

  return fcl.tx(txId).onceSealed();
}

export const SETUP_COLLECTION_TRANSACTION = `
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import MetadataViews from 0xMETADATAVIEWSADDRESS
import HaikuNFT from 0xHAIKUNFTADDRESS

transaction () {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&HaikuNFT.Collection>(from: HaikuNFT.HaikuCollectionStoragePath) == nil {
            // create a new empty collection
            let collection <- HaikuNFT.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: HaikuNFT.HaikuCollectionStoragePath)

            // create a public capability for the collection
            signer.link<&{NonFungibleToken.CollectionPublic, HaikuNFT.HaikuCollectionPublic, MetadataViews.ResolverCollection}>(HaikuNFT.HaikuCollectionPublicPath, target: HaikuNFT.HaikuCollectionStoragePath)
        }
    }
}
`;

export async function setupBitkuCollectionTransaction(setError) {
  const txId = await fcl.send([
    fcl.transaction(SETUP_COLLECTION_TRANSACTION),
    fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
    fcl.proposer(fcl.authz), // current user acting as the nonce
    fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
    fcl.limit(99), // set the compute limit
  ])
    .then(fcl.decode);

  showTransactionLink(txId, setError);

  return fcl.tx(txId).onceSealed();
}

export const SEND_BITKU_TRANSACTION = `
import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS

import HaikuNFT from 0xHAIKUNFTADDRESS

transaction (haikuID: UInt64, targetAddress: Address) {
  let targetCollection: &AnyResource{NonFungibleToken.CollectionPublic}
  let haiku: @NonFungibleToken.NFT
  
  prepare(signer: AuthAccount) {
    // Get the sender's collection
    let collection = signer.borrow<&HaikuNFT.Collection>(from: HaikuNFT.HaikuCollectionStoragePath)
      ?? panic("Could not borrow reference to source account's Bitku Collection!")

    // Withdraw the haiku
    self.haiku <- collection.withdraw(withdrawID: haikuID)

    // Get the receiver's collection
    let targetAccount = getAccount(targetAddress)
    self.targetCollection = targetAccount.getCapability(HaikuNFT.HaikuCollectionPublicPath).borrow<&{NonFungibleToken.CollectionPublic}>()
      ?? panic("Could not borrow reference to target account's Bitku Receiver!")
  }

  execute {
    self.targetCollection.deposit(token: <- self.haiku)
  }
}
`

export async function sendBitkuTransaction(haikuID, targetAddress, setError) {
  const txId = await fcl.send([
    fcl.transaction(SEND_BITKU_TRANSACTION),
    fcl.args([
      fcl.arg(parseInt(haikuID), t.UInt64),
      fcl.arg(targetAddress, t.Address),
    ]),
    fcl.payer(fcl.authz), // current user is responsible for paying for the transaction
    fcl.proposer(fcl.authz), // current user acting as the nonce
    fcl.authorizations([fcl.authz]), // current user will be first AuthAccount
    fcl.limit(99), // set the compute limit
  ])
    .then(fcl.decode);

  showTransactionLink(txId, setError);

  return fcl.tx(txId).onceSealed();
}