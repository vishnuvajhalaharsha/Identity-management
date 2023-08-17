import React, { useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import CommonModal from "../Modal";

export const ReactTable = ({
  data,
  selectedIndex,
  setSelectedIndex,
  setRequestedDocuments,
  approve,
  RequestData,
  setRequestData,
  Attributes,
  setAttributes,
  updateAccess,
  revokeAccess,
  rejectDocumentAccess
}) => {
  const [Modal, setModal] = useState(false);
 

  const handleCloseModal = () => {
    setModal(false);
  };

  const handleShowModal = (req, index) => {
    setRequestData(req);
    let fields=[]
    if(req.approvedAttributeKeys.length > 0){
      fields= req.approvedAttributeKeys.map((item)=>{
        return {fieldName: item, value:true}
      })
    }
    else{
      fields= req.requestedAttributes.map((item)=>{
        return {fieldName: item, value:true}
      })
    }
    
   
    console.log(req,"sjsjs")
    setAttributes(fields);
    setModal(true);
    setSelectedIndex(index);
  };

  const handleCheckbox = (e) => {
    let updatedField=[...Attributes]
   let index= updatedField.findIndex((fieldName)=>fieldName.fieldName===e.target.name)
   updatedField[index].value=e.target.checked
   setAttributes(updatedField)


  };

  const renderStatus = (status) => {
    console.log(Number(status),"status")
    if (Number(status) === 0) {
      return <p style={{ color: "orange" }}>Pending</p>;
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
            <th>Verifier</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Click for More</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((request, index) => (
              <tr key={request.index}>
                <td>{request.verifier}</td>
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
        showModal={Modal}
        handleCloseModal={handleCloseModal}
        handleSaveChanges={approve}
        updateAccess={updateAccess}
        revokeAccess={revokeAccess}
        rejectDocumentAccess={rejectDocumentAccess}
        update={true}
        approve={true}
        reject={true}
        revoke={true}
      >
        <Form>
          {Attributes.map((fieldName) => (
            <Form.Check
              key={fieldName.fieldName}
              type="checkbox"
              checked={fieldName.value}
              label={` ${fieldName.fieldName}`}
              name={fieldName.fieldName}
              onChange={(e) => handleCheckbox(e)}
            />
          ))}
        </Form>
      </CommonModal>
    </div>
  );
};

export default ReactTable;
