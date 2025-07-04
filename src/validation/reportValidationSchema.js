import * as yup from "yup";

export const reportValidationSchema = yup.object().shape({
  Recomendation:yup.string().required("Enter Recomendation"),
  Referance:yup.string().required("Enter Referance"),
  selectedVulnerability:yup.string().required("Enter Vulnerable Name"),
  Impact:yup.string().required("Enter Impact Parameter"),
  round:yup.string().required("Enter Round"),
  Path:yup.string().required("Enter Path"),
  Description:yup.string().required("Enter Description"),
  selectedProjectName:yup.string().required("Select Project Name"),
  ProjectType:yup.string().required("Select Project Type"),
  severity:yup.string().required('Select Sevirity Type'),
  device:yup.string().nullable().when("ProjectType",{
    is:"Devices",
    then: yup.string().required("Device is required"),
    otherwise:yup.string().nullable()
  }),
  name:yup.string().required('Select Name'),
  ipAddress:yup.string().required('Select Name'),
  proofOfConcept: yup.array().of(
    yup.object().shape({
      text: yup.string().when('index', {
        is: (index) => index === 0, // Condition for Step 1 (index 0)
        then: yup.string().required('Proof of Concept for Step 1 is required'),
        otherwise: yup.string().notRequired(),
      }),
      file: yup.mixed().notRequired(), // Optional file for all steps
    })
  ).min(1, 'At least one Proof of Concept step is required'),
})
  
export default reportValidationSchema;
