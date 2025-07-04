import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import 'react-toastify/dist/ReactToastify.css'; 
import "bootstrap/dist/css/bootstrap.min.css";
import { IoIosSave } from "react-icons/io";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from 'react-router-dom';
import Form from "react-bootstrap/Form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Spinner } from 'react-bootstrap'; 
import { ToastContainer, toast } from 'react-toastify';
import {getToolsAndHardwareMappping, postToolsAndHardware} from "../../../api/toolsAndHardware/toolsAndHardware"
import { directoratesList, srpiEmpTypeListActive } from '../../../api/syncEmp/syncEmp'
import DatePicker from "react-datepicker";
import toolsAndHardwareValidation from '../../../validation/toolsAndHardware'


const ToolsAndHardware = () => {
  const [data,setData] = useState([])
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedDir, setSelectedDir] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empData,setEmpData] = useState([])
  const [typeOfTool, setTypeOfTool] = useState()
  const [toolsData, setToolsDatas] = useState([]);
  const [dirOptions, setDirOptions] = useState([]);
  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(toolsAndHardwareValidation),
    defaultValues: {},
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
 
  const handleButtonClick = (e) => {
    e.preventDefault();
     handleSubmit(handleFormdataSubmit)();
  };
  const handleBackClick = ()=>{
    navigate(`/Tools-Hardware-list`) 
  }
  useEffect(() => {
    fetchData();
  }, []); 
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getToolsAndHardwareMappping();
      const fetchDatas = response.data;
      console.log(fetchDatas)
      setToolsDatas(fetchDatas)   
      if (fetchDatas && Array.isArray(fetchDatas)){
        const option = fetchDatas.map((item)=>({
          value:item._id,
          label:item.tollsName,
          type:item.toolsAndHardwareType,
      }))            
      setData(option);
      } 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTools = (SelectedOption) =>{
    const selectedTool=SelectedOption?.type
    setTypeOfTool(selectedTool)
    const selectedValue = SelectedOption?.label
    setSelectedTool(SelectedOption)
    setValue('tollsName',selectedValue)
  }

  useEffect(() => {
    fetchEmpList();
}, [selectedDir]);


  const fetchEmpList = async() =>{
    setLoading(true);
    try{
      if(selectedDir){
        const response = await srpiEmpTypeListActive()
        if (response && response.dropData) {
          const options = response.dropData
          .filter((dir) => dir.dir === selectedDir.value)
          .map((dir) => ({
            value: dir.ename,
            label: dir.ename,
          }));
          setEmpData(options);
        }
       } else {
          setEmpData([]);
        }
      
        }catch(error){
            console.error('Failed to fetch employee list:', error);
        }
        setLoading(false);  
    } 

  useEffect(() => {
    const fetchDiretoratesData = async () => {
      setLoading(true);
        try {
            const response = await directoratesList();
            const options = response.data.data.map((dir) => ({
                value: dir,
                label: dir,
            }));
            setDirOptions(options);
        } catch (error) {
            console.error('Error fetching Directorates list:', error);
        } finally {
          setLoading(false);
        }
    };
    fetchDiretoratesData();
  }, []);

  const handeleEmp = (Selected) =>{
    setSelectedEmp(Selected)
    setValue('assignedTo',Selected?.label)
  }

  const handleDir = (SelectedOption)=>{
    setSelectedDir(SelectedOption)
    setSelectedEmp("")
    setValue('directorates',SelectedOption?.label)
  }

    const handleFormdataSubmit = async (data) => {
    console.log('data reached here',data)
      setLoading(true)
      try{
      const payload={
        tollsName:data.tollsName,
        startDate: data.startDate, 
        endDate: data.endDate,
        assignedTo:data.assignedTo,
        directorates:data.directorates,
        purchasedOrder:data.purchasedOrder,
        description:data.description,
        quantity:data.quantity
      }
      console.log("payload data is",payload)
          const response = await postToolsAndHardware(payload);
          if(response.data.statusCode === 200){
            reset({
              tollsName:'',
              quantity:'',
              startDate: null,
              endDate: null,
              directorates:'',
              purchasedOrder:'',
              description:''
            })
            setSelectedTool(null)
            setSelectedDir(null)
            toast.success('Form submitted successfully!', {
                className: 'custom-toast custom-toast-success',
            });
          }else if(response.data.statuscode === 400 && response.message.includes("Tools And Hardware already exist")){
              toast.error(response.message, {
                  className: "custom-toast custom-toast-error",
              });
          }
      }catch(error){
      console.log(error)
      }
      setLoading(false);
    }
  return(
    <div className='container-fluid'>
        <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
        <div className='row'>
            <div className="col-sm-10 col-md-10 col-lg-10">
                <h1>Tools And Hardware</h1>
            </div>
            <div className='col-sm-2 col-md-2 ol-lg-2'>
                <Button variant="danger" className='btn btn-success ' onClick={handleBackClick}>
                    <TiArrowBack />BACK
                </Button>
            </div>
        </div>
        <hr></hr>
        <div className='row'>
          <Form onSubmit={handleSubmit}>
              <div className='row'>
                <div className='col-sm-4 col-md-4 col-lg-4'>
                  <Form.Group className="mb-3" >
                    <Form.Label className="fs-5 fw-bolder">Tools And Hardware Name<span className="text-danger">*</span></Form.Label>
                      <Controller
                          name="tollsName"
                          control={control}
                          render={({ field }) => (
                          <Select
                              {...field}
                              options={data} 
                              value={selectedTool}
                              isClearable
                              isDisabled={loading}
                              placeholder="Select Type"
                              onChange={handleTools}
                              />
                          )}
                      />
                      {errors.tollsName && <p className="text-danger">{errors.tollsName.message}</p>}
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-5 fw-bolder">Assigned Directorates<span className="text-danger">*</span></Form.Label>
                    <Controller
                          name="directorates"
                          control={control}
                          render={({ field }) => (
                          <Select
                              {...field}
                              options={dirOptions} 
                              value={selectedDir}
                              isClearable
                              isDisabled={loading}
                              placeholder="Select Type"
                              onChange={handleDir}
                              />
                          )}
                      />
                    {errors.directorates && <p className="text-danger">{errors.directorates.message}</p>}
                </Form.Group>
                </div>
                <div className='col-sm-4 col-md-4 col-lg-4'>
                  <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Quantity<span className="text-danger">*</span></Form.Label>
                    <Controller
                        name="quantity"
                        control={control}
                        render={({ field }) => <input {...field} className="form-control"  placeholder="Enter Quantity"/>}
                    />
                      {errors.quantity && <p className="text-danger">{errors.quantity.message}</p>}
                  </Form.Group>
                  <Form.Group className="mb-3">
                  <Form.Label className="fs-5 fw-bolder">Assigned Officer<span className="text-danger">*</span></Form.Label>
                  <Controller
                          name="assignedTo"
                          control={control}
                          render={({ field }) => (
                          <Select
                              {...field}
                              options={empData} 
                              value={selectedEmp}
                              isClearable
                              isDisabled={loading}
                              placeholder="Select Assigned Officer"
                              onChange={handeleEmp}
                              />
                          )}
                      />
                      {errors.purchasedOrder && <p className="text-danger">{errors.quantity.message}</p>}
                  </Form.Group>
                </div>
                <div className='col-sm-4 col-md-4 col-lg-4'>
                  <div className='row'>
                    <div className='col-sm-6 col-md-6 col-lg-6'>
                      <Form.Group className="mb-3" controlId="StartDate">
                         <Form.Label className="fs-5 fw-bolder">
                            {typeOfTool?.toLowerCase().includes('software')
                              ? 'License Start Date'
                              : typeOfTool?.toLowerCase().includes('warranty') || typeOfTool?.toLowerCase().includes('hardware')
                              ? 'Warranty Start Date'
                              : 'Start Date'}
                            <span className="text-danger">*</span>
                          </Form.Label>
                        <Controller
                          name="startDate"
                          control={control}
                          render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select Start Date" />}
                        />
                        {errors.startDate && <p className="text-danger">{errors.startDate.message}</p>}
                      </Form.Group>
                    </div>
                    <div className='col-sm-6 col-md-6 col-lg-6'>
                      <Form.Group className="mb-3" controlId="EndDate">
                       <Form.Label className="fs-5 fw-bolder">
                            {typeOfTool?.toLowerCase().includes('software')
                              ? 'License End Date'
                              : typeOfTool?.toLowerCase().includes('warranty') || typeOfTool?.toLowerCase().includes('hardware')
                              ? 'Warranty End Date'
                              : 'End Date'}
                            <span className="text-danger">*</span>
                          </Form.Label>
                        <Controller
                          name="endDate"
                          control={control}
                          render={({ field }) => <DatePicker {...field} selected={field.value} onChange={(date) => field.onChange(date)} className="form-control" dateFormat="MMMM d, yyyy" placeholderText="Select End Date" />}
                        />
                        {errors.endDate && <p className="text-danger">{errors.endDate.message}</p>}
                      </Form.Group>
                    </div>
                       <Form.Group className="mb-3">
                        <Form.Label className="fs-5 fw-bolder">Purchased Order<span className="text-danger">*</span></Form.Label>
                          <Controller
                              name="purchasedOrder"
                              control={control}
                              render={({ field }) => <input {...field} className="form-control"  placeholder="Enter Purchased Order"/>}
                          />
                            {errors.purchasedOrder && <p className="text-danger">{errors.quantity.message}</p>}
                        </Form.Group>
                  </div>
              </div>
            </div>
            <div className='row'>
            <Form.Group className="mb-3">
                <Form.Label className="fs-5 fw-bolder">Description<span className="text-danger">*</span></Form.Label>
                <Controller
                  name="description"
                  control={control}
                  render={({field})=>(
                    <textarea  {...field}
                      className='form-control'
                      placeholder="Enter Description"
                  />
                  )}
                />
                {errors.description && <p className="text-danger">{errors.description.message}</p>}
              </Form.Group>
            </div>
            <Button variant="primary" onClick={handleButtonClick} type="submit" disabled={loading}>
              {loading ? (
                  <Spinner animation="border" size="sm" />
              ) : (
                  <>
                      <IoIosSave /> SAVE
                  </>
              )}
          </Button>
          <Button variant="danger" className='btn btn-success mx-4' onClick={handleBackClick}>
            <TiArrowBack /> BACK
          </Button>
        </Form>
      </div>
    </div>
  )
};

export default ToolsAndHardware;