import React, { useEffect, useState } from "react";
import { Col, Form, ListGroup, Row } from "react-bootstrap";
import { filterState } from "./data.js";

function CommonFilter(props) {

   const dropdownHandler=(e,filter)=>{
    let copy=[...props.commonFilter]
   let index= copy.findIndex((item)=>item.filtertype===filter.filtertype)
   if (e.target.value === "null") {
    copy[index].value = null;
  } else {
    copy[index].value = e.target.value;
  }
   props.setCommonFilter(copy)


  }
  const handleDropdownlist=(e,email, filter)=>{
    let updatefilter=[...props.commonFilter]
   let index =updatefilter.findIndex((item)=>item.filtertype===filter.filtertype)
   updatefilter[index].value=email
   props.setCommonFilter(updatefilter)
   props.setMatchedEmails([])

}

  const renderFilter = (filter) => {
    switch (filter.filtertype) {
      case "search":
        return (
          <Form.Group controlId={filter.filtertype}>
            <Form.Label>{filter.title}</Form.Label>
            <Form.Control type="text" autoComplete="off" onChange={(e)=>props.handleSearch(e, filter)} value={filter.value} placeholder={`Enter ${filter.title}`} />
            <ListGroup>
                {props.matchedEmails.map(email => (
                    <ListGroup.Item key={email} action onClick={(e)=>handleDropdownlist(e,email, filter)}>
                        {email}
                    </ListGroup.Item>
                ))}
            </ListGroup>
          </Form.Group>
        );
      case "status":
      case "document":
        return (
          <Form.Group controlId={filter.filtertype}>
            <Form.Label>{filter.title}</Form.Label>
            <Form.Control as="select" name={filter.filtertype} value={filter.value} onChange={(e)=>dropdownHandler(e, filter)}>
              <option value={"null"}>All</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Row xs={12} md={4}>
      {props.commonFilter.map((filter, index) => (
        <ListGroup.Item className="m-2" key={index}>
          {renderFilter(filter)}
        </ListGroup.Item>
      ))}
    </Row>
  );
}

export default CommonFilter;
