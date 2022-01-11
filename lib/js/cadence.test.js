import path from "path";

import { Address, Dictionary, UFix64, UInt64 } from "@onflow/types";
import * as t from "@onflow/types";
import {
  init,
  emulator,
  sendTransaction,
  deployContractByName,
  getTransactionCode,
  getAccountAddress,
  mintFlow,
  getContractAddress,
  replaceImportAddresses,
  defaultsByName,
  executeScript,
  getFlowBalance
} from "flow-js-testing/dist";
import { getNextIDAndPrice, GET_HAIKU, GET_NEXT_ID_AND_PRICE } from "./src/cadence/scripts";
import { MINT_HAIKU_TRANSACTION, SETUP_FUSD_VAULT } from "./src/cadence/transactions";

const basePath = path.resolve(__dirname, "../cadence");

const replaceAddresses = (code, addressMap = {}) => {
  return replaceImportAddresses(code, {...defaultsByName, ...addressMap});
}

const TRANSFER_FUSD = `
import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FUSD from 0xFUSDADDRESS

transaction(amount: UFix64, to: Address) {

    // The Vault resource that holds the tokens that are being transferred
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {

        // Get a reference to the signer's stored vault
        let vaultRef = signer.borrow<&FUSD.Vault>(from: /storage/fusdVault)
			?? panic("Could not borrow reference to the owner's Vault!")

        // Withdraw tokens from the signer's stored vault
        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {

        // Get a reference to the recipient's Receiver
        let receiverRef =  getAccount(to)
            .getCapability(/public/fusdReceiver)
            .borrow<&{FungibleToken.Receiver}>()
			?? panic("Could not borrow receiver reference to the recipient's Vault")

        // Deposit the withdrawn tokens in the recipient's receiver
        receiverRef.deposit(from: <-self.sentVault)
    }
}
`

beforeAll(async (done) => {
  init(basePath, 8081);
  await emulator.start(8081, false);

  done();
});

afterAll(async (done) => {
  await emulator.stop();
  done();
});

describe("Test HaikuNFT", () => {
  const addressMap = {};

  test("Deploy Contracts", async () => {
    const account = await getAccountAddress("Bitku");
    expect(account).not.toBe(undefined);

    // Add flow to the account to pay for storage costs
    await mintFlow(account, "100.0");

    let result;

    // Deploy all of the model contracts  
    for (const name of ["NonFungibleToken", "FUSD", "Words", "Model", "SpaceModel", "EndModel"]) {

      result = await deployContractByName({
        name,
        to: account,
      });
      
      addressMap[name] = await getContractAddress(name);
  
      expect(result.errorMessage).toBe("");
    }

    // Then deploy the HaikuNFT contract

    result = await deployContractByName({
      "name": "HaikuNFT",
      "to": account,
      addressMap
    });

    addressMap["HaikuNFT"] = await getContractAddress("HaikuNFT");

    expect(result.errorMessage).toBe("");
  }, 30000); // 30 second timeout

  test("First ID is 64 and price is 0", async () => {
    const code = replaceAddresses(GET_NEXT_ID_AND_PRICE, addressMap);
    const result = await executeScript({ code });
    expect(parseFloat(result['64'])).toBe(0);
  });

  test("Setup FUSD", async() => {
    const account = await getAccountAddress("User");
    const code = replaceAddresses(SETUP_FUSD_VAULT, addressMap);
    const result = await sendTransaction({code, signers: [account]});
    expect(result.errorMessage).toBe("");
  });

  test("Mint Haiku", async () => {
    const account = await getAccountAddress("User");

    const code = replaceAddresses(MINT_HAIKU_TRANSACTION, addressMap);
    const args = [
      [64, UInt64],
      ["0.0", UFix64]
    ];

    const result = await sendTransaction({code, args, signers: [account]});
    expect(result.errorMessage).toBe("");
  });

  test("Get Haikus", async () => {
    const code = replaceAddresses(GET_HAIKU, addressMap);

    const haiku0 = await executeScript({code, args: [0, await getAccountAddress("Bitku")]});
    expect(haiku0).not.toBe("");

    const haiku64 = await executeScript({code, args: [64, await getAccountAddress("User")]});
    expect(haiku64).not.toBe("");

    // We don't know exactly what they should be, but they should be different
    expect(haiku0).not.toBe(haiku64);
  });

  test("Can't remint an existing haiku", async () => {
    const account = await getAccountAddress("User");

    const code = replaceAddresses(MINT_HAIKU_TRANSACTION, addressMap);
    const args = [
      [64, UInt64],
      ["0.0", UFix64]
    ];

    try {
      const result = await sendTransaction({code, args, signers: [account]});
      fail("Should have caused an error");
    } catch (e) {}
  });
  
  test("Haikus now cost > 0", async () => {
    const account = await getAccountAddress("User");

    const code = replaceAddresses(MINT_HAIKU_TRANSACTION, addressMap);
    const args = [
      [65, UInt64],
      ["0.0", UFix64]
    ];

    try {
      const result = await sendTransaction({code, args, signers: [account]});
      fail("Should have caused an error");
    } catch (e) {}
  });

  test("Tranfer FUSD to User", async () => {
    const contract = await getContractAddress("HaikuNFT");
    const account = await getAccountAddress("User");
    const code = replaceAddresses(TRANSFER_FUSD, addressMap);

    console.log(account);

    const args = [
      ["5.0", UFix64],
      [account, Address]
    ];

    const result = await sendTransaction({code, args, signers: [contract]});
    expect(result.errorMessage).toBe("");
  });
  
  test("Payment is processed", async () => {
    const account = await getAccountAddress("User");
    const user_balance = await getFlowBalance(account);

    let code = replaceAddresses(GET_NEXT_ID_AND_PRICE, addressMap);
    let result = await executeScript({ code });
    const price = result['65'];

    code = replaceAddresses(MINT_HAIKU_TRANSACTION, addressMap);
    const args = [
      [65, UInt64],
      [price, UFix64]
    ];

    result = await sendTransaction({code, args, signers: [account]});
    expect(result.errorMessage).toBe("");
    
    // User FLOW balance goes up since we are spotting storage costs
    expect(parseFloat(user_balance)).toBeLessThan(parseFloat(await getFlowBalance(account)));
  }); 
});