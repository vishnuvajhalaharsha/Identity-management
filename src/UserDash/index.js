import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Web3 from "web3";
import AuthContractABI from "../contracts/DocumentSharingContract.json";
import Table from "../styles/Table/index";
import CommonModal from "../styles/Modal";
import Dropdown from "../styles/DropDown";
import axios from "axios"

const AuthContractAddress = "0xfbbf58DA8Af9812392A239546Ca09C9dD9bCA5Ec";

const web3 = new Web3(window.ethereum);

const UserDash = ({ userRole }) => {
  const [contractInstance, setContractInstance] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [requestedDocuments, setRequestedDocuments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [RequestData, setRequestData] = useState({});
  const [Modal, setModal] = useState(false);
  const [file, setFile]=useState(null);
  const [hash, setHash]=useState(null)

 
  const [Attributes, setAttributes] = useState([]);

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
        console.log(contract, "contract");
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
      loadUserDocuments();
      loadRequestDocuments();
    }
  }, [contractInstance, userAddress]);

  const loadUserDocuments = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      // Call the smart contract method to get user documents
      const documents = await contractInstance.methods
        .getUserDocuments(userAddress)
        .call({ from: userAddress });
      console.log(documents);

      // Update the state with the retrieved documents
    } catch (error) {
      console.error("user documents:", error.message);
    }
  };

  const loadRequestDocuments = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      // Call the smart contract method to get user documents
      const requests = await contractInstance.methods
        .getUserRequests(userAddress)
        .call({ from: userAddress });
      console.log(requests, "rewss");
      setRequestedDocuments(requests);

      // Update the state with the retrieved documents
    } catch (error) {
      console.error("Error loading requets documents:", error);
    }
  };

  const updateAccess = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      if (Attributes) {
        let paramAttributes = [...Attributes];
        let approved = paramAttributes
          .filter((key) => key.value === true)
          .map((item) => item.fieldName);

        await contractInstance.methods
          .updateDocumentAccess(selectedIndex, approved)
          .send({ from: userAddress });
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const revokeAccess=async()=>{
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      if (Attributes) {
        let paramAttributes = [...Attributes];
        let revokeKeys = paramAttributes
          .filter((key) => key.value === true)
          .map((item) => item.fieldName);

          console.log(revokeKeys,"shbs")

        await contractInstance.methods
          .revokeDocumentAttributes(selectedIndex, revokeKeys)
          .send({ from: userAddress });
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }

  const approve = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      await contractInstance.methods
        .approveDocumentAccess(selectedIndex)
        .send({ from: userAddress });

      loadRequestDocuments();
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const openModal = () => {
    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
  };

  // Handle form submission
  const handleSubmit = async (formData, selectedCategory) => {
    if(hash){
    formData['Physical Copy']=hash
    }
    let keys = Object.keys(formData);
    let atrrValues = Object.values(formData);

    try {
      const accounts = await web3.eth.getAccounts();
      await contractInstance.methods
        .addDocument(selectedCategory, keys, atrrValues)
        .send({ from: accounts[0] });
      alert("Document added successfully!");
    } catch (error) {
      alert(`Failed to add document: ${error}`);
    }
  };

  const uploadToPinata = async (e) => {
    e.preventDefault()
    if (!file) return;


    const formData = new FormData();
    formData.append('file', file);

    const API_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    try {
        //setUploading(true);
        
        
        const PINATA_API_KEY = "1dcfa102156bdb45bb79";
        const PINATA_SECRET_API_KEY = "5b467e8cc0a1df58c4b6555012c8cf2cbf125a5a46cb67fc7b93180fa50e83a6";

        const response = await axios.post(API_ENDPOINT, formData, {
            maxBodyLength: 'Infinity', 
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });

        if (response.data.IpfsHash) {
          
            console.log("File uploaded successfully. IPFS Hash:", response.data.IpfsHash);
            setHash(response.data.IpfsHash)
            setFile(null)
        } else {
            console.error("Failed to upload to Pinata");
        }
    } catch (error) {
        console.error("Error uploading file:", error);
    } finally {
        //setUploading(false);
    }
};

const rejectDocumentAccess=async()=>{
  try {
    if (!contractInstance || !userAddress) {
      console.error("Contract instance or user address not available.");
      return;
    }

    await contractInstance.methods
      .rejectDocumentAccess(selectedIndex)
      .send({ from: userAddress });

    loadRequestDocuments();
  } catch (error) {
    console.error("Error sending request:", error);
  }
};




  return (
    <div>
     
      <div className="mt-3" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button variant="primary" onClick={openModal}>
          Add User Document
        </Button>
      </div>

     {console.log(file,"file")}

      <CommonModal
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
      >
        <Dropdown handleSubmit={handleSubmit} uploadToPinata={uploadToPinata} file={file} setFile={setFile} user={'user'} />
      </CommonModal>

      <h3 className="mt-3 mb-3">Document Requests</h3>

      <Table
        data={requestedDocuments}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        setRequestedDocuments={setRequestedDocuments}
        approve={approve}
        updateAccess={updateAccess}
        revokeAccess={revokeAccess}
        rejectDocumentAccess={rejectDocumentAccess}
        RequestData={RequestData}
        setRequestData={setRequestData}
        Attributes={Attributes}
        setAttributes={setAttributes}
      />

    
    </div>
  );
};

export default UserDash;
