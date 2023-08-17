import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";



export const Register = (props) => {
  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#f8f9fa" }}
    >
      <Row className="align-items-center">
        <Col>
          <Form>
            <Form.Group controlId="userRole">
              <Form.Label>Register as:</Form.Label>
              <Form.Control
                as="select"
                value={props.userRole}
                onChange={props.handleRoleChange}
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Verifier">Verifier</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col>
          <Button variant="primary" onClick={props.handleRegister}>
            {'Register With MetaMask'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
