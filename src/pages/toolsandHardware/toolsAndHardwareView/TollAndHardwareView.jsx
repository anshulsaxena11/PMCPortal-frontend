import React,{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import dayjs from 'dayjs';
import DetailView from '../../../components/DetailsView/DetailView';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { putToolsAndHardware } from "../../../api/toolsAndHardware/toolsAndHardware"

const ToolsAndHardwareView = ({ID}) => {
        const [loading, setLoading] = useState(false);
        const [typeOfTool, setTypeOfTool] = useState({})
        const { id } = useParams();
        const projectId = ID || id;
        const navigate = useNavigate();
        const handleBackClick = ()=>{
            navigate(`/Tools-Hardware-list`) 
        }

         useEffect(() => {
            const fetchProject = async () => {
                try {
                    const response = await putToolsAndHardware(projectId, {});
                    const fetchedData = response?.data?.projectDetails;
                    setTypeOfTool(fetchedData)        
                } catch (error) {
                    console.error("Error fetching project details:", error);
                }finally {
                    setLoading(false);
                }
            };
            if (projectId) fetchProject();
            }, [projectId]);
             const fields = [
                'purchasedOrder',
                'directorates',
                'tollsName',
                'quantity', 
                'startDate', 
                'endDate', 
                'assignedTo',
                'description'
              ];
              const labels = {
                purchasedOrder: 'Purchased Order',
                directorates: 'Directorates',
                tollsName: 'Tool Name',
                quantity: 'Quantity',
                startDate: 'Start Date',
                endDate: 'End Date',
                assignedTo: 'Assigned To',
                description: 'Description',
              };
              const formattedStartDate = typeOfTool.startDate ? dayjs(typeOfTool.startDate).format('DD/MM/YYYY') : '';
              const formattedEndDate = typeOfTool.endDate ? dayjs(typeOfTool.endDate).format('DD/MM/YYYY') : '';
    return(
        <div>
            <DetailView
                title={`Tools And Hardware`} 
                data={{ 
                    ...typeOfTool, 
                    startDate: formattedStartDate, 
                    endDate: formattedEndDate,  
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

export default ToolsAndHardwareView;