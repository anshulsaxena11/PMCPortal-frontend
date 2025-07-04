import * as yup from "yup";

export const toolsAndHardwareValidation = yup.object().shape({
    tollsName:yup.string().required("Enter Name"),
    quantity:yup.number().positive().required("Enter Quantity in"),   
    directorates:yup.string().required("Please select Directorates"),
    startDate: yup.date().required("Start Date is required").nullable(),
    endDate: yup.date().required("End Date is required").nullable().when('startDate', {is: (startDate) => startDate !== null,  then: yup.date().min(yup.ref('startDate'),  'End Date must be later than Start Date'),otherwise: yup.date(), }),
    purchasedOrder:yup.string().required("Enter Purchased Order"),
    description:yup.string().required("Enter Description"),
    assignedTo:yup.string().required("Select Assigned Officer"),
})
  
export default toolsAndHardwareValidation;
