## Setup

Install flow
Git clone fcl-dev-wallet

## Running

From the root directory start the emulator with

  `flow emulator`

Then deploy the contracts with:

  `flow project deploy --network=emulator --update`

Other commands with the flow cli:

  #flow accounts create --network=emulator --key 1719d6f599b841b84cd282b2930cc5b9e88e6e56a8c7b3dfa71aec0205705d238c62080898568030be0bd4d187ebf2d3e22be03a181c5ff32571c1c2b19f84df --signer emulator-account

  flow transactions send cadence/transactions/transfer_tokens.cdc --args-json '[{"type": "UFix64", "value": "1.0"}, {"type": "Address", "value": "0xf669cb8d41ce0c74"}]'

  flow scripts execute cadence/scripts/CheckCollection.cdc


Start the wallet `fcl-dev-wallet/`

  npm run dev

Start the webserver in `web/`

  yarn start
