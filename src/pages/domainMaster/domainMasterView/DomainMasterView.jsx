import React, { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import {getDomainById} from '../../../api/clientSectorApi/clientSectorApi'
import DetailView from '../../../components/DetailsView/DetailView'; 

const DomainMasterView = () => {
    const [domainSector, setDomain] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;

    const fetchDomain = async () => {
        try {
        const response = await getDomainById(id);
            setDomain(response.data);
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomain();
    }, [id]);

    const fields = [
        // 'type',
        'domain',
    ];

    
    const labels = {
        // type: 'Type',
        domain:'Domain',
    };

    const handleBackClick = ()=>{
        navigate(`/Domain-Sector-Master`); 
    }

    return(
        <div>
            <DetailView 
                title={`Domain`} 
                data={{ 
                    ...domainSector, 
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

export default DomainMasterView