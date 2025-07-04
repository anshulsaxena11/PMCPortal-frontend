import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { IoMdListBox } from "react-icons/io";

const FormComponent = ({ label, placeholder, value, onChange,disabled,readonly }) => {
  
  return (
    <Form>
      <Form.Group controlId="formDevice">
        <div className="row">
          <div className="col-sm-10 col-md-10 col-lg-10">
            <Form.Label>{label}</Form.Label>
          </div>
          <div className="col-sm-2 col-md-2 col-lg-2">
            {/* <Button className="btn btn-light" type="submit">
              <IoMdListBox  className="text-success fs-3" />
            </Button> */}
          </div>
        </div>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          disabled={disabled} 
          readonly={readonly} 
          onChange={onChange}  
        />
      </Form.Group>
    </Form>
  );
};

export default FormComponent;
