pragma solidity ^0.8.19;

// SPDX-License-Identifier: MIT

library StringUtils {
    // Function to check if a string starts with a given prefix.
    function startsWith(string memory str, string memory prefix) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory prefixBytes = bytes(prefix);

        // If the prefix is longer than the string, it can't be a prefix.
        if (prefixBytes.length > strBytes.length) {
            return false;
        }

        // Iterate through each character to compare with the prefix.
        for (uint i = 0; i < prefixBytes.length; i++) {
            if (strBytes[i] != prefixBytes[i]) {
                return false;
            }
        }
        // If all characters match, it starts with the prefix.
        return true;
    }

    // Function to check if two strings are equal.
    function equal(string memory a, string memory b) internal pure returns (bool) {
        // Check if the lengths of the strings are different.
        if (bytes(a).length != bytes(b).length) {
            return false;
        } else {
            // Use keccak256 hash comparison to check string equality.
            return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
        }
    }
}

