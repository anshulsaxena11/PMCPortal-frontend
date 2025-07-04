import React, { useState, useEffect, useMemo } from 'react';
import { srpiEmpTypeListActive, srpiEmpTypeList, centreList, directoratesList, skillsMapping } from "../../api/syncEmp/syncEmp";
import { getProjectTypeList } from "../../api/projectTypeListApi/projectTypeListApi";
import { Table, Pagination, InputGroup, FormControl, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';

const SkillMapping = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCentre, setSelectedCentre] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [loader, setLoader] = useState(false);
    const [data, setData] = useState([]);
    const [projectTypes, setProjectTypes] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [centreOptions, setCentreOptions] = useState([]);
    const [dirOptions, setDirOptions] = useState([]);
    const [page, setPage] = useState(1);
    const [selecteddir, setSelectedDir] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [rows, setRows] = useState([]);
    const [skillIndex, setSkillIndex] = useState([]);
    const [emp, setEmp] = useState();

    const selectNumericOption = [
        { value: 'N/A', label: 'N/A' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
    ];

    const columns = useMemo(() => [
        'ename',
        ...(Array.isArray(projectTypes) ? projectTypes.map(type => type._id) : [])
    ], [projectTypes]);

    const columnNames = useMemo(() => ({
        ename: 'Employee Name',
        ...(Array.isArray(projectTypes)
            ? projectTypes.reduce((acc, type) => {
                acc[type._id] = type.ProjectTypeName;
                return acc;
            }, {})
            : {})
    }), [projectTypes]);

    useEffect(() => {
        fetchEmpList();
    }, [ page, searchQuery, selectedCentre, selectedType, selecteddir ]);

    const fetchEmpList = async () => {
        setLoader(true);
        try {
            const response = await srpiEmpTypeListActive({
                page,
                limit: 10,
                search: searchQuery.trim(),
                centre: selectedCentre?.value,
                etpe: selectedType?.value,
                dir: selecteddir?.value
            });
            if (response && response.data) {
                setData(response.data);
                setTotalCount(response.total);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch employee list:');
        }
        setLoader(false);
    };

    useEffect(() => {
        const fetchTypeData = async () => {
            setLoader(true);
            try {
                const response = await srpiEmpTypeList();
                const options = response.data.data.map((centre) => ({
                    value: centre,
                    label: centre,
                }));
                setTypeOptions(options);
            } catch (error) {
                console.error('Error fetching centre list:');
            } finally {
                setLoader(false);
            }
        };
        fetchTypeData();
    }, []);

    useEffect(() => {
        const fetchCentreData = async () => {
            setLoader(true);
            try {
                const response = await centreList();
                const options = response.data.data.map((centre) => ({
                    value: centre,
                    label: centre,
                }));
                setCentreOptions(options);
            } catch (error) {
                console.error('Error fetching centre list:', error);
            } finally {
                setLoader(false);
            }
        };
        fetchCentreData();
    }, []);

    useEffect(() => {
        const fetchDiretoratesData = async () => {
            setLoader(true);
            try {
                const response = await directoratesList();
                const options = response.data.data.map((dir) => ({
                    value: dir,
                    label: dir,
                }));
                setDirOptions(options);
            } catch (error) {
                console.error('Error fetching Directorates list:');
            } finally {
                setLoader(false);
            }
        };
        fetchDiretoratesData();
    }, []);

    useEffect(() => {
        const fetchProjectTypeList = async () => {
            try {
                const response = await getProjectTypeList();
                console.log(response.data)
                setProjectTypes(response.data);
            } catch (error) {
                console.error("Error fetching project types:");
            }
        };
        fetchProjectTypeList();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleTypeChange = (e) => {
        setSelectedType(e);
        setPage(1);
    };

    const handleCentreChange = (selectedOption) => {
        setSelectedCentre(selectedOption);
        setPage(1);
    };

    const handleDirChange = (selectedOption) => {
        setSelectedDir(selectedOption);
        setPage(1);
    };

    const handleButtonSkill = async (emp, newSkillIndex) => {
        const payload = {
            _id: emp,
            skills: newSkillIndex
        };
        try {
            const response = await skillsMapping(payload);
            if (response.data.statuscode === 200) {
                toast.success("Successfully Rated", {
                    className: 'custom-toast custom-toast-success'
                });
                setSkillIndex([]);
                fetchEmpList();
            } else if (response.data.statuscode === 400) {
                toast.error("Not Rated", {
                    className: "custom-toast custom-toast-error",
                });
            }
        } catch (error) {
            toast.error('Failed to get Api Data.', {
                className: 'custom-toast custom-toast-error',
            });
        }
    };

    const handleTableInput = (selected, col, rowIndex, item) => {
        const updatedRows = [...rows];
        const currentRow = updatedRows[rowIndex] ? { ...updatedRows[rowIndex] } : { ...item };

        currentRow[col] = selected ? selected.value : 'N/A';
        updatedRows[rowIndex] = currentRow;
        setRows(updatedRows);

 
        const updatedSkillIndex = [];

        projectTypes.forEach(pt => {
            const colId = pt._id;

 
            if (colId === col) {
                updatedSkillIndex.push([colId, selected ? selected.value : 'N/A']);
            } else { 
                const existingRow = updatedRows[rowIndex];
                let value = existingRow[colId];

                if (!value) {
    
                    const skill = item.skills?.find(skill => skill.scopeOfWorkId === colId);
                    value = skill?.Rating || 'N/A';
                }

                updatedSkillIndex.push([colId, value]);
            }
        });

        setSkillIndex(updatedSkillIndex);
        setEmp(item._id);
    };

    return (
        <div className='skill-Mapping'>
            <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
            <div className="row mb-3 align-items-end">
                <div className='col-sm-4 col-md-4 col-ld-4'>
                    <h3 className="mb-0">Skill Mapping</h3>
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                    <Select
                        options={dirOptions}
                        value={selecteddir}
                        onChange={handleDirChange}
                        placeholder="Directorates"
                        isClearable
                    />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                    <Select
                        options={centreOptions}
                        value={selectedCentre}
                        onChange={handleCentreChange}
                        placeholder="Centre"
                        isClearable
                    />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                    <Select
                        options={typeOptions}
                        value={selectedType}
                        onChange={handleTypeChange}
                        placeholder="Type"
                        isClearable
                    />
                </div>
                <div className='col-sm-2 col-md-2 col-lg-2'>
                    <InputGroup>
                        <FormControl
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </InputGroup>
                </div>
            </div>
            <hr />
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>S.No</th>
                        {columns.map((col, index) => (
                            <th key={index}>{columnNames[col]}</th>
                        ))}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {loader ? (
                        <tr>
                            <td colSpan={columns.length + 2} className="text-center">
                                Loading...
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.empid || index}>
                                <td>{(page - 1) * 10 + index + 1}</td>
                                {columns.map((col, i) => (
                                    <td key={i}>
                                        {Array.isArray(projectTypes) &&
                                        projectTypes.map((pt) => pt._id).includes(col) ? (
                                           <Select
                                                options={selectNumericOption}
                                               value={
                                                    (() => {
                                                        const rowData = rows[index] || item;
                                                        const ratingValue = rowData[col] || (() => {
                                                            const skill = item.skills?.find(skill => skill.scopeOfWorkId === col);
                                                            return skill?.Rating || 'N/A';
                                                        })();
                                                        return selectNumericOption.find(opt => opt.value === ratingValue);
                                                    })()
                                                }
                                                onChange={(selectedOption) =>
                                                    handleTableInput(selectedOption, col, index, item)
                                                }
                                                isClearable
                                                styles={{
                                                    container: (provided) => ({
                                                        ...provided,
                                                        width: 124,
                                                    }),
                                                }}
                                            />

                                        ) : (
                                            item[col] || "N/A"
                                        )}
                                    </td>
                                ))}
                                <td>
                                    <Button
                                        variant="primary"
                                        className="btn-btn-primary"
                                        onClick={() => handleButtonSkill(emp, skillIndex)}
                                        disabled={loader}
                                    >
                                        Submit
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
            <Pagination className="pagination-sm">
                <Pagination.Prev
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                />
                {(() => {
                    const items = [];
                    const maxPages = 10;
                    let start = Math.max(1, Math.min(page - Math.floor(maxPages / 2), totalPages - maxPages + 1));
                    let end = Math.min(totalPages, start + maxPages - 1);
                    for (let i = start; i <= end; i++) {
                        items.push(
                            <Pagination.Item
                                key={i}
                                active={i === page}
                                onClick={() => handlePageChange(i)}
                            >
                                {i}
                            </Pagination.Item>
                        );
                    }
                    return items;
                })()}
                <Pagination.Next
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                />
            </Pagination>
        </div>
    );
};

export default SkillMapping;


