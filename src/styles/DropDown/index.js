import React, { useEffect, useState } from "react";
import { Container, Form, Col, Button } from "react-bootstrap";
import {
  passport,
  drivingLicense,
  loanAgreement,
  bankStatement,
} from "./attributes";

const Dropdown = (props) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({});
  const [FormInput, setFormInput] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    setFormData({});
  };

  const handleInputChange = (event) => {
    const { name, value, checked } = event.target;
    if (props.user === "user") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else if (props.user === "verifier") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Process the form data here (e.g., send to a backend server)
    if (props.user === "user") {
      props.handleSubmit(formData, selectedCategory);
    }
    if (props.user === "verifier") {
      let keys = Object.keys(formData);
      props.requestDocumentAccess(selectedCategory, keys);
    }
  };

  const renderAttributes = () => {
    if (selectedCategory === "passport") {
      return passport.map((attribute) => {
        if (attribute.fieldName !== "Physical Copy") {
          return (
            <Form.Group
              controlId={attribute.fieldName}
              key={attribute.fieldName}
            >
              <Form.Label>{attribute.fieldName}</Form.Label>
              <Form.Control
                type="text"
                name={attribute.fieldName}
                onChange={handleInputChange}
              />
            </Form.Group>
          );
        }
      });
    } else if (selectedCategory === "driving") {
      return drivingLicense.map((attribute) => {
        if (attribute.fieldName !== "Physical Copy") {
          return (
            <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
              <Form.Label>{attribute.fieldName}</Form.Label>
              <Form.Control
                type="text"
                name={attribute.fieldName}
                value={attribute.value}
                onChange={handleInputChange}
              />
            </Form.Group>
          );
        }
      });
    } else if (selectedCategory === "loan") {
      return loanAgreement.map((attribute) => {
        if (attribute.fieldName !== "Physical Copy") {
          return (
            <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
              <Form.Label>{attribute.fieldName}</Form.Label>
              <Form.Control
                type="text"
                name={attribute.fieldName}
                value={attribute.value}
                onChange={handleInputChange}
              />
            </Form.Group>
          );
        }
      });
    } else if (selectedCategory === "bank") {
      return bankStatement.map((attribute) => {
        if (attribute.fieldName !== "Physical Copy") {
          return (
            <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
              <Form.Label>{attribute.fieldName}</Form.Label>
              <Form.Control
                type="text"
                name={attribute.fieldName}
                value={attribute.value}
                onChange={handleInputChange}
              />
            </Form.Group>
          );
        }
      });
    }
  };
  
  

  const renderVerfierAttributes = () => {
    if (selectedCategory === "passport") {
      return passport.map((attribute) => (
        <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
          <Form.Check
            type="checkbox"
            label={attribute.fieldName}
            name={attribute.fieldName}
            onChange={handleInputChange}
          />
        </Form.Group>
      ));
    } else if (selectedCategory === "driving") {
      return drivingLicense.map((attribute) => (
        <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
          <Form.Check
            type="checkbox"
            label={attribute.fieldName}
            name={attribute.fieldName}
            checked={attribute.value}
            onChange={handleInputChange}
          />
        </Form.Group>
      ));
    } else if (selectedCategory === "loan") {
      return loanAgreement.map((attribute) => (
        <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
          <Form.Check
            type="checkbox"
            label={attribute.fieldName}
            name={attribute.fieldName}
            checked={attribute.value}
            onChange={handleInputChange}
          />
        </Form.Group>
      ));
    } else if (selectedCategory === "bank") {
      return bankStatement.map((attribute) => (
        <Form.Group controlId={attribute.fieldName} key={attribute.fieldName}>
          <Form.Check
            type="checkbox"
            label={attribute.fieldName}
            name={attribute.fieldName}
            checked={attribute.value}
            onChange={handleInputChange}
          />
        </Form.Group>
      ));
    } else {
      return null; // Handle other categories or cases here
    }
  };

  const handleFileChange = (e) => {
    props.setFile(e.target.files[0]);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="category">
          {props.user === "verifier" && (
            <>
              <Form.Label>User Address</Form.Label>
              <Form.Control
                type="text"
                value={props.reAddress}
                onChange={props.handleVerifierAddressChange}
              />
            </>
          )}
          <Form.Label>Select Document Category</Form.Label>
          <Form.Control
            as="select"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Select Category</option>
            <option value="passport">Passport</option>
            <option value="driving">Driving License</option>
            <option value="loan">Loan Agreement</option>
            <option value="bank">Bank Statement</option>
            {/* Add options for other categories */}
          </Form.Control>
        </Form.Group>
        {props.user === "user" ? renderAttributes() : renderVerfierAttributes()}
        {props.user === "user" && (
             <Form.Group controlId={'Physical Copy'}>
             <Form.Label>{'Physical Copy'}</Form.Label>
             <Form.Control
                 type="file"
                 name={'Physcial Copy'}
                 onChange={handleFileChange}
             />
         </Form.Group>
        //  <input className="m-2" type="file" onChange={handleFileChange} />
        )}
        {props.user === "user" && (
          <Button className="m-2" type="primary" onClick={props.uploadToPinata}>
            Upload Document
          </Button>
        )}
        {props.user === "user" && <Button type="submit">Add Document</Button>}
        {props.user === "verifier" && (
          <Button className="mt-4" type="submit">Send Request</Button>
        )}
      </Form>
    </Container>
  );
};

export default Dropdown;
