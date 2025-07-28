import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetailsById } from '../../../api/loginApi/loginApi'

const UserAdminView = ({ ID }) => {
    const { id } = useParams();
    const userId = ID || id;

    useEffect(() => {
       const fetchuserDetails = async () => {
         try {
           const data = await getUserDetailsById(userId);
           console.log(data)
         } catch (error) {
           console.error("Error fetching project details:", error);
         }
       };
       fetchuserDetails();
     }, []);

    return(
        <div>
            <p>hello</p>
        </div>
    )

}

export default UserAdminView;
