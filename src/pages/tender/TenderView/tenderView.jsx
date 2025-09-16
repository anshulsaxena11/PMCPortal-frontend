import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailView from '../../../components/DetailsView/DetailView'; 
import { getTrackingById } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const TenderTrackingView = ({ ID }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const trackingId = ID || location.state?.id;

  const [data,setData]=useState({})
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingTenderDetails = async () => {
      try {
        const data = await getTrackingById(trackingId);
        const fetchedData = data.data;
        setData(fetchedData)
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingTenderDetails();
  }, []);

  const handleBackClick = () => {
    navigate(`/tender-list`);
  };
const fields = [
    'tenderName',
    'organizationName', 
    'state', 
    'taskForce', 
    'valueINR',
    'status',
    'lastDate',
    'tenderDocument', 
    'comment'
  ];

  const labels = {
    tenderName: 'Tender Name',
    organizationName: 'Organization Name',
    state: 'State',
    taskForce: 'Task Force Member',
    valueINR: 'Value INR (GST)',
    status: 'Status',
    lastDate: 'Last Date',
    tenderDocument: 'Tender Document',
    comment:'Comment'
  };

  const formattedlastDate = data.lastDate ? dayjs(data.lastDate).format('DD/MM/YYYY') : '';

  return (
    <div>
        <DetailView 
          title={`Sales Tracking`} 
          data={{ 
            ...data, 
            lastDate: formattedlastDate, 
            valueINR: data.valueINR ? `${new Intl.NumberFormat('en-IN').format(data.valueINR)}₹`: '',  
          }} 
          nestedFields={{
            comment: ['comments','displayName','commentedOn'],
            commentLabels: { comments: 'Comment', displayName: 'Commented By', commentedOn: 'Commented On' }
          }}
          comments={data.comments || []}
          loading={loading} 
          fields={fields} 
          labels={labels}
          buttonName={'Back'} 
          onBackClick={handleBackClick}
        />
    </div>
  );
};

export default TenderTrackingView;
