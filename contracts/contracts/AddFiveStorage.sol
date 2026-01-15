// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {SimpleStorage} from "./SimpleStorage.sol";

contract AddFiveStorage is SimpleStorage {
    function store(uint256 _myFavouriteNumber) public override {
        myFavouriteNumber = _myFavouriteNumber + 5;
    }
}
