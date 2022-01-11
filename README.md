# Bitku

[Bitku](https://testnet.bitku.art/) is an (in-development) project to create generative haiku completely on the [Flow](https://www.onflow.org/) blockchain. With Bitku I set out to accomplish two novel (possibly first-of-its-kind) goals:

  1. Create a text-based generative NFT
  2. Embed a machine-learning model directly into a smart contract and generate outputs completely on the blockchain without any oracles or side-effects

## How do I create a Bitku?

[Bitku is currently live on the Flow testnet](https://testnet.bitku.art/). To use it:

1. Click "Connect Wallet" in the upper-right.
2. If you don't have a wallet already, choose "Blocto" from the list of providers and create an account.
3. If you don't have any FLOW (currency) on the testnet, use the [testnet faucet](https://testnet-faucet-v2.onflow.org/) to receive free fake testnet money by entering the wallet address from the previous step.
4. Click "Mint Bitku" and approve the transaction that pops up. 
5. Wait a few seconds for the blockchain to process the transaction.
6. ???
7. Bitku!
8. That bitku is now stored in your wallet. You can come back and view all of the Bitku that you've minted under "My Bitku."

## How does it work?

The core of Bitku is comprised of 
[five smart contracts](https://github.com/docmarionum1/bitku/blob/main/docs/contracts.md), 
one that manages the supply and creation of the haiku and four that contain the text-generation model in a compressed format. 

When you click "Mint Bitku" on the Bitku website it sends a transaction on the Flow blockchain to the primary contract's [`mintHaiku`](https://github.com/docmarionum1/bitku/blob/main/contracts/HaikuNFT.cdc#L275) function which uses the model contracts to generate the text. 

## Status

[Bitku is currently live on the Flow testnet](https://testnet.bitku.art/). Besides testing, the [issues page](https://github.com/docmarionum1/bitku/issues) lists the outstanding work that I need to do. Please submit any bugs found there.


# Development

See [`docs/development.md`](https://github.com/docmarionum1/bitku/blob/main/docs/development.md) for 
information about setting this project up locally, testing, and deployment.
