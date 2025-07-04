import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  
import { getProjectDetailsById } from '../../../api/ProjectDetailsAPI/projectDetailsApi'; 
import DetailView from '../../../components/DetailsView/DetailView'; 
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const ProjectDetailView = () => {
  const { id } = useParams(); 
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjectDetails = async () => {
    try {
      const response = await getProjectDetailsById(id); 
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:',);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fields = [
    'orderType', 
    'projectName',
    'type', 
    'orginisationName', 
    'startDate',
    'endDate',
    'projectValue',
    'projectManager', 
    'typeOfWork',
    'projectType', 
    'primaryPersonName', 
    'primaryPersonPhoneNo',
    'primaryPersonEmail',
    'secondaryPersonName',
    'secondaryPrsonPhoneNo',
    'secondaryPersonEmail',
    'directrate',
    'serviceLocation',
    'workOrderUrl', 
  ];


  const labels = {
    orderType: 'Order Type',
    projectName: 'Project Name',
    type: 'Type',
    orginisationName: 'Organisation Name',
    startDate: 'Start Date',
    endDate: 'End Date',
    projectValue: 'Project Value',
    projectManager: 'Project Manager',
    typeOfWork: 'Type Of Work',
    projectType: 'Scope of Work',
    primaryPersonName: 'Primary Person Name',
    primaryPersonPhoneNo: 'Primary Person Phone Number',
    primaryPersonEmail: 'Primary Person Email',
    secondaryPersonName: 'Secondary Person Name',
    secondaryPrsonPhoneNo: 'Secondary Person Phone Number',
    secondaryPersonEmail: 'Secondary Person E-mail',
    directrate: 'Directorates',
    serviceLocation: 'Service Location',
    workOrder: 'Work Order', 
  };
  const formattedStartDate = project.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '';
  const formattedEndDate = project.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '';

  const handleBackClick = ()=>{
    navigate(`/home`); 
  }

  return (
    <DetailView 
      title={`Project Details for ${project?.workOrderNo}`} 
      data={{ 
        ...project, 
        startDate: formattedStartDate, 
        endDate: formattedEndDate,     
      }} 
      loading={loading} 
      fields={fields} 
      labels={labels}
      buttonName={'Back'} 
      onBackClick={handleBackClick}
    />
  );
};

export default ProjectDetailView;
