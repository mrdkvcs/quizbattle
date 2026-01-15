// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {SimpleStorage} from "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStorageContracts;

    function createSimpleStorageContract() public {
        simpleStorageContracts.push(new SimpleStorage());
    }

    function sfStore(
        uint256 _simpleStorageIndex,
        uint256 _newSimpleStorageNumber
    ) public {
        SimpleStorage simpleStorage = simpleStorageContracts[
            _simpleStorageIndex
        ];
        simpleStorage.store(_newSimpleStorageNumber);
    }

    function sfGet(uint256 _simpleStorageIndex) public view returns (uint256) {
        return simpleStorageContracts[_simpleStorageIndex].retrieveNumber();
    }
}
