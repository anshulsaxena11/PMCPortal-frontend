import React,{ useState, useEffect }  from 'react'
import {getTypesOfWorkId} from '../../../api/typeOfWorkAPi/typeOfWorkApi'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import DetailView from '../../../components/DetailsView/DetailView'; 

const TypesOfWorkMasterView = ({ID}) =>{
    const [loading, setLoading] = useState(true);
    const [data,setData] = useState('')
    const { id } = useParams();
    const typeofwork = ID || id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getTypesOfWorkId(typeofwork);
                const fetchedData = response?.data?.data;
                setData(fetchedData)
            } catch (error) {
                console.error("Error fetching project details:", error);
            }finally {
                setLoading(false);
            }
        };
            if (typeofwork) fetchProject();
        }, [typeofwork]);
        
    const fields = [
        'typeOfWork',
        'createdAt'
    ];

    const labels = {
        typeOfWork: 'Type of Work',
        createdAt: 'created At'
    };

    const formatedCreatedAt = data.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY') : '';

    const handleBackClick = ()=>{
        navigate(`/type-of-work-master-list`); 
    }

    return(
        <DetailView 
            title={`Type Of Work`} 
            data={{ 
                ...data, 
                createdAt: formatedCreatedAt,    
            }} 
            loading={loading} 
            fields={fields} 
            labels={labels}
            buttonName={'Back'} 
            onBackClick={handleBackClick}
        />
    )
}

export default TypesOfWorkMasterView