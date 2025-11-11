import React, { useState, useEffect } from 'react';
import {getCertificateMasterById} from "../../../api/certificateMaster/certificateMaster"
import { useNavigate, useLocation } from 'react-router-dom'; 
import DetailView from '../../../components/DetailsView/DetailView'; 

const CertificateMasterView = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;

    const fetchDomain = async () => {
        try {
        const response = await getCertificateMasterById(id);
            setData(response.data);
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
        'certificateTypeName',
        'certificateName',
    ];
    const labels = {
        certificateTypeName:'Certificate Type',
        certificateName:'Certificate Name',
    };
    const handleBackClick = ()=>{
        navigate(`/Certificate-Master`); 
    }

    
    return(
        <div>
            <DetailView 
                title={`Certificate Master`} 
                data={{ 
                    ...data, 
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

export default CertificateMasterView;