// pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import { getProjectDetailsList } from '../../../api/ProjectDetailsAPI/projectDetailsApi';
import ListView from '../../../components/listView/listView';
import { useNavigate } from 'react-router-dom';

const ProjectDetailsList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total item count for pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    'workOrderNo',
    'orderType',
    'type',
    'orginisationName', 
    'projectName',  
    'projectManager',
  ];

  const columnNames = {
    workOrderNo: 'Work Order No',
    orderType: 'Order Type',
    type: 'Type',
    orginisationName: 'Organisation Name',
    projectName: 'Project Name',
    projectManager: 'Project Manager',
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getProjectDetailsList({
        page,
        search: searchQuery.trim(), 
        limit: 10
      });
      const transformedData = response.data.map(item => ({
        ...item,
        projectType: Array.isArray(item.projectType) && item.projectType.length > 0
          ? item.projectType[0]?.ProjectTypeName || 'N/A'
          : item.projectType || 'N/A',
      }));

      setData(transformedData);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching data:');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]); 

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); 
  };

  const handleAddNewClick = () => {
    navigate("/projectDetails"); 
  };
  const handleViewClick = (data) => {
    const id = data._id
    navigate(`/projectDetails/${id}`);  
  };
  const handleEditClick = (data)=>{
    const id =data._id
    navigate(`/projectDetailsEdit/${id}`); 
  }

  return (
    <div>
      <ListView
        title="Project Detail"
        buttonName="Add New"
        onAddNewClick={handleAddNewClick}
        columns={columns}
        columnNames={columnNames}
        data={data}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        loading={loading}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        showEditView={true}
      />
    </div>
  );
};

export default ProjectDetailsList;
