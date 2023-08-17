// ExampleWeb3.js

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import AuthContract from "./contracts/AuthContract.json"; // Import your smart contract JSON ABI


export const ContractWeb3 = () => {
  const [contractInstance, setContractInstance] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        // Modern dapp browsers
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });
          // Get the user's Ethereum address
          const accounts = await web3.eth.getAccounts();
          setUserAddress(accounts[0]);
          // Load the contract
          const networkId = await web3.eth.net.getId();
          const contractData = AuthContract.networks[networkId];
          if (contractData) {
            const instance = new web3.eth.Contract(AuthContract.abi, contractData.address);
            setContractInstance(instance);
          } else {
            console.error("Contract not deployed to the current network.");
          }
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        console.error("Please install MetaMask or another Ethereum-compatible browser extension.");
      }
    };

    initWeb3();
  }, []);

 console.log(contractInstance,userAddress,"sjhs")

  return contractInstance, userAddress

}


