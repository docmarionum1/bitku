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
8. That bitkus is now stored in your wallet. You can come back and view all of the Bitku that you've minted under "My Bitku."

## How does it work?

The core of Bitku is comprised of five smart contracts, one that manages the supply and creation of the haiku and four that contain the text-generation model in a compressed format. 

When you click "Mint Bitku" on the Bitku website it sends a transaction on the Flow blockchain to the primary contract's [`mintHaiku`](https://github.com/docmarionum1/bitku/blob/main/cadence/contracts/HaikuNFT.cdc#L275) function which uses the model contracts to generate the text. 

## Status

[Bitku is currently live on the Flow testnet](https://testnet.bitku.art/). Besides testing, the [issues page](https://github.com/docmarionum1/bitku/issues) lists the outstanding work that I need to do. Please submit any bugs found there.


## Development

The steps below outline how to set the project up locally and test it.

### Setup

1. Install [flow-cli](https://github.com/onflow/flow-cli)
2. Git clone this repository.
    - Create a `flow.json` file from `flow.json.template`, adjusting keys and addresses to match your flow emulator setup.
    - Run `flow emulator`
3. Git clone [fcl-dev-wallet](https://github.com/onflow/fcl-dev-wallet)
    - Modify `package.json` in the wallet to serve on port 3001 by changing `"dev": "next dev"` to `"dev": "next dev -p 3001"`
    - Add the correct address and keys for your emulator user to `.env.local`
    - `npm run dev`
4. Deploy the contracts from the root directory with `flow project deploy --network=emulator --update`
5. Create `web/.env.local` from `web/.env.local.template`
6. Run `yarn start` in `web/`

### Testing

Run the contract tests with:

  `npm run test-cadence`

(For tests to pass, the computation limit needs to be increased from the default 999).
Modify `web/node_modules/flow-js-testing/dist/index.js` changing 999 to 999999.
TODO: Allow limit to be configured in sendTransaction in `web/node_modules/flow-js-testing/src/interaction.js`

### Deployment

1. Deploy the contracts with `flow project deploy --network=testnet --update`
2. From `web` run `npm run build` and then copy the files into the deployment repository and commit and push them to github.
3. If `HaikuNFT` needs to be updated, replace the from `*.cdc` imports with the actual addresses and then update it with `flow accounts update-contract HaikuNFT cadence/contracts/HaikuNFT.cdc --network=testnet --signer testnet-bitku-account`
