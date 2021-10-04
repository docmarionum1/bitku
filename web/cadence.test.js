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
import { MINT_HAIKU_TRANSACTION } from "./src/cadence/transactions";

const basePath = path.resolve(__dirname, "../cadence");

const replaceAddresses = (code, addressMap = {}) => {
  return replaceImportAddresses(code, {...defaultsByName, ...addressMap});
}

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
    for (const name of ["NonFungibleToken", "Words", "Model", "SpaceModel", "EndModel"]) {

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
  
  test("Payment is processed", async () => {
    const account = await getAccountAddress("User");
    // Add flow to the account to pay for storage costs
    await mintFlow(account, "1.0");
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
    
    // User balance goes down
    expect(parseFloat(user_balance)).toBeGreaterThan(parseFloat(await getFlowBalance(account)));
  }); 
});