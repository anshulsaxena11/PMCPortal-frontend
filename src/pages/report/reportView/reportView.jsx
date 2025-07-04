import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';  
import { getReportById } from '../../../api/reportApi/reportApi'; 
import DetailView from '../../../components/DetailsView/DetailView'; 
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const ReportView = () => {
  const { id } = useParams(); 
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

   const fetchProjectDetails = async () => {
    try {
      const response = await getReportById(id); 
      const fetchData=response?.data?.reportDetails
      setProject(fetchData);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fields = [
    'projectName', 
    'projectType',
    'devices',
    'round',
    'Name',
    'ipAddress', 
    'vulnerabilityName', 
    'sevirty',
    'description',
    'path',
    'impact', 
    'vulnerableParameter', 
    'references', 
    'recomendation',
    'proofOfConcept',
    
  ];


  const labels = {
    projectName: 'Project Name',
    projectType: 'Project Type',
    devices:'Devices',
    round: 'Round',
    Name:'Device Name',
    ipAddress:'IP Address',
    vulnerabilityName: 'Vulnerability Name',
    sevirty: 'Severity',
    description: 'Description',
    path: 'Path',
    impact: 'Impact',
    vulnerableParameter: 'Vulnerable Parameter',
    references: 'References',
    recomendation: 'Recomendation',
    proofOfConcept:'Proof Of Concept'
  };

   const formattedStartDate = project?.startDate ? dayjs(project.startDate).format('DD/MM/YYYY') : '';
   const formattedEndDate = project?.endDate ? dayjs(project.endDate).format('DD/MM/YYYY') : '';

  const handleBackClick = ()=>{
    navigate(`/report`); 
  }

  return (
    <DetailView 
      title={`Vulnerability`} 
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

export default ReportView;
