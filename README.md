# Bitku

[Bitku](https://bitku.art/) is a project to create generative haiku completely on the [Flow](https://www.onflow.org/) blockchain. 
With Bitku I set out to accomplish two novel (possibly first-of-its-kind) goals:

  1. Create a text-based generative NFT
  2. Embed a machine-learning model directly into a smart contract and generate outputs completely on the blockchain without any oracles or side-effects

## How do I create (mint) a Bitku?

1. Click "Connect Wallet" in the upper-right.
2. If you don't have a wallet already, choose "Blocto" from the list of providers and create an account.
3. If you don't have FUSD, see the next section for information about how to purchase some.
4. Click "Mint Bitku" and approve the transaction that pops up. 
5. Wait a few seconds for the blockchain to process the transaction.
6. ???
7. Bitku!
8. That bitku is now stored in your wallet. You can come back and view all of the Bitku that you've minted under "My Bitku."

### How to get FUSD

FUSD (Flow USD) is the USD-Stablecoin on the Flow blockchain. There are currently a few options:

- Use the Ramp widget from within Bitku. If you don't have enough FUSD to cover the price of minting a Bitku, then you will be prompted
to purchase FUSD with Ramp. The purchase amount may be higher than the price of the Bitku due to Ramp's minimums. This method doesn't support credit cards.
- If you want to use a credit card, you can purchase FUSD directly on [Ramp's website](https://ramp.network/buy/).
  - Note: Ramp doesn't support FUSD purchases from within the United States. 
- [Moonpay](https://www.moonpay.com/) also allows FUSD purchase with credit card, but has a higher minimum purchase.
- You can use [BloctoSwap](https://swap.blocto.app/#/swap) to teleport several currencies from other blockchains (Ethereum, Binance and Solana) and then
swap them for FUSD.
- View Flow's [official documentation on getting FUSD](https://docs.onflow.org/fusd/providers/) for more information. 

### How to Send a Bitku to Another Account

1. Ensure that the recipient has a Bitku collection in their account. If they've never minted a Bitku, they can
create an empty collection by using the menu in the top left of Bitku to connect their wallet and then clicking
"Create empty Bitku collection."
2. Connect the wallet that contains the Bitku to send, scroll down the "My Bitku" section and click on the menu
≡ for the Bitku to send, and then click "Send Bitku #X to another address." Enter the address that you want to send
the Bitku to and click "Send."

## How does it work?

The core of Bitku is comprised of 
[five smart contracts](https://github.com/docmarionum1/bitku/blob/main/docs/contracts.md), 
one that manages the supply and creation of the haiku and four that contain the text-generation model in a compressed format. 

When you click "Mint Bitku" on the Bitku website it sends a transaction on the Flow blockchain to the primary contract's [`mintHaiku`](https://github.com/docmarionum1/bitku/blob/main/contracts/HaikuNFT.cdc#L275) function which uses the model contracts to generate the text. 

## Status

[Bitku is currently live on the Flow mainnet](https://bitku.art/). 
The [Github issues page](https://github.com/docmarionum1/bitku/issues) lists future enhancements. Please submit any bugs found there.

## Get Involved

[Discord](https://discord.gg/YhcZuEdQck)

# Development

See [`docs/developing.md`](https://github.com/docmarionum1/bitku/blob/main/docs/developing.md) for 
information about setting this project up locally, testing, and deployment.
