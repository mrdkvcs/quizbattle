// ============================================================================
// IMPORTS - Bringing in the tools we need for testing
// ============================================================================

// Chai: Assertion library that lets us write readable test assertions
// Example: expect(value).to.equal(5)
import { expect } from "chai";

// In Hardhat 3, we get ethers through network.connect()
import { network } from "hardhat";

// Connect to the network and get ethers
// This is the new way to access ethers in Hardhat 3
const { ethers } = await network.connect();

// ============================================================================
// TEST SUITE - Organized collection of tests for SimpleStorage contract
// ============================================================================

// describe() creates a test suite - a group of related tests
// "SimpleStorage" is just a descriptive name shown in test output
describe("SimpleStorage", function () {
  // --------------------------------------------------------------------------
  // FIXTURE - Reusable deployment function
  // --------------------------------------------------------------------------

  // A "fixture" is a function that sets up a fresh test environment
  // It deploys contracts and returns everything needed for testing
  // Using fixtures keeps tests isolated - each test gets a fresh deployment
  async function deploySimpleStorageFixture() {
    // Step 1: Get test accounts (signers)
    // Hardhat provides 20 test accounts, each with 10,000 fake ETH
    // We destructure to get the first two accounts
    const [owner, otherAccount] = await ethers.getSigners();

    // What's a signer?
    // - Represents an Ethereum account that can sign transactions
    // - Has an address and private key (managed by Hardhat)
    // - Can send transactions and interact with contracts

    // Step 2: Get the contract factory
    // A "factory" is a JavaScript object that knows how to deploy a contract
    // It loads the compiled bytecode and ABI from artifacts/
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");

    // Under the hood, this:
    // - Reads artifacts/contracts/SimpleStorage.sol/SimpleStorage.json
    // - Extracts the bytecode (what gets deployed)
    // - Extracts the ABI (how to interact with it)
    // - Connects it to the default signer (owner)

    // Step 3: Deploy the contract
    // This creates a transaction that deploys the contract bytecode
    const simpleStorage = await SimpleStorage.deploy();

    // What happens here:
    // 1. Creates a deployment transaction with the contract bytecode
    // 2. Signs it with the owner's account
    // 3. Sends it to the Hardhat network (EDR)
    // 4. EDR processes the transaction and mines it in a new block
    // 5. Contract gets assigned an address (e.g., 0x5FbDB2315678...)
    // 6. Returns a contract instance connected to that address

    // The contract is now deployed and ready to interact with!

    // Step 4: Return everything tests might need
    // This makes it easy for tests to access the contract and accounts
    return { simpleStorage, owner, otherAccount };
  }

  // --------------------------------------------------------------------------
  // TEST CATEGORY: Deployment
  // --------------------------------------------------------------------------

  // Nested describe() blocks help organize tests into categories
  describe("Deployment", function () {
    // it() defines a single test
    // The string describes what the test verifies
    it("Should deploy successfully", async function () {
      // Load the fixture - deploys a fresh contract for this test
      const { simpleStorage } = await deploySimpleStorageFixture();

      // Verify the contract has an address
      // If deployment failed, this would throw an error
      const address = await simpleStorage.getAddress();

      // expect() creates an assertion
      // This checks that the address is a valid Ethereum address format
      expect(address).to.be.properAddress;

      // If we get here without errors, the test passes!
    });

    it("Should be deployed by the owner account", async function () {
      // Get both the contract and the owner signer
      const { simpleStorage, owner } = await deploySimpleStorageFixture();

      // You can verify who deployed the contract
      // The deployer is the account that sent the deployment transaction
      expect(await simpleStorage.runner?.getAddress()).to.equal(owner.address);
    });
  });

  // --------------------------------------------------------------------------
  // TEST CATEGORY: Storage Functionality
  // --------------------------------------------------------------------------

  describe("Storing Values", function () {
    it("Should store a value correctly", async function () {
      // Deploy the contract
      const { simpleStorage } = await deploySimpleStorageFixture();

      // Call the store() function to save a value
      // This creates a transaction that modifies the contract's state
      await simpleStorage.store(42);

      // What happens under the hood:
      // 1. ethers.js encodes the function call using the ABI:
      //    - Function selector: first 4 bytes of keccak256("store(uint256)")
      //    - Parameter encoding: 42 encoded as 32-byte hex
      // 2. Creates transaction: { to: contractAddress, data: encodedCall }
      // 3. Signs with default signer (owner)
      // 4. Sends to Hardhat network
      // 5. EDR executes the transaction:
      //    - Loads contract bytecode
      //    - Runs EVM with the encoded calldata
      //    - Updates storage slot 0 with value 42
      //    - Mines a block with this transaction
      // 6. Returns transaction receipt

      // Now retrieve the stored value
      const storedValue = await simpleStorage.retrieve();

      // What happens when calling retrieve():
      // - This is a "view" function (doesn't modify state)
      // - No transaction needed! It's a local call
      // - ethers.js uses eth_call RPC method
      // - EDR executes the function and returns the result
      // - No gas cost, instant response

      // Assert that the value we stored is the value we got back
      expect(storedValue).to.equal(42);
    });

    it("Should update the value when store is called again", async function () {
      const { simpleStorage } = await deploySimpleStorageFixture();

      // Store initial value
      await simpleStorage.store(100);
      expect(await simpleStorage.retrieve()).to.equal(100);

      // Update to new value
      await simpleStorage.store(200);

      // Verify it updated (not appended or anything else)
      expect(await simpleStorage.retrieve()).to.equal(200);
    });

    it("Should handle storing zero", async function () {
      const { simpleStorage } = await deploySimpleStorageFixture();

      // Edge case testing: what happens with zero?
      await simpleStorage.store(0);
      expect(await simpleStorage.retrieve()).to.equal(0);

      // This is important because:
      // - Default value of uint256 is 0
      // - Need to ensure 0 is explicitly stored, not just default
    });

    it("Should handle large numbers", async function () {
      const { simpleStorage } = await deploySimpleStorageFixture();

      // uint256 can store numbers up to 2^256 - 1
      // Let's test with a large number
      // Note the 'n' suffix - this creates a BigInt in JavaScript
      const largeNumber = 123456789012345678901234567890n;

      await simpleStorage.store(largeNumber);
      expect(await simpleStorage.retrieve()).to.equal(largeNumber);

      // Why BigInt?
      // - JavaScript's Number type can only safely represent integers up to 2^53-1
      // - Solidity's uint256 goes up to 2^256-1
      // - ethers.js uses BigInt for values that might exceed Number's limit
    });
  });

  // --------------------------------------------------------------------------
  // TEST CATEGORY: Access Control (if applicable)
  // --------------------------------------------------------------------------

  describe("Access Control", function () {
    it("Should allow anyone to store a value", async function () {
      const { simpleStorage, otherAccount } =
        await deploySimpleStorageFixture();

      // Connect the contract to a different signer
      // This makes otherAccount the sender of the transaction
      const simpleStorageAsOther = simpleStorage.connect(otherAccount);

      // Now when we call store(), it's sent from otherAccount, not owner
      await simpleStorageAsOther.store(999);

      // Verify the value was stored
      // (read from the original instance - view functions don't care about signer)
      expect(await simpleStorage.retrieve()).to.equal(999);

      // This demonstrates that the store() function is public
      // Anyone can call it since there are no access restrictions
    });
  });

  // --------------------------------------------------------------------------
  // TEST CATEGORY: Gas Estimation (Advanced)
  // --------------------------------------------------------------------------

  describe("Gas Usage", function () {
    it("Should estimate gas for storing a value", async function () {
      const { simpleStorage } = await deploySimpleStorageFixture();

      // Estimate how much gas this transaction will use
      // This doesn't execute the transaction, just simulates it
      const gasEstimate = await simpleStorage.store.estimateGas(42);

      // Gas estimation helps you:
      // - Predict transaction costs
      // - Detect unexpectedly expensive operations
      // - Optimize contract code

      // Let's verify it's reasonable (not exact, as gas costs vary)
      expect(gasEstimate).to.be.greaterThan(0);
      expect(gasEstimate).to.be.lessThan(100000); // Sanity check

      // For reference: storing a new value costs ~20,000-44,000 gas
      console.log(`      Gas estimate: ${gasEstimate.toString()}`);
    });
  });
});

// ============================================================================
// HOW TO RUN THESE TESTS
// ============================================================================

// In your terminal, run:
//   npx hardhat test
//
// This will:
// 1. Start Hardhat's EDR (in-memory blockchain)
// 2. Compile contracts if needed
// 3. Run all tests in the test/ directory
// 4. Show which tests passed/failed
//
// To run just this file:
//   npx hardhat test test/SimpleStorage.test.ts
//
// To run with more detail:
//   npx hardhat test --verbose

// ============================================================================
// IMPORTANT: ADD THIS FUNCTION TO YOUR CONTRACT
// ============================================================================

// For these tests to work, add this function to contracts/SimpleStorage.sol:
//
//   function retrieve() public view returns (uint256) {
//       return favouriteNumber;
//   }
//
// Without it, you can store values but can't read them back for testing!
