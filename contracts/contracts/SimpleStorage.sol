// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 myFavouriteNumber;
    struct Person {
        uint256 favouriteNumber;
        string name;
        bool isCool;
    }

    Person[] friends;
    mapping(string => uint256) public nameToFavNumbers;

    function store(uint256 _favouriteNumber) public virtual {
        myFavouriteNumber = _favouriteNumber;
    }

    function retrieveNumber() public view returns (uint256) {
        return myFavouriteNumber;
    }

    function retriveFriends() public view returns (Person[] memory) {
        return friends;
    }

    function retrieveFriend(string memory _name) public view returns (uint256) {
        return nameToFavNumbers[_name];
    }

    function addPerson(string memory _name, uint256 _favouriteNumber) public {
        friends.push(
            Person({
                favouriteNumber: _favouriteNumber,
                name: _name,
                isCool: true
            })
        );
        nameToFavNumbers[_name] = _favouriteNumber;
    }
}
