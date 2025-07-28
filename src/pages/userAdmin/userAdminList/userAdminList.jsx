import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListView from '../../../components/listView/listView';
import {getLoginList} from '../../../api/loginApi/loginApi'
import dayjs from 'dayjs';

const UserAdminList = () => {
    const [loading, setLoading] = useState(false);
    const [data,setData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const columns = [
        'empId',
        'ename',
        'email',
        "dir",
        'centre',
        'etpe',
        'role',
        'StatusNoida',
        'taskForceMember' 
      ];

       const columnNames = {
            empId:"Employee Id",
            ename: 'Employee Name',
            email: 'Employee E-mail',
            dir: 'Directorates',
            centre: 'Centre',
            etpe:'Employee Type',
            role:"Role",
            StatusNoida:"VAPT Team Member",
            taskForceMember:"Task Force Member Status"
        };

      useEffect(() => {
            fetchData();
        }, [page,searchQuery]); 

    const fetchData = async() =>{
        setLoading(true);
        try{
            const  response = await getLoginList({
                page,
                limit:10,
                search: searchQuery.trim(),
            })
            const fullData = response?.data
            const originalData = fullData?.data
            console.log(originalData)

            const formatedData = originalData?.map(item=>({
                ...item,
                createdAt:item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : '',
                StatusNoida: item.StatusNoida ? (
                <span className="text-success fw-bold">Active</span>
              ) : (
                <span className="text-danger fw-bold">Inactive</span>
              ),
              taskForceMember:item.taskForceMember ==='No' ? (
                <span className="text-danger fw-bold">No</span>
              ):(
                <span className="text-success fw-bold">Yes</span>
              )
            }))
            setData(formatedData)
            setTotalCount(fullData?.total)
            setTotalPages(fullData?.page);
        }catch(error){
                console.log(error)
        }finally {
            setLoading(false);
        }
    }

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1); 
    };

    const handleAddNewClick = () => {
        navigate("/register");
    };

    const handleViewClick = (data) => {
      navigate(`/register-view/${data._id}`);
    };

  return (
    <div>
      <h1 className='text-danger'>Table under working but you can create user</h1>
      <ListView
        title="User Registration"
        buttonName="Create New User"
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
        showNoDataMessage={true}
        // showEditView={true}
        // onViewClick={handleViewClick}
      />
    </div>
  );
};

export default UserAdminList;
