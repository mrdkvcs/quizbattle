import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const AddFiveStorage = await ethers.getContractFactory("AddFiveStorage");
  const addFiveStorage = await AddFiveStorage.deploy();
  await addFiveStorage.waitForDeployment();

  const addFiveStorageAddress = await addFiveStorage.getAddress();
  console.log("StorageFactory deployed to:", addFiveStorageAddress);
  await addFiveStorage.store(5);
  console.log(
    "Stored value in AddFiveStorage:",
    await addFiveStorage.retrieveNumber()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
