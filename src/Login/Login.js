import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image } from 'react-bootstrap';


export const LoginMetamask = (props) => {
  

  

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#dcdcdc' }}>
      <Row className='d-flex align-items-center justify-content-center'>
       
        <Col>
        <img height={"130px"} width={"130px"} style={{ opacity: '0.6' }} src="/icons/metamask-icon.svg" alt="MetaMask Logo" />
        </Col>
        <Col>
        <Button  onClick={props.handleLoginWithMetamask}>
            Login With Metamask
          </Button>
        </Col>
       
      
      </Row>
    </Container>
  );
};

export default LoginMetamask
