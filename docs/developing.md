# Development

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
5. Run `flow transactions send transactions/pre_mint.cdc --gas-limit 9999999 64`
6. Create `lib/js/.env.local` from `lib/js/.env.local.template`
7. In `lib/js/` Run `yarn` to install dependencies
8. Run `yarn start` to start the frontend server

### Testing

Run the contract tests with:

  `npm run test-cadence`

(For tests to pass, the computation limit needs to be increased from the default 999).
Modify `lib/js/node_modules/flow-js-testing/dist/index.js` changing 999 to 999999.
TODO: Allow limit to be configured in sendTransaction in `lib/js/node_modules/flow-js-testing/src/interaction.js`

### Deployment

1. [Create an account](https://docs.onflow.org/concepts/accessing-testnet/#account-creation-and-token-funding-requests) and update the address and keys for `testnet-bitku-account` in `flow.json`.
2. Run `flow transactions send transactions/setup_fusd_vault.cdc --network=testnet --signer testnet-bitku-account`
3. Deploy the contracts with `flow project deploy --network=testnet --update`
4. Run `for i in {1..32}; do flow transactions send transactions/pre_mint.cdc --network=testnet --signer testnet-bitku-account --gas-limit 9999 2; done` to complete the pre-mint.
5. Modify `lib/js/.env.local` to set the correct network (Testnet or Mainnet).
6. From `lib/js` run `npm run build` and then copy `build` into the deployment repository and commit and push them to github.
7. To test on testnet, create a Blocto account and
[fund it with FUSD](https://testnet-faucet.onflow.org/fund-account), then attempt to mint haikus.
8. To update testnet, run `flow project deploy --network=testnet --update`
9. If `HaikuNFT` needs to be updated on mainnet, replace the from `*.cdc` imports with the [actual addresses](https://flow-view-source.com/mainnet/account/0xf61e40c19db2a9e2/contract/HaikuNFT) and then update it with `flow accounts update-contract HaikuNFT contracts/HaikuNFT.cdc --network=mainnet --signer mainnet-bitku-account`
