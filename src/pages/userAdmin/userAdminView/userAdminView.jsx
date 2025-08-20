import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetailsById } from '../../../api/loginApi/loginApi'
import dayjs from 'dayjs';
import DetailView from '../../../components/DetailsView/DetailView'; 

const UserAdminView = ({ ID }) => {
    const { id } = useParams();
    const userId = ID || id;
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
       const fetchuserDetails = async () => {
         try {
            const data = await getUserDetailsById(userId);
            const item = data?.data;
            const formattedData = {
              ...item,
              createdAt: item?.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : '',
              StatusNoida: item?.StatusNoida ? (
                <span className="text-success fw-bold">Active</span>
              ) : (
                <span className="text-danger fw-bold">Inactive</span>
              ),
                taskForceMember: item?.taskForceMember === 'No' ? (
                  <span className="text-danger fw-bold">No</span>
              ) : (
                <span className="text-success fw-bold">Yes</span>
              )
            };
            console.log(formattedData)
           setUserDetails(formattedData);
         } catch (error) {
           console.error("Error fetching project details:", error);
         } finally {
          setLoading(false);
          }
       };
       fetchuserDetails();
     }, []);

     const handleBackClick = ()=>{
        navigate(`/register-list`) 
      }

      const fields = [
    'empId',
    'ename', 
    'dir', 
    'centre', 
    'etpe',
    'email',
    'role',
    'edesg',
    'taskForceMember', 
    'StatusNoida',
    'createdAt', 
  ];


  const labels = {
    empId: 'Employee Id',
    ename: 'Employee Name',
    dir: 'Directorates',
    centre: 'Centre',
    etpe: 'Employee Type',
    email: 'E-mail',
    role: 'Role',
    edesg: 'Designation',
    taskForceMember: 'Task Force Manager',
    StatusNoida: 'Status Noida',
    createdAt: 'Created At',
  };

    return(
        <div className="container-fluid">
          <DetailView 
            title={`User Details`} 
            data={{ 
              ...userDetails, 
            }} 
            loading={loading} 
            fields={fields} 
            labels={labels}
            buttonName={'Back'} 
            onBackClick={handleBackClick}
        />
        </div>
    )

}

export default UserAdminView;
