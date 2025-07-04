import React, { useState, useEffect } from 'react';
import ListView from '../../../components/listView/listView';
import { getToolsAndHardwareMappping } from '../../../api/toolsAndHardware/toolsAndHardware'
import { useNavigate } from 'react-router-dom';

const ToolsAndHardwareList = () =>{
        const [data, setData] = useState([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalCount, setTotalCount] = useState(0); // Total item count for pagination
        const [searchQuery, setSearchQuery] = useState('');
         const [selectedStatus, setSelectedStatus] = useState(null);
        const [loading, setLoading] = useState(false);
        const navigate = useNavigate();
        const statusOptions=[
            { value: 'Software', label: 'Software' },
            { value: 'Hardware', label: 'Hardware' },
        ];

        const columns = [
            'tollsName',
            'toolsAndHardwareType',
        ];

        const columnNames = {
            tollsName: 'Tools Name',
            toolsAndHardwareType: 'Type',
        };
        
        useEffect(() => {
            fetchData();
        }, [page, searchQuery,selectedStatus]); 
        

        const fetchData = async () => {
            setLoading(true);
            try {
              const response = await getToolsAndHardwareMappping({
                page,
                search: searchQuery.trim(),
                toolsAndHardwareType:selectedStatus?.value, 
                limit: 10,
                page:1,
              });
             
        
              setData(response.data);
              setTotalCount(response.total);
              setTotalPages(response.totalPages);
            } catch (error) {
              console.error('Error fetching data:', error);
            } finally {
              setLoading(false);
            }
          };

        const handlePageChange = (newPage) => {
            setPage(newPage);
        };
    
        const handleSearchChange = (e) => {
            setSearchQuery(e.target.value);
            setPage(1); 
        };

        const handleAddNewClick = () => {
            navigate("/Tools-Hardware-Master");  
        };

        const handleViewClick = (data) => {
            const id = data._id
            navigate(`/Tools-Hardware-Master-View/${id}`);  
        };

        const handleEditClick = (data)=>{
            const id =data._id
             navigate(`/Tools-Hardware-Master-Edit/${id}`); 
        }

        const handleStausChange = (selectedOption) => {
            setSelectedStatus(selectedOption);
            setPage(1);
          };
    return(
        <div>
            <ListView
                title="Tools And Hardware Master List"
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
                showFiltersTwo={true}
                showFilters={true}
                showFiltersStatus={true}
                statusOptions={statusOptions}
                setSelectedStatus={handleStausChange}
                selectedStatus={selectedStatus}
                placeholder="Select Type"
               
            
            />
        </div>
    )
}

export default ToolsAndHardwareList;