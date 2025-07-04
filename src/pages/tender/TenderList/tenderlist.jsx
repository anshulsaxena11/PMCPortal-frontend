// pages/ProjectListPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTenderDetailsList } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import ListView from '../../../components/listView/listView';
import {deleteTenderById,updatetendermessage} from '../../../api/TenderTrackingAPI/tenderTrackingApi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

const TenderDetailsList = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define columns as array
  const columns = [
    { key: 'tenderName', label: 'Tender Name' },
    { key: 'organizationName', label: 'Organization' },
    { key: 'state', label: 'State' },
    { key: 'taskForce', label: 'Task Force Member' },
    { key: 'valueINR', label: 'Value (INR)' },
    { key: 'status', label: 'Status' },
    { key: 'lastDate', label: 'Last Date' },
  ];

  // Convert array to key-label map
  const columnNames = columns.reduce((acc, col) => {
    acc[col.key] = col.label;
    return acc;
  }, {});

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getTenderDetailsList({
        page,
        search: searchQuery.trim(),
        limit: 10,
        isDeleted: true,
      });
      console.log(response)

      const transformedData = (response?.data || []).map(item => ({
        _id: item?._id || '',
        tenderName: item?.tenderName || 'N/A',
        organizationName: item?.organizationName || 'N/A',
        state: item?.state || 'N/A',
        taskForce: item?.taskForce || 'N/A',
        valueINR: item?.valueINR?.toLocaleString('en-IN') || '0',
        status: item?.status || 'N/A',
        lastDate: item?.lastDate?.split('T')[0] || 'N/A',
      }));
      console.log(transformedData, "transform")
      setData(transformedData);
      setTotalCount(response?.total || 0);
      setTotalPages(response?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching data:', error);
	  Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Something went wrong!',
    });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleAddNewClick = () => {
    navigate('/Tender-Tracking');
  };

  const handleViewClick = (data) => {
    navigate(`/tender-View/${data._id}`);
  };

  const handleEditClick = (data) => {
    navigate(`/tender-Edit/${data._id}`);
  };

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

    const messageResult = await Swal.fire({
            title: "Submit your Message",
            input: "text",
            inputAttributes: {
              autocapitalize: "off",
            },
            showCancelButton: true,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true,
            preConfirm: async (message) => {
              if (!message || message.trim() === "") {
                Swal.showValidationMessage("Message is required");
                return false;
              }
              try {
                const response = await updatetendermessage(data._id, message); // Axios call
                if (response.status !== 200 && response.status !== 201) {
                  Swal.showValidationMessage(`Error: ${response.statusText}`);
                  return false;
                }
                return response.data;
              } catch (error) {
                Swal.showValidationMessage(
                  `Request failed: ${error?.response?.data?.message || error.message}`
                );
                return false;
              }
            },
            allowOutsideClick: () => !Swal.isLoading(),
          });
    
          if (messageResult.isDismissed) {
            console.log("User cancelled");
            setLoading(false);
            return false;
          }
    
          if (messageResult.isConfirmed) {
            Swal.fire({
              title: "Message submitted successfully!",
              text: messageResult.value?.message || "Your message was recorded.",
              icon: "success",
            });
          }
    const response = await deleteTenderById(data._id);
    
    if (response.data.message) {
       Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: response.message,
          timer: 1500,
          showConfirmButton: false,
        });

      const updatedData = await getTenderDetailsList({
        page,
        search: searchQuery.trim(),
        limit: 10,
        isDeleted: true // explicitly filter active tenders
      });

    fetchData();

    } else {
      Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: response.message,
        });
    }
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
      <ToastContainer  position="top-center" autoClose={5000} hideProgressBar={false} />
      <ListView
        title="Tender Tracking"
        buttonName="Add New"
        onAddNewClick={handleAddNewClick}
        columns={columns.map(c => c.key)} // pass just keys to render table
        columnNames={columnNames}        // pass key-label map
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
      />
    </div>
  );
};

export default TenderDetailsList;
