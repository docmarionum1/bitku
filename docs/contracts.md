# Contracts

This project uses five contracts: 1 that defines the NFT, how they're created, etc.
and four that define the text-generation model.

All contracts are found in `/contracts`

## `HaikuNFT.cdc`

This is the primary contract that users will interact with. It defines the NFT using the `NonFungibleToken` 
standard. The functions of note are: 
- `generateHaiku` which uses the model to create a haiku given a seed. This function
contains the logic for how to generate a haiku given the mappings in the model.
- `mintHaiku` which handles the transaction of generating and giving a haiku to a user's collection in
exchange for FUSD.
- `preMindHaikus` which is used to run the pre-mint of 64 haikus and store them in the contract's collection.

## `Model.cdc`, `SpaceModel.cdc`, `EndModel`.cdc, and `Words.cdc`

These four contracts contain the model itself. It is split into four contracts due to size contraints on any individual contract. The model is a markov chain model that has been compressed to make it fit in the Flow size limit.

- `Model.cdc` contains a dictionary that maps from a word to a dictionary of words that 
could follow for each line of the poem (1, 2, or 3).
- `SpaceModel.cdc` has the same but for pairs of words separated by a space.
- `EndModel.cdc` is used to find words that typically come at the end of a poem.
- `Words.cdc` contains the syllable counts for each word, and a mapping of the
compressed representation of each word to the actual word.

## Standard contracts for development

There are four contracts included in the repo that mirror standard Flow contracts
that are unavailable by default in the development emulator:

- `FungibleToken.cdc`
- `FlowToken.cdc`
- `FUSD.cdc`
- `NonFungibleToken.cdc`
