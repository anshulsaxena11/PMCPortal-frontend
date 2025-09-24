import React, { useState,useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import {getClientSectorById} from '../../../api/clientSectorApi/clientSectorApi'
import DetailView from '../../../components/DetailsView/DetailView'; 

const ClientSectorMasterView = () => {
    const [clientSector, setClientSector] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;

    const fetchClientSector = async () => {
        try {
        const response = await getClientSectorById(id);
            setClientSector(response.data);
        } catch (error) {
            console.error('Error fetching project details:',);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientSector();
    }, [id]);

    const fields = [
        'type',
        'clientType',
    ];

    
    const labels = {
        type: 'Type',
        clientType:'Client Sector',
    };

    const handleBackClick = ()=>{
        navigate(`/Client-Sector-Master`); 
    }

    return(
        <div>
            <DetailView 
                title={`Client Sector`} 
                data={{ 
                    ...clientSector, 
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

export default ClientSectorMasterView