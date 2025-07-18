// pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import {deleteProjectsById, getProjectDetailsList } from '../../../api/ProjectDetailsAPI/projectDetailsApi';
import ListView from '../../../components/listView/listView';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
  const handleDeleteClick = async (data) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });
       if (!result.isConfirmed) return;

try {

  const response = await deleteProjectsById(data._id);
    
    if (response.data.message) {
       Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: response.message,
          timer: 1500,
          showConfirmButton: false,
        });
        
      }
    fetchData();
  } catch (error) {
    console.error("Delete error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error?.message || 'Something went wrong!',
    });
  }

      };

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
        onDeleteClick={handleDeleteClick}
        showEditView={true}
        isDeletedFilter={true}
        showNoDataMessage={true}
      />
    </div>
  );
};

export default ProjectDetailsList;
