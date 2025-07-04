import React, { useState, useEffect } from 'react';
import ListView from '../../../components/listView/listView';
import { getToolsAndHardware } from '../../../api/toolsAndHardware/toolsAndHardware'
import { directoratesList } from '../../../api/syncEmp/syncEmp'
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const ToolsAndHardware = () =>{
        const [data, setData] = useState([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [totalCount, setTotalCount] = useState(0); // Total item count for pagination
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedDir, setSelectedDir] = useState(null);
        const [loading, setLoading] = useState(false);
        const [dirOptions, setDirOptions] = useState([]);
        const navigate = useNavigate();

        const columns = [
            'purchasedOrder',
            'tollsName',
            'quantity',
            'assignedTo',
            'directorates',
            'startDate',
            'endDate',
        ];

        const columnNames = {
            purchasedOrder:"Purchased Order",
            tollsName: 'Tools Name',
            quantity: 'Quantity',
            assignedTo: 'Assigne To',
            startDate: 'Start Date',
            endDate:'End Date',
            directorates:"Directorates",
        };
        
        useEffect(() => {
            fetchData();
        }, [page, searchQuery,selectedDir]); 

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
        
        const fetchData = async () => {
            setLoading(true);
            try {
              const response = await getToolsAndHardware({
                page,
                search: searchQuery.trim(),
                directorates:selectedDir?.value, 
                limit: 10,
                page: 1,
              });
             
              const formattedData = response.data.map(item => ({
                ...item,
                startDate: item.startDate ? dayjs(item.startDate).format('DD/MM/YYYY') : '',
                endDate: item.endDate ? dayjs(item.endDate).format('DD/MM/YYYY') : '',
            }));
        
              setData(formattedData);
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
            navigate("/Tools-Hardware");  
        };

        const handleViewClick = (data) => {
            const id = data._id
            navigate(`/Tools-Hardware-View/${id}`);  
        };

        const handleEditClick = (data)=>{
            const id =data._id
             navigate(`/Tools-Hardware-Edit/${id}`); 
        }

        const handleStausChange = (selectedOption) => {
            setSelectedDir(selectedOption);
            setPage(1);
        };
    return(
        <div>
            <ListView
                title="Tools And Hardware List"
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
                statusOptions={dirOptions}
                setSelectedStatus={handleStausChange}
                selectedStatus={selectedDir}
                placeholder="Select Directorates"
               
            
            />
        </div>
    )
}

export default ToolsAndHardware;