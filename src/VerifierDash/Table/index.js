import React, { useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import CommonModal from "../../styles/Modal";

export const ReactTable = ({ data }) => {
  const [Modal, setModal] = useState(false);
  const [ApprovedData, setApprovedData] = useState(null);
  const [rowData, setRowData] = useState(null);
  const handleCloseModal = () => {
    setModal(false);
  };

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

  const renderStatus = (status) => {
    if (Number(status) === 0) {
     return  <p style={{ color: "orange" }}>Pending</p>;
    } else if (Number(status) === 1) {
      return <p style={{ color: "green" }}>Approved</p>;
    } else if (Number(status) === 2) {
      return <p style={{ color: "red" }}> Rejected</p>;
    }
  };
  return (
    <div>
      {/* ... (existing code) */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Click for More</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((request, index) => (
              <tr key={request.index}>
                <td>{request.userAddress}</td>
                <td>{request.documentType}</td>
                <td>{renderStatus(request.status)}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleShowModal(request, index)}
                  >
                    Click for More
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <CommonModal
        size={"lg"}
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={handleCloseModal}
      >
        <div style={{ maxWidth: "100%", overflowY: "auto" }}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Attribute Name</th>
                <th>Approved Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rowData &&
                rowData?.requestedAttributes?.map((attributeName, index) => (
                  <tr key={index}>
                    <td>{attributeName}</td>
                    <td>{ApprovedData[attributeName]}</td>
                    {Number(rowData.status) === 1 && ApprovedData[attributeName]  ?
                      <td>
                        {" "}
                        <p style={{ color: "green" }}>Approved</p>{" "}
                      </td>
                    : <td>
                    <p style={{ color: "red" }}>Rejected</p>
                  </td> }
                    {Number(rowData.status) === 0 && (
                      <td>
                        <p style={{ color: "orange" }}>Pending</p>
                      </td>
                    )}
                    {Number(rowData.status) === 2 && (
                      <td>
                        <p style={{ color: "red" }}>Rejected</p>
                      </td>
                    )}
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
