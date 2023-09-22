import React, { useState } from "react";
import { Container, Row, Col, Form, Button, FormControl } from "react-bootstrap";



export const Register = (props) => {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      <Row className="align-items-center">
        
        <Row>
        <Form>
            <Form.Group controlId="userRole">
              <Form.Label>Register as:</Form.Label>
              <Form.Control
                as="select"
                value={props.userRole}
                onChange={props.handleRoleChange}
                className="m-2"
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Verifier">Verifier</option>
              </Form.Control>
              <FormControl type="email" placeholder="Register With Email Address" value={props.email} onChange={props.handleEmail}/>
            </Form.Group>
          </Form>
        </Row>
          
        
        <div style={{alignItems:'center', justifyContent:'center'}} className="m-2">
        <Button variant="primary" onClick={props.handleRegister}>
            {'Register With MetaMask'}
          </Button>
        </div>
        
        
      </Row>
    </Container>
  );
};

export default Register;
