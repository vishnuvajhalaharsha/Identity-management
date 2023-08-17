import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

export const CommonModal = (props) => {
   
  return (
    <Modal show={props.showModal} style={{width:'100%'}} size={props.size} onHide={props.handleCloseModal}>
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        {props.children}
      </Modal.Body>
      <Modal.Footer>
      {props.revoke  && 
        <Button variant="primary" onClick={props.revokeAccess}>
          Revoke Access
        </Button> }
        {props.update  && 
        <Button variant="primary" onClick={props.updateAccess}>
          Update Access
        </Button> }
      
        {props.reject && <Button variant="danger" onClick={props.rejectDocumentAccess}>
          Reject
        </Button>
          }
          {props.approve &&
           <Button variant="success" onClick={props.handleSaveChanges}>
           Approve
         </Button> 
          }
          {props.sendRequest &&
           <Button variant="primary" onClick={props.sendUserRequest}>
           Send Request
         </Button> 
          }
       
      </Modal.Footer>
    </Modal>
  );
};
export default CommonModal;
