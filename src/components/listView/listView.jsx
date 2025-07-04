import React from 'react';
import { Table, Pagination, InputGroup, FormControl, Button, Spinner } from 'react-bootstrap';
import { FaPlus, FaCheck, FaEye } from "react-icons/fa";
import { IoEyeSharp, IoClose } from "react-icons/io5";
import { CiEdit,CiViewList } from "react-icons/ci";
import { RiMindMap } from "react-icons/ri";
import { GiPowerButton } from "react-icons/gi";
import Select from 'react-select';
import { MdDeleteOutline } from 'react-icons/md';

const ListView = ({ 
  columns, 
  columnNames, 
  data, 
  page, 
  totalPages, 
  onPageChange, 
  searchQuery, 
  onSearchChange, 
  loading, 
  title,
  onAddNewClick,
  buttonClass,
  buttonName,
  onViewClick,
  onEditClick,
  onDeleteClick,
  showStatusIcon =false,
  onCheckClick,
  onCrossClick,
  showIcon = true,
  showFilters = false,
  showFiltersStatus = false,
  selectedCentre,
  setSelectedCentre,
  etpeOptions,
  selectedEtpe,
  setSelectedEtpe,
  centreOptions,
  centreTittle,
  StatusName,
  etpeTypeName,
  statusOptions,
  selectedStatus,
  setSelectedStatus,
  ProjectFilter = false,
  projectOptions,
  selectedProject, 
  setSelectedProject,
  projectTittle,
  showCheckbox = false,
  onCheckboxChange,
  showEditView=false,
  selectedItems,
  showMapIcon=false,
  hideHeader,
  dirOptions,
  selecteddir,
  setSelecteddir,
  dirTittle,
  buttonClasstwo,
  onButtonViewClick,
  buttonNameTwo,
  showButtonFilter=false,
  isViewMode,
  handleTableInput,
  projectTypes,
  showbuttonSubmit=false,
  buttonClassthree,
  onButtonThree,
  showFiltersTwo=false,
  onCheckClickSecond,
  statusMember=false,
  isDeletedFilter= false,
}) => {
  return (
    <div>
        <div className="row mb-3 align-items-end">
        <div className={`col-sm-${showFilters && showFiltersStatus && showFiltersTwo ? 8 : (showFilters && showFiltersStatus ? 2 : (showFilters || showFiltersStatus ? 4 : 10))} col-md-${showFilters && showFiltersStatus && showFiltersTwo ? 8 : (showFilters && showFiltersStatus ? 2 : (showFilters || showFiltersStatus ? 4 : 10))} col-lg-${showFilters && showFiltersStatus && showFiltersTwo ? 8 : (showFilters && showFiltersStatus ? 2 : (showFilters || showFiltersStatus ? 4 : 10))}`  }>
           <h3 className="mb-0">{title}</h3>
        </div>
          

        {showFilters && (
          <>
          {!showFiltersTwo && (
            <>
         {!hideHeader && (
          <div className="col-md-2">
            <Select
              options={dirOptions}
              value={selecteddir}
              onChange={setSelecteddir}
              placeholder={dirTittle}
              isClearable
            />
          </div>
         )}
      
            {!hideHeader && (
              <div className="col-md-2">
                <Select
                  options={centreOptions}
                  value={selectedCentre}
                  onChange={setSelectedCentre}
                  placeholder={centreTittle}
                  isClearable
                />
              </div>
            )}
            {!hideHeader && (
              <div className="col-md-2">
                <Select
                  options={etpeOptions}
                  value={selectedEtpe}
                  onChange={setSelectedEtpe}
                  placeholder={etpeTypeName}
                  isClearable
                />
              </div>
            )}
            </>
          )}
            {showFiltersStatus && (
            <div className="col-md-2">
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder={StatusName}
                isClearable
              />
            </div>
            )}
          </>
        )}

  

        <div className="col-sm-2 col-md-2 col-lg-2">
        {!hideHeader && (
          <InputGroup>
            <FormControl
              placeholder="Search..."
              value={searchQuery}
              onChange={onSearchChange}
            />
          </InputGroup>
        )}
        </div>
      </div>
      <hr></hr>
      <div className='row pb-3'>
      <div className={`col-sm-${showButtonFilter ? 8 : 10} col-md-${showButtonFilter ? 8 : 10} col-lg-${showButtonFilter ? 8 : 10}`  }>
            {ProjectFilter && (
              <>
              <Select
                options={projectOptions}
                value={selectedProject}
                onChange={setSelectedProject}
                placeholder={projectTittle}
                isClearable
              />
              </>
            )}
        </div>
        {showButtonFilter && (
          <div className="col-sm-2 col-md-2 col-lg-2 d-flex justify-content-end">
            {!hideHeader && (
              <Button 
                variant="primary" 
                className={buttonClasstwo || "btn btn-success"} 
                onClick={onButtonViewClick} 
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    {isViewMode ? (<CiViewList />) : (<FaEye /> )}
                    {buttonNameTwo}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <div className='col-sm-2 col-md-2 col-lg-2 d-flex justify-content-end'>
        {!hideHeader && (
        <Button variant="primary" className={buttonClass || "btn btn-success"} onClick={onAddNewClick} disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <>
              {showMapIcon && <RiMindMap className='fs-5'/>} {buttonName} {showIcon && <FaPlus />} 
            </>
          )}
        </Button>
        )}
        </div>
      </div>
      <div style={{  overflowX: 'auto' }}>
      <Table striped bordered hover responsive>
      {!hideHeader && (
        <thead>
          <tr>
            <th>S.No</th>
            {columns.map((col, index) => (
              <th key={index}>{columnNames[col]}</th>
            ))}
            <th>Action</th>
             {statusMember && (
              <th>Member Status</th>
             )}
          </tr>
        </thead>
            )}

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center">
                Loading...
              </td>
            </tr>
               ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="text-center text-muted">
                No data found.
              </td>
            </tr>
            ) : (
            data.map((item, index) => (
              <tr key={item.empid || index}>
                {/* Serial number */}
                <td>{(page - 1) * 10 + index + 1}</td>

                {/* Data columns */}
                    {columns.map((col, i) => (
                      <td key={i}>
                       {Array.isArray(projectTypes) && projectTypes.map(pt => pt._id).includes(col) ? (   // <-- correct check
                          <Select
                            options={projectOptions} 
                            value={item[col]} 
                            onChange={(selectedOption) => handleTableInput(selectedOption, col, i, item)}
                            isClearable
                            styles={{
                              container: (provided) => ({
                                ...provided,
                                width: 124, 
                              }),
                            }}
                          />
                        ) : (
                          item[col] || 'N/A'
                        )}
                      </td>
                    ))}

                {/* Action column */}
                <td>
                  {/* ✅ Checkbox (if enabled) */}
                  {showCheckbox && (
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => onCheckboxChange(item)}
                      style={{ marginRight: '10px' }}
                    />
                  )}

                  {/* ✅ Status icons (if enabled) */}
                  {showStatusIcon && (
                    <>
                      <span className='fs-4' style={{ color: 'green', fontWeight: 'bold' }}>
                        <FaCheck style={{ cursor: 'pointer' }} onClick={() => onCheckClick(item)} />
                      </span>{' '}
                      ||{' '}
                      <span className='fs-4' style={{ color: 'red', fontWeight: 'bold' }}>
                        <IoClose style={{ cursor: 'pointer' }} onClick={() => onCrossClick(item)} />
                      </span>
                    </>
                  )}

                  {showbuttonSubmit && (
                    <>
                      <Button
                        variant="primary" 
                        className={buttonClassthree} 
                        onClick={onButtonThree} 
                        disabled={loading}
                      >
                        submit
                        </Button>
                      
                    </>
                  )}

                  {/* ✅ Edit/View buttons (if enabled) */}
                  {showEditView && (
                    <>
                      <IoEyeSharp style={{ cursor: 'pointer' }} onClick={() => onViewClick(item)} /> ||{' '}
                      <CiEdit style={{ cursor: 'pointer' }} onClick={() => onEditClick(item)} /> 
                        {isDeletedFilter && ( 
                          <>
                          ||{' '}
                          <MdDeleteOutline style={{ cursor: 'pointer', color: 'red' }} onClick={() => onDeleteClick(item)}/>
                        </>
                        )}
                    </>
                  )}                
                </td>
                  {statusMember && (
                    <td className="text-center align-middle">
                      <span className='fs-4' style={{ color: 'green', fontWeight: 'bold' }}>
                        <GiPowerButton  style={{ cursor: 'pointer' }} onClick={() => onCheckClickSecond(item)} />
                      </span>{' '}
                    </td>
                  )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
      </div>
      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
      {!hideHeader && (
        <Pagination className="pagination-sm">
          <Pagination.Prev
            onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(i)}
            >
              {i}
            </Pagination.Item>
          );
        }

        if (end < totalPages) {
          items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
          items.push(
            <Pagination.Item
              key={totalPages}
              active={page === totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Pagination.Item>
          );
        }

        return items;
      })()}
          <Pagination.Next
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          />
        </Pagination>
      )}
      </div>
    </div>
  );
};

export default ListView;
