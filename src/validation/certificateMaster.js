import * as yup from 'yup';

const CertificateMasterSchema = yup.object({
    certificateName:yup.string().required("Certificate Name required"),
})

export default CertificateMasterSchema;