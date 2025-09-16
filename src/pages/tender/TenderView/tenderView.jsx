import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailView from '../../../components/DetailsView/DetailView'; 
import { getTrackingById } from '../../../api/TenderTrackingAPI/tenderTrackingApi';
import dayjs from 'dayjs';

const TenderTrackingView = ({ ID }) => {
  const { id } = useParams();
  const trackingId = ID || id;
  const navigate = useNavigate();

  const [data,setData]=useState({})
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingTenderDetails = async () => {
      try {
        const data = await getTrackingById(trackingId);
        const fetchedData = data.data;
        console.log(fetchedData)
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
  };

  const formattedlastDate = data.lastDate ? dayjs(data.lastDate).format('DD/MM/YYYY') : '';

  return (
    <div>
        <DetailView 
          title={`Tender Tracking`} 
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
