import * as yup from "yup";

export const toolsAndHardwareMasterValidation = yup.object().shape({
    tollsName:yup.string().required("Enter Name"),
    toolsAndHardwareType:yup.string().required("Please select type"),
})
  
export default toolsAndHardwareMasterValidation;
