import * as yup from 'yup';

const DomainMasterSchema = yup.object({
    // type: yup.string().required("Select One Type"),
    domain:yup.string().required("Client sector required"),
})

export default DomainMasterSchema;