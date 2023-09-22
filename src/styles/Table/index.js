import React, { useState } from "react";
import { Button, Table, Form, Pagination } from "react-bootstrap";
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
  rejectDocumentAccess,
  maindata
}) => {
  const [Modal, setModal] = useState(false);
  const[ column, setColumn]= useState('')


 

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
    else if(req.requestedAttributes && (Number(req.status)===0 || Number(req.status)===2)){
      fields= req.requestedAttributes.map((item)=>{
        return {fieldName: item, value:true}
      })
    }
    
   
    setColumn('details')
    setAttributes(fields);
    setModal(true);
    console.log(req, maindata,"main")
    setSelectedIndex(index);
  };


  const handleShowRevokeModal = (req, index) => {
    setRequestData(req);
    let fields=[]
    
    if(req.approvedAttributeKeys.length > 0){
      fields= req.approvedAttributeKeys.map((item)=>{
        return {fieldName: item, value:false}
      })
    }
    setColumn('revoke')
   setAttributes(fields);
     setModal(true);
    setSelectedIndex(index);
  }

  const handleCheckbox = (e) => {
    let updatedField=[...Attributes]
   let index= updatedField.findIndex((fieldName)=>fieldName.fieldName===e.target.name)
   updatedField[index].value=e.target.checked
   setAttributes(updatedField)


  };

  const renderStatus = (status) => {
   
    if (Number(status) === 0) {
      return <p style={{ color: "orange" }}>Pending</p>;
    } else if (Number(status) === 1) {
      return <p style={{ color: "green" }}>Approved</p>;
    } else if (Number(status) === 2) {
      return <p style={{ color: "red" }}> Rejected</p>;
    }
    else if (Number(status) === 3) {
      return <p style={{ color: "#800000" }}> Revoked</p>;
    }
  };

  const renderTitle=(RequestData, column)=>{
    if(Number(RequestData.status)===0){
      return "Approve / Reject Attributes"
    }
    else if(Number(RequestData.status)===1 && column==='details'){
      return "Approved Attributes"

    }
    else if(Number(RequestData.status)===1 && column==='revoke'){
      return "Revoke Attributes?"

    }
    else if(Number(RequestData.status)===2){
      return "Rejected Attributes"
    }
    else if (Number(RequestData.status)===3 && RequestData.approvedAttributeKeys.length > 0){
      return "Remaining Attribute Access"
    }

  }

  return (
    <div>
     
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Verifier</th>
            <th>Document Type</th>
            <th>Status</th>
            <th>Request Details</th>
            <th>Revoke Access</th>
          </tr>
        </thead>
        <tbody>
          {data.length===0 ? <tr> <td colSpan="5" className="text-center">No records to display</td></tr> :
            data.map((request, index) => (
              <tr key={request.index}>
                <td>{request.verifierEmail}</td>
                <td>{request.documentType}</td>
                <td>{renderStatus(request.status)}</td>
                
                <td>
                  
                  <Button
                    variant="primary"
                    onClick={() => handleShowModal(request, index, 'details')}
                    disabled={Number(request.status)===3 && request.approvedAttributeKeys.length===0}
                  >
                    Details
                  </Button>
                </td>
                
                <td>
                  
                  <Button
                    variant="danger"
                    onClick={() => handleShowRevokeModal(request, index, 'revoke')}
                    disabled={Number(request.status)!==1}
                  >
                    Revoke
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
        //updateAccess={updateAccess}
        title={renderTitle(RequestData, column)}
        revokeAccess={revokeAccess}
        rejectDocumentAccess={rejectDocumentAccess}
        //update={true}
        approve={![1,2,3].includes(Number(RequestData.status))}
        reject={Number(RequestData.status)===0}
        revoke={(Number(RequestData.status)==1 && column==='revoke')}
      >
        <Form>
          {Attributes.map((fieldName) => (
            <Form.Check
              key={fieldName.fieldName}
              type="checkbox"
              checked={fieldName.value}
             
              name={fieldName.fieldName}
              onChange={(e) => handleCheckbox(e)}
              disabled={Number(RequestData.status)===2}
              label={
                <span
                  style={{
                    textDecoration: Number(RequestData.status)===2 ? "line-through":"none", 
                    textDecorationThickness: "0.5px" 
                  }}
                >
                  {` ${fieldName.fieldName}`}
                </span>
              }
              
            />
                ))}
        </Form>
      </CommonModal>
    </div>
  );
};

export default ReactTable;
