// Layout.js
import React from "react";
import { Navbar, Nav, Container, Row } from "react-bootstrap";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar style={{background:'#0d6efd',}}   expand="lg">
        <Navbar.Brand style={{ color:'white', margin:'0.5rem'}} href="/">SmartShare</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link  style={{ color:'white'}}href="/userdashboard">User Dashboard</Nav.Link>
            <Nav.Link  style={{ color:'white'}} href="/verifierdashboard">Verifier Dashboard</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container fluid className="content" style={{height:'60vh'}}>
        <Row className="full-height">
          {children}
        </Row>
      </Container>
   
    </>
  );
};

export default Layout;
