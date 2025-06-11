// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StringStorage {
    string private storedString;

    event StringStored(address indexed sender, string value);

    constructor(string memory _initialString) {
        storedString = _initialString;
        emit StringStored(msg.sender, _initialString);
    }

    function storeString(string memory _newString) public {
        storedString = _newString;
        emit StringStored(msg.sender, _newString);
    }

    function getString() public view returns (string memory) {
        return storedString;
    }
}
