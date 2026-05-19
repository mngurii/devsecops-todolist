// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLog {
    string[] public logs;

    function addLog(string memory _hash) public {
        logs.push(_hash);
    }

    function getLog(uint index) public view returns (string memory) {
        return logs[index];
    }
}