import React, { useState, useRef,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; 
import DetailView from '../../../components/DetailsView/DetailView'; 
import {getCertificateDetailsById} from '../../../api/certificateApi/certificate'
import dayjs from 'dayjs';

const CertificateView = () => {
    const { id } = useParams(); 
    const [Certificate, setCertificate] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCertificate = async () => {
        try {
        const response = await getCertificateDetailsById(id); 
        setCertificate(response.data);
        } catch (error) {
        console.error('Error fetching project details:',);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificate();
    }, [id]);

    const fields = [
        'certificateTypeView',
        'certificateView',
        'assignedPersonView', 
        'issuedDate', 
        'validUpto', 
        'certificateUrl',
        'createdAt'
    ];


    const labels = {
        certificateTypeView: 'Certificate Type',
        certificateView: 'Certificate Name',
        assignedPersonView: 'Assigned Person Name',
        issuedDate: 'Issued Date',
        validUpto: 'Valid Upto',
        certificateUrl: 'Certificate Preview',
        createdAt:'Created At'
    };
    const formattedStartDate = Certificate.issuedDate ? dayjs(Certificate.issuedDate).format('DD/MM/YYYY') : '';
    const formattedEndDate = Certificate.validUpto ? dayjs(Certificate.validUpto).format('DD/MM/YYYY') : '';
    const formattedCreatedDate = Certificate.createdAt ? dayjs(Certificate.createdAt).format('DD/MM/YYYY') : '';

    const handleBackClick = ()=>{
        navigate(`/certificate`); 
    }

    return (
        <DetailView 
        title={`Certificate Details`} 
        data={{ 
            ...Certificate, 
            issuedDate: formattedStartDate, 
            validUpto: formattedEndDate, 
            createdAt: formattedCreatedDate
        }} 
        loading={loading} 
        fields={fields} 
        labels={labels}
        buttonName={'Back'} 
        onBackClick={handleBackClick}
        />
    );
};


export default CertificateView;