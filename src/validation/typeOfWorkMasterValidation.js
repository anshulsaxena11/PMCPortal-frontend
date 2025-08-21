import * as yup from "yup";

export const typeOfWorkMasterValidation = yup.object().shape({
    typeOfWork:yup.string().required("Enter Types Of Work"),
})
  
export default typeOfWorkMasterValidation;

