import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  console.log("Deploying SimpleStorage...");

  const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();
  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();
  console.log("SimpleStorage deployed to:", address);

  await simpleStorage.store(42);
  const value = await simpleStorage.retrieveNumber();
  console.log("Stored and retrieved:", value.toString());

  await simpleStorage.addPerson("Balint", 12);
  await simpleStorage.addPerson("Josh", 24);
  const friends = await simpleStorage.retriveFriends();
  const friendsNames = friends.map((friend) => friend.name);
  console.log("Friend list updated ", friendsNames.join(", "));
  const joshFavouriteNumber = await simpleStorage.retrieveFriend("Josh");
  console.log("Josh's favourite number is ", joshFavouriteNumber.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
