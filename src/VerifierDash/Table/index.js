import React, { useState } from "react";
import { Button, Table, Form, Pagination } from "react-bootstrap";
import CommonModal from "../../styles/Modal";

export const ReactTable = ({ data }) => {
  const [Modal, setModal] = useState(false);
  const [ApprovedData, setApprovedData] = useState(null);
  const [rowData, setRowData] = useState(null);
  const handleCloseModal = () => {
    setModal(false);
  };
  const itemsPerPage = 4; // Number of items to show per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the indexes for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Extract the data for the current page
  const currentPageData = data.slice(startIndex, endIndex);

  const handleShowModal = (req, index) => {
    setRowData(req);
    const approvedValuesMap = {};
    for (let i = 0; i < req.approvedAttributeKeys.length; i++) {
      approvedValuesMap[req.approvedAttributeKeys[i]] =
        req.approvedAttributeValues[i];
    }
    
    setApprovedData(approvedValuesMap);

    setModal(true);
  };

  const renderStatus = (status, attribute) => {
    if (Number(status) === 0) {
     return  <p style={{ color: "orange" }}>Pending</p>;
    } else if (Number(status) === 1  ) {
      return <p style={{ color: "green" }}>Approved</p>;
    }
    
     else if (Number(status) === 2) {
      return <p style={{ color: "red" }}> Rejected</p>;
    }
    else if (Number(status) === 3 ) {
      return <p style={{ color: "#800000" }}> Revoked</p>;
    }
    
  };

  const renderModalStatus = (status, attribute) => {
    console.log(attribute,"attribute")
   
    if (Number(status) === 0) {
     return  <p style={{ color: "orange" }}>Pending</p>;
    } else if (Number(status) === 1 && attribute!== null) {
      return <p style={{ color: "green" }}>Approved</p>;
    }
    else if (Number(status) === 1 && attribute===undefined ) {
      return <p style={{ color: "red" }}>Rejected</p>;
    }
     else if (Number(status) === 2) {
      return <p style={{ color: "red" }}> Rejected</p>;
    }
    else if (Number(status) === 3 && attribute===undefined) {
      return <p style={{ color: "#800000" }}> Revoked</p>;
    }
    else if (Number(status) === 3 && attribute?.length > 0) {
      return <p style={{ color: "green" }}> Approved</p>;
    }
  };
  return (
    <div>
    
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Document Type</th>
            <th>Current Status</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          {currentPageData.length===0 ? <tr> <td colSpan="3" className="text-center">No records to display</td></tr> :
            currentPageData.map((request, index) => (
              <tr key={request.index}>
                <td>{request.userEmail}</td>
                <td>{request.documentType}</td>
                <td>{renderStatus(request.status,request.approvedAttributeKeys)}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleShowModal(request, index)}
                  >
                    Details
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center">
        <Pagination>
          {Array.from({ length: Math.ceil(data.length / itemsPerPage) }, (_, index) => (
            <Pagination.Item
              key={index + 1}
              active={index + 1 === currentPage}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      </div>
      <CommonModal
        size={"lg"}
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
        title={"Summary"}
      >
        <div style={{ maxWidth: "100%", overflowY: "auto" }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Document Attribute Info</th>
                <th>Approved Attribute Info</th>
                {/* <th> Attribute Status</th> */}
              </tr>
            </thead>
            <tbody>
             
              {rowData &&
                rowData?.requestedAttributes?.map((attributeName, index) => (
                  <tr key={index}>
                    <td>{attributeName}</td>
                    <td>{attributeName==='Physical Copy' ? <img src={`https://ipfs.io/ipfs/${ApprovedData[attributeName]}`}  width={"300px"} height={"300px"}/> : ApprovedData[attributeName]}</td>
                    
                  
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </CommonModal>
    </div>
  );
};

export default ReactTable;
