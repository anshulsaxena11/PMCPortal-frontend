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
      console.log(response)
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
    'workOrderNo',
    'orderType', 
    'type', 
    'domain',
    'orginisationName', 
    'projectName',
    'startDate',
    'endDate',
    'projectValue',
    'projectManager', 
    'typeOfWork',
    'projectType', 
    'directrate',
    'serviceLocation',
    'primaryPersonName', 
    'primaryPersonPhoneNo',
    'primaryPersonEmail',
    'primaryRoleAndDesignation',
    'secondaryPersonName',
    'secondaryPrsonPhoneNo',
    'secondaryPersonEmail',
    'secondaryRoleAndDesignation',
    'workOrderUrl',
    'completetionCertificateUrl', 
    'clientFeedbackUrl',
    'anyOtherDocumentUrl'
  ];


  const labels = {
    workOrderNo: 'Work Order Number',
    orderType: 'Order Type',
    type: 'Type',
    domain:'Domain',
    orginisationName: 'Organisation Name',
    projectName: 'Project Name',
    startDate: 'Start Date',
    endDate: 'End Date',
    projectValue: 'Project Value (GST)',
    projectManager: 'Project Manager',
    typeOfWork: 'Type Of Work',
    projectType: 'Scope of Work',
    directrate:"Directorate",
    serviceLocation:"Service Location",
    primaryPersonName: 'Primary Person Name',
    primaryPersonPhoneNo: 'Primary Person Phone Number',
    primaryPersonEmail: 'Primary Person Email',
    primaryRoleAndDesignation: 'Primary Role/Designation',
    secondaryPersonName: 'Secondary Person Name',
    secondaryPrsonPhoneNo: 'Secondary Person Phone Number',
    secondaryPersonEmail: 'Secondary Person E-mail',
    secondaryRoleAndDesignation: 'Secondary Person Role/Designation',
    workOrder: 'Work Order', 
    completetionCertificateUrl:'Completition Certificate',
    clientFeedbackUrl:'Client Feedback',
    anyOtherDocumentUrl:'Any Other Document'
  };
  const formattedStartDate = project.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '';
  const formattedEndDate = project.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '';

  const handleBackClick = ()=>{
    navigate(`/home`); 
  }

  return (
    <DetailView 
      title={`Project Details`} 
      data={{ 
        ...project, 
        startDate: formattedStartDate, 
        endDate: formattedEndDate, 
        projectValue: project.projectValue ? `${new Intl.NumberFormat('en-IN').format(project.projectValue)}₹`: '',
        projectType: Array.isArray(project.projectType) 
                ? project.projectType.map(pt => pt.ProjectTypeName).join(', ') 
                : 'N/A',      
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
