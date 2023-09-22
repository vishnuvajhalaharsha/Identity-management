import React, { useState, useEffect } from "react";
import { Form, Button, Row } from "react-bootstrap";
import Web3 from "web3";
import AuthContractABI from "../contracts/DocumentSharingContract.json";
import VerfierTable from "./Table/index";
import CommonModal from "../styles/Modal";
import CommonFilter from "../styles/Search";
import Dropdown from "../styles/DropDown";
import {filterState} from "../styles/Search/data"

const AuthContractAddress = "0x95c1785866b2AAea8EaF9697a6f9bF16B8113DD4";

const web3 = new Web3(window.ethereum);

const UserDash = ({ userRole }) => {
  const [userAddress, setUserAddress] = useState("");
  const [contractInstance, setContractInstance] = useState(null);
  const [reAddress, setReqAddress] = useState("");
  const [Modal, setModal] = useState(false);
  const [matchedEmails, setMatchedEmails] = useState([]);
  const [filterbyEmail, setFilterByEmail]=useState([])
  const [commonFilter, setCommonFilter]=useState(filterState)
  const [tabledata, setTableData]=useState([])
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage,setCurrentPage]=useState(1)
  const itemsPerPage = 5;

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
        console.error("Contract instance or user address not available.");
        return;
      }

      contractInstance.methods
        .getVerifierRequests()
        .call({ from: userAddress })
        .then((result) => {
          // The result will contain the user addresses and their corresponding request statuses
          const users = result;

          setUsers(users);
          setTableData(users)
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

  const handleVerifierAddressChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setReqAddress(value);

    if (value.length >= 3) {
      const emails = await getEmailsStartingWith(value);
      setMatchedEmails(emails);
    } else {
      setMatchedEmails([]);
    }
  };

  useEffect(() => {
    filterDocuments();
  }, [commonFilter]);

  const filterDocuments = () => {
    let filteredDocuments = [...users];

    if (commonFilter[0].value) {
      filteredDocuments = filteredDocuments.filter((doc) =>
        doc?.userEmail.includes(commonFilter[0].value)
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
      console.log(filteredDocuments, "value 2", commonFilter[2].value);
    }
    console.log(filteredDocuments, "filterDoc", commonFilter);
    const startIndex = (currentPage - 1) * itemsPerPage;
    
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
setTotalPages(totalPages);

  
   setTableData([...filteredDocuments]);
    //setTableData([...filteredDocuments]);
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
      setFilterByEmail(emails);
    } else {
      setFilterByEmail([]);
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
    setFilterByEmail([])
  };

  async function requestDocumentAccess(selectedCategory, keys) {
    try {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      // Call requestDocumentAccess function
      const result = await contractInstance.methods
        .requestDocumentAccess(reAddress, selectedCategory, keys)
        .send({ from: userAddress });
        loadRequestDocuments();
        handleCloseModal();
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }

  return (
    <div>
    
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
          marginTop:"10px"
        }}
      >
        <Button variant="primary" onClick={openModal}>
          Request User Document
        </Button>
      </div>
      <div className="m-3">
        <CommonFilter
          handleSearch={handleSearch}
          handleInputBlur={handleInputBlur}
          matchedEmails={filterbyEmail}
          setMatchedEmails={setFilterByEmail}
          commonFilter={commonFilter}
          setCommonFilter={setCommonFilter}
        />
      </div>

      <CommonModal
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
        approve={false}
        reject={false}
        sendRequest={false}
        sendUserRequest={requestDocumentAccess}
        title={"Send Request"}
      >
        <Dropdown
          handleVerifierAddressChange={handleVerifierAddressChange}
          reAddress={reAddress}
          user={"verifier"}
          matchedEmails={matchedEmails}
          handleInputBlur={handleInputBlur}
          setReqAddress={setReqAddress}
          setMatchedEmails={setMatchedEmails}
          requestDocumentAccess={requestDocumentAccess}
        />
      </CommonModal>

      <VerfierTable data={tabledata} />
    </div>
  );
};

export default UserDash;
