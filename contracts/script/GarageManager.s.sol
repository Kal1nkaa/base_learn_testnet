// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {GarageManager} from "../src/GarageManager.sol";

contract GarageManagerScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the GarageManager contract
        new GarageManager();

        vm.stopBroadcast();
    }
}
