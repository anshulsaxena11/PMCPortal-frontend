import React,{ useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import DetailView from '../../../components/DetailsView/DetailView'; 
import { editToolsAndHardware } from "../../../api/toolsAndHardware/toolsAndHardware"

const ToolsAndHardwareMappingView = ({ID}) => {
    const [toolsAndHardwareMaster,setToolsAndHardwareMaster] = useState({})
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const projectId = ID || id;
    const navigate = useNavigate();
    const handleBackClick = ()=>{
        navigate(`/Tools-Hardware-Master-List`) 
    }

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await editToolsAndHardware(projectId, {});
                const fetchedData = response?.data?.projectDetails;
                setToolsAndHardwareMaster(fetchedData)
            } catch (error) {
                console.error("Error fetching project details:", error);
            }finally {
                setLoading(false);
            }
        };
    
        if (projectId) fetchProject();
    }, [projectId]);

    const fields = [
        'tollsName',
        'toolsAndHardwareType', 
    ];


  const labels = {
    tollsName: 'Tool Name',
    toolsAndHardwareType: 'Tool and Hardware Type',
  };

        
    return(
        <div>
            <DetailView 
                title={`Tools And Hardware Master`} 
                data={{
                    ...toolsAndHardwareMaster
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

export default ToolsAndHardwareMappingView;