import React, { useState, useEffect } from "react";
import { Form, Button, Row } from "react-bootstrap";
import Web3 from "web3";
import AuthContractABI from "../contracts/DocumentSharingContract.json";
import VerfierTable from "./Table/index";
import CommonModal from "../styles/Modal";
import Dropdown from "../styles/DropDown";


const AuthContractAddress = "0xfbbf58DA8Af9812392A239546Ca09C9dD9bCA5Ec";

const web3 = new Web3(window.ethereum);

const UserDash = ({ userRole }) => {
  const [userAddress, setUserAddress] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [reAddress, setReqAddress] = useState("");
  const [Modal, setModal] = useState(false);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const contract = new web3.eth.Contract(
          AuthContractABI.abi,
          AuthContractAddress
        );
        setContractInstance(contract);

        const isRegistered = await contract.methods
          .userRoles(accounts[0])
          .call();
        setUserAddress(accounts[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    checkRegistration();
  }, []);

  useEffect(() => {
    if (contractInstance && userAddress) {
      loadRequestDocuments();
    }
  }, [contractInstance, userAddress]);

  const openModal = () => {
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
  };

  const loadRequestDocuments = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.log(contractInstance, userAddress);
        console.error("Contract instance or user address not available.");
        return;
      }

      contractInstance.methods
        .getVerifierRequests()
        .call({ from: userAddress })
        .then((result) => {
          // The result will contain the user addresses and their corresponding request statuses
          const users = result;
          console.log(result, "resultingggg");

          // Process the data as needed
          setUsers(users);
          console.log("Request Status: ");
        })
        .catch((error) => {
          console.error(
            "Error loading all requested documents: ",
            error.message
          );
        });

   
    } catch (error) {
      console.error("Error loading all requeted documents:", error);
    }
  };

  const handleVerifierAddressChange = (e) => {
    setReqAddress(e.target.value);
  };

  async function requestDocumentAccess( selectedCategory, keys) {
    try {
    
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0]; 
      console.log(selectedCategory, keys, "two")
      console.log(reAddress,selectedCategory, keys )
      // Call requestDocumentAccess function
      const result = await contractInstance.methods
        .requestDocumentAccess(
          reAddress,
          selectedCategory,
          keys
        )
        .send({ from: userAddress });

      console.log("Transaction successful:", result);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  return (
    <div>
      <h1>Verifier Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button variant="primary" onClick={openModal}>
          Request User Document
        </Button>
      </div>

    <CommonModal
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
        approve={false}
        reject={false}
        sendRequest={false}
        sendUserRequest={requestDocumentAccess}
      >
        
        <Dropdown
          handleVerifierAddressChange={handleVerifierAddressChange}
          reAddress={reAddress}
          user={"verifier"}
          requestDocumentAccess={requestDocumentAccess}
        />
      </CommonModal>

      <VerfierTable data={users} />
    </div>
  );
};

export default UserDash;
