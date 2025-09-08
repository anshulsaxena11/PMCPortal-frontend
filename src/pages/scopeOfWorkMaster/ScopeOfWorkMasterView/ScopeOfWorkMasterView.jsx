import React,{ useState, useEffect }  from 'react'
import {getScopeOfWorkId} from '../../../api/projectTypeListApi/projectTypeListApi'
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import DetailView from '../../../components/DetailsView/DetailView'; 

const ScopeOfWorkMasterView = ({ID}) =>{
    const [loading, setLoading] = useState(true);
    const [data,setData] = useState('')
    const { id } = useParams();
    const Scopeofwork = ID || id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await getScopeOfWorkId(Scopeofwork);
                const fetchedData = response?.data?.data;
                setData(fetchedData)
            } catch (error) {
                console.error("Error fetching project details:", error);
            }finally {
                setLoading(false);
            }
        };
            if (Scopeofwork) fetchProject();
        }, [Scopeofwork]);
        
    const fields = [
        'ProjectTypeName',
        'category',
        'createdAt'
    ];

    const labels = {
        ProjectTypeName: 'Scope of Work',
        category: 'Type Of Work',
        createdAt: 'created At'
    };

    const formatedCreatedAt = data.createdAt ? dayjs(data.createdAt).format('DD/MM/YYYY') : '';

    const handleBackClick = ()=>{
        navigate(`/Scope-Of-Work-Master`); 
    }

    return(
        <DetailView 
            title={`Scope Of Work`} 
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

export default ScopeOfWorkMasterView