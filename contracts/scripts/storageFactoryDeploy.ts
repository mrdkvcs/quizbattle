import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  console.log("Deploying StorageFactory...");

  const StorageFactory = await ethers.getContractFactory("StorageFactory");
  const storageFactory = await StorageFactory.deploy();
  await storageFactory.waitForDeployment();

  const storageFactoryAddress = await storageFactory.getAddress();
  console.log("StorageFactory deployed to:", storageFactoryAddress);
  await storageFactory.createSimpleStorageContract();
  await storageFactory.sfStore(0, 8);
  const simpleStoreNumber = await storageFactory.sfGet(0);
  console.log(
    "Storage factory's 0 index simple storage number:",
    simpleStoreNumber
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
