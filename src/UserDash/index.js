import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Web3 from "web3";
import AuthContractABI from "../contracts/DocumentSharingContract.json";
import Table from "../styles/Table/index";
import CommonModal from "../styles/Modal";
import Dropdown from "../styles/DropDown";
import axios from "axios";
import CommonFilter from "../styles/Search";
import { filterState } from "../styles/Search/data";

const AuthContractAddress = "0x95c1785866b2AAea8EaF9697a6f9bF16B8113DD4";

const web3 = new Web3(window.ethereum);

const UserDash = () => {
  const [contractInstance, setContractInstance] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [requestedDocuments, setRequestedDocuments] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [RequestData, setRequestData] = useState({});
  const [Modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState(null);
  const [commonFilter, setCommonFilter] = useState(filterState);
  const [emails, setMatchedEmails] = useState([]);
  const [Attributes, setAttributes] = useState([]);
  const [tabledata, setTableData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage,setCurrentPage]=useState(1)
  const [uploading, setUploading]=useState(false)
  const itemsPerPage = 5; 
 
  



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
    filterDocuments();
  }, [commonFilter]);

  const filterDocuments = () => {
    let filteredDocuments = [...requestedDocuments];

  

    // Apply search filter if a value is provided
    if (commonFilter[0].value) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        doc?.verifierEmail.includes(commonFilter[0].value)
      );
    }

    // Apply status filter if a value is provided
    if (commonFilter[1].value !== null) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => Number(doc?.status) === +commonFilter[1].value
      );
      console.log(filteredDocuments, "value 1", +commonFilter[1].value);
    }
    if (commonFilter[2].value !== null) {
      filteredDocuments = filteredDocuments.filter(
        (doc) => doc?.documentType === commonFilter[2].value
      );
    
    }
  
   setTableData([...filteredDocuments]);

   };

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
        console.log(documents,"documents")

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

      setRequestedDocuments(requests);
     
      setTableData(requests);
      const totalPages = Math.ceil(requests.length / itemsPerPage);
      setTotalPages(totalPages); 


    } catch (error) {
      console.error("Error loading requets documents:", error);
    }
  };

  const revokeAccess = async () => {
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

        await contractInstance.methods
          .revokeDocumentAttributes(selectedIndex, revokeKeys)
          .send({ from: userAddress });
          loadRequestDocuments();
          handleCloseModal();
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const approve = async () => {
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
          .approveDocumentAccess(selectedIndex, approved)
          .send({ from: userAddress });

        loadRequestDocuments();
        handleCloseModal()
      }
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
    if (hash) {
      formData["Physical Copy"] = hash;
    }
    let keys = Object.keys(formData);
    let atrrValues = Object.values(formData);

    try {
      const accounts = await web3.eth.getAccounts();
      await contractInstance.methods
        .addDocument(selectedCategory, keys, atrrValues)
        .send({ from: accounts[0] });
      alert("Document added successfully!");
      handleCloseModal();
    } catch (error) {
      alert(`Failed to add document: ${error}`);
    }
  };

  const handleSearch = async (e, filter) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    let copy = [...commonFilter];
    let index = copy.findIndex((item) => item.filtertype === filter.filtertype);
    copy[index].value = value;
    setCommonFilter(copy);
    if (value.length >= 3) {
      const emails = await getEmailsStartingWith(value);
      setMatchedEmails(emails);
    } else {
      setMatchedEmails([]);
    }
  };

  async function getEmailsStartingWith(prefix) {
    try {
      let emails = await contractInstance.methods
        .getEmailsStartsWith(prefix)
        .call();
      return emails;
    } catch (error) {
      console.error("Error fetching emails:", error);
      return [];
    }
  }
  const handleInputBlur = () => {
    setMatchedEmails([]);
  };

  const uploadToPinata = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const API_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    try {
      setUploading(true);

      const PINATA_API_KEY = "1dcfa102156bdb45bb79";
      const PINATA_SECRET_API_KEY =
        "5b467e8cc0a1df58c4b6555012c8cf2cbf125a5a46cb67fc7b93180fa50e83a6";

      const response = await axios.post(API_ENDPOINT, formData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      });

      if (response.data.IpfsHash) {
        console.log(
          "File uploaded successfully. IPFS Hash:",
          response.data.IpfsHash
        );
        setHash(response.data.IpfsHash);
        setFile(null);
        alert("File Uploaded Successfully!")
      } else {
        console.error("Failed to upload to Pinata");
        alert("Oops, something went wrong!, Try again")
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const rejectDocumentAccess = async () => {
    try {
      if (!contractInstance || !userAddress) {
        console.error("Contract instance or user address not available.");
        return;
      }

      await contractInstance.methods
        .rejectDocumentAccess(selectedIndex)
        .send({ from: userAddress });

      loadRequestDocuments();
      handleCloseModal();
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <div>
      <div
        className="mt-3"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <Button  variant="primary" onClick={openModal}>
          Add User Document
        </Button>
      </div>
      <div className="mt-3">
        <CommonFilter
          handleSearch={handleSearch}
          handleInputBlur={handleInputBlur}
          matchedEmails={emails}
          setMatchedEmails={setMatchedEmails}
          commonFilter={commonFilter}
          setCommonFilter={setCommonFilter}
        />
      </div>
      <CommonModal
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
        title={"Add your Document"}
      >
        <Dropdown
          handleSubmit={handleSubmit}
          uploadToPinata={uploadToPinata}
          file={file}
          setFile={setFile}
          user={"user"}
          uploading={uploading}
        />
      </CommonModal>

      <h3 className="mt-3 mb-3">Document Requests</h3>
      <Table
        data={tabledata}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        setRequestedDocuments={setRequestedDocuments}
        approve={approve}
        uploading={uploading}
        revokeAccess={revokeAccess}
        rejectDocumentAccess={rejectDocumentAccess}
        RequestData={RequestData}
        setRequestData={setRequestData}
        Attributes={Attributes}
        setAttributes={setAttributes}
        maindata={requestedDocuments}
      />
    </div>
  );
};

export default UserDash;
