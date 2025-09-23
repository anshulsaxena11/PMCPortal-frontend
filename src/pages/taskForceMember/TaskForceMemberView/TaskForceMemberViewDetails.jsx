import React, { useState, useRef,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import DetailView from '../../../components/DetailsView/DetailView'; 
import {getTaskForceDetailsById} from '../../../api/taskForceMemberApi/taskForceMemberApi'
import dayjs from 'dayjs';

const TaskForceMemberViewDetails = () => {
    const [TaskForce, setTaskForce] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;

    const fetchTaskForceMember = async () => {
        try {
        const response = await getTaskForceDetailsById(id);
        console.log(response) 
        setTaskForce(response.data);
        } catch (error) {
        console.error('Error fetching project details:',);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskForceMember();
    }, [id]);

    const fields = [
        'stateName',
        'taskForceMember',
        'stateCordinator',
    ];


    const labels = {
        stateName: 'State Name',
        taskForceMember:'Task Force Member',
        stateCordinator:'State Coordinator'
    };

    const handleBackClick = ()=>{
        navigate(`/Task-Force-member`); 
    }

    return (
        <DetailView 
        title={`Task Force Member Details`} 
        data={{ 
            ...TaskForce, 
        }} 
        loading={loading} 
        fields={fields} 
        labels={labels}
        buttonName={'Back'} 
        onBackClick={handleBackClick}
        />
    );
};


export default TaskForceMemberViewDetails;