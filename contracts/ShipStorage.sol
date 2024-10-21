// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipStorage {
    mapping(uint256 => string) private shipNames;

    function addShip(uint256 id, string memory name) public {
        shipNames[id] = name;
    }

    function getShipNameById(uint256 id) public view returns (string memory) {
        return shipNames[id];
    }
}