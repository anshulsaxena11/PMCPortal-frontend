import * as yup from 'yup';

const CertificateMasterSchema = yup.object({
    certificateType:yup.string().required("Certificate Type required"),
    certificateName:yup.string().required("Certificate Name required"),
})

export default CertificateMasterSchema;