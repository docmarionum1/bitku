## Setup

Install flow
Git clone fcl-dev-wallet

## Running

### From the root directory start the emulator with

  `flow emulator`

### Then deploy the contracts with:

  `flow project deploy --network=emulator --update`

### Set up the wallet `fcl-dev-wallet/`:

  `git clone git@github.com:onflow/fcl-dev-wallet.git`
  
  Modify `package.json` to serve the wallet on port 3001

  Change `"dev": "next dev"` to `"dev": "next dev -p 3001"`

  `npm run dev`

Start the webserver in `web/`

  yarn start

Before trying to mint any haikus,
Create new test accounts from the fcl-dev-wallet web interface to create the charity address by clicking "Initialize Dev Wallet for more Accounts" on the screen to connect your wallet.

Run the contract tests with:

  `npm run test-cadence`

(For tests to pass, the computation limit needs to be increased from the default 999).
Modify `web/node_modules/flow-js-testing/dist/index.js` changing 999 to 999999.
TODO: Allow limit to be configured in sendTransaction in `web/node_modules/flow-js-testing/src/interaction.js`