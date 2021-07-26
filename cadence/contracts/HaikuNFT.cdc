// This contract implements Bitku's HaikuNFT including the NFT resource which
// stores the text of each haiku and the function for minting+generating haiku.

import NonFungibleToken from "./NonFungibleToken.cdc"
import FlowToken from "./FlowToken.cdc"
import FungibleToken from "./FungibleToken.cdc"

import Words from "./Words.cdc"
import Model from "./Model.cdc"
import SpaceModel from "./SpaceModel.cdc"
import EndModel from "./EndModel.cdc"

pub contract HaikuNFT: NonFungibleToken {

    pub let maxSupply: UInt64
    pub var totalSupply: UInt64
    pub let preMint: UInt64
    pub let priceDelta: UFix64
    pub let charityAddress: Address
    pub let HaikuCollectionStoragePath: StoragePath
    pub let HaikuCollectionPublicPath: PublicPath

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64
        pub let text: String

        init(initID: UInt64, text: String) {
            self.id = initID
            self.text = text
        }
    }

    pub resource interface HaikuCollectionPublic {
        pub fun borrowHaiku(id: UInt64): &HaikuNFT.NFT
    }

    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, HaikuCollectionPublic {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init () {
            self.ownedNFTs <- {}
        }

        // withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @HaikuNFT.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        pub fun borrowHaiku(id: UInt64): &HaikuNFT.NFT {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
            return ref as! &HaikuNFT.NFT
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // public function that anyone can call to create a new empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }

    pub fun rand(i: UInt64, m: UInt64): UInt64 {
        return ((i * m) + UInt64(666)) % UInt64(0xfeedface)
    }

    pub fun ceil(_ i: UFix64): Int {
        if i > UFix64(UInt64(i)) {
            return Int(i) + 1
        }

        return Int(i)
    }

    pub fun getOptions(lineNum: Int, previousPreviousWord: String, previousWord: String): {String: Int} {
        let wordPair: String = previousPreviousWord.concat(" ").concat(previousWord)

        // Check surrounding lines in case this exact one is not defined for these words
        // < 3 ensures that we can check up to two lines away, which would be the max from line 0 -> 2 or vice versa
        var i = 0
        while i < 3 {
            var line = lineNum + i
            
            if (SpaceModel.model.containsKey(wordPair)) && (SpaceModel.model[wordPair]!.containsKey(line)) {
                return SpaceModel.model[wordPair]![line]!
            }
            if Model.model.containsKey(previousWord) && Model.model[previousWord]!.containsKey(line) {
                return Model.model[previousWord]![line]!
            }

            line = lineNum - i

            if SpaceModel.model.containsKey(wordPair) && SpaceModel.model[wordPair]!.containsKey(line) {
                return SpaceModel.model[wordPair]![line]!
            }
            if Model.model.containsKey(previousWord) && Model.model[previousWord]!.containsKey(line) {
                return Model.model[previousWord]![line]!
            }

            i = i + 1
        }

        return {"c": 1} // a == END, c == "\n"
    }

    pub fun getEndOptions(previousPreviousWord: String, previousWord: String): {String: Int} {
        // When we get too many syllables on the last line, try to get options from the end model
        let wordPair: String = previousPreviousWord.concat(" ").concat(previousWord)

        if EndModel.model.containsKey(wordPair) {
            return EndModel.model[wordPair]!
        }
        if EndModel.model.containsKey(previousWord) {
            return EndModel.model[previousWord]!
        }

        return {}
    }

    pub fun currentPrice(): UFix64 {
        let i = UFix64(self.totalSupply - self.preMint)
        return i*i*i*self.priceDelta / 10.0
    }

    pub fun captalize(_ a: String): String {
        switch a {
            case "a": return "A"
            case "b": return "B"
            case "c": return "C"
            case "d": return "D"
            case "e": return "E"
            case "f": return "F"
            case "g": return "G"
            case "h": return "H"
            case "i": return "I"
            case "j": return "J"
            case "k": return "K"
            case "l": return "L"
            case "m": return "M"
            case "n": return "N"
            case "o": return "O"
            case "p": return "P"
            case "q": return "Q"
            case "r": return "R"
            case "s": return "S"
            case "t": return "T"
            case "u": return "U"
            case "v": return "V"
            case "w": return "W"
            case "x": return "X"
            case "y": return "Y"
            case "z": return "Z"
            default: return a
        }
    }

    priv fun generateHaiku(_ seed: UInt64): String {
        var randNumber = seed
        var totalSyllables: Int = 0
        var lineSyllables: Int = 0
        var lineNum: Int = 0
        var previousPreviousWord: String = ""
        var previousWord: String = "b" // b == START
        var haiku: String = ""

        while previousWord != "END" {
            // Enforce line lengths
            if (lineNum == 0 && lineSyllables >= 5) || (lineNum == 1 && lineSyllables >= 7) {
                haiku = haiku.concat("\n")
                lineNum = lineNum + 1
                lineSyllables = 0
                previousPreviousWord = previousWord
                previousWord = "c" // c == "\n"
            } else {
                var options: {String: Int} = {}

                // When we get too many syllables on the last line, try to get options from the end model before falling back on the other models
                var end = false
                if lineNum == 2 && lineSyllables >= 4 {
                    options = HaikuNFT.getEndOptions(previousPreviousWord: previousPreviousWord, previousWord: previousWord)
                    if options.length > 0 {
                        end = true
                    }
                }
                
                // If it's not time to end, or if we didn't find end options
                if !end {
                    options = HaikuNFT.getOptions(lineNum: lineNum, previousPreviousWord: previousPreviousWord, previousWord: previousWord)
                }

                // Go through the options that we found
                let cumSums = options.values
                let maxCumSum = cumSums.removeLast()
                randNumber = HaikuNFT.rand(i: randNumber, m: 666)
                let i = randNumber % UInt64(maxCumSum)

                for word in options.keys {
                    let cumSum = options[word]!
                    let uncompressedWord = Words.uncompress[word]!
                    if UInt64(cumSum) >= i {
                        if uncompressedWord == "END" {
                            previousWord = "END"
                            //end = true
                            break
                        }

                        if uncompressedWord == "\n" {
                            haiku = haiku.concat("\n")
                            lineNum = lineNum + 1
                            lineSyllables = 0
                        } else if previousWord == "b" || previousWord == "c" { // START or \n
                            haiku = haiku.concat(
                                HaikuNFT.captalize(uncompressedWord.slice(from: 0, upTo: 1))
                            ).concat(
                                uncompressedWord.slice(from: 1, upTo: uncompressedWord.length)
                            )
                        } else {
                            haiku = haiku.concat(" ").concat(uncompressedWord)
                        }
                        previousPreviousWord = previousWord
                        previousWord = word
                        totalSyllables = totalSyllables + Words.syllables[uncompressedWord]!
                        lineSyllables = lineSyllables + Words.syllables[uncompressedWord]!
                        break
                    }
                }

                if end {
                    break
                }
            }
        }

        return haiku
    }
    
    pub fun mintHaiku(recipient: &NonFungibleToken.Collection, vault: @FungibleToken.Vault, id: UInt64) {
        pre {
            // Make sure that the ID matches the current ID
            id == HaikuNFT.totalSupply: "The given ID has already been minted."

            // Make sure that the ID is not greater than the max supply
            id < HaikuNFT.maxSupply: "There are no haiku left."

            // Make sure that the given vault has enough FLOW
            vault.balance >= HaikuNFT.currentPrice(): "The given FLOW vault doesn't have enough FLOW."
        }
        // https://github.com/onflow/flow-core-contracts/blob/master/transactions/flowToken/transfer_tokens.cdc

        // Split 90% to charity
        let charityVault <- vault.withdraw(amount: vault.balance * 0.9)
        let charityReceiverRef = getAccount(self.charityAddress)
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>() ?? panic("Could not borrow reference to contract's flow token receiver")
        charityReceiverRef.deposit(from: <- charityVault)


        // Send remaining 10% to contract account
        let contractReceiverRef = self.account
            .getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>() ?? panic("Could not borrow reference to contract's flow token receiver")
        contractReceiverRef.deposit(from: <- vault)

        // Seed the random number generator with the transaction info
        var blockId = getCurrentBlock().id

        var randNumber = self.totalSupply
        for byte in blockId {
           randNumber = HaikuNFT.rand(i: randNumber, m: UInt64(byte))
        }

        let haiku = HaikuNFT.generateHaiku(randNumber)

        recipient.deposit(token: <- create HaikuNFT.NFT(initID: HaikuNFT.totalSupply, text: haiku))
        HaikuNFT.totalSupply = HaikuNFT.totalSupply + (1 as UInt64)
    }


    init(charityAddress: Address) {
        // Set paths
        self.HaikuCollectionStoragePath = /storage/BitkuCollection
        self.HaikuCollectionPublicPath = /public/BitkuCollection

        // Initialize the total supply
        self.totalSupply = 0
        self.maxSupply = 1024
        self.preMint = 64

        // Intended to be one magnitude smaller, so we'll just divide again in the price function
        self.priceDelta = 0.00000345

        // Set the charity address
        self.charityAddress = charityAddress 

        // Create a Collection resource and save it to storage
        let collection <- create Collection()

        

        // Pre-mint n haikus and save them to this collection
        while self.totalSupply < self.preMint {
            let haiku = HaikuNFT.generateHaiku(self.totalSupply * UInt64(0xdeadbeef))
            collection.deposit(token: <- create HaikuNFT.NFT(initID: HaikuNFT.totalSupply, text: haiku))
            self.totalSupply = self.totalSupply + (1 as UInt64) 
        }

        self.account.save(<-collection, to: self.HaikuCollectionStoragePath)

        // create a public capability for the collection
        self.account.link<&HaikuNFT.Collection{NonFungibleToken.CollectionPublic, HaikuNFT.HaikuCollectionPublic}>(
            self.HaikuCollectionPublicPath,
            target: self.HaikuCollectionStoragePath
        )

        emit ContractInitialized()
    }
}
