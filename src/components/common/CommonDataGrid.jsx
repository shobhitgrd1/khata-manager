import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import { PAGE_SIZE_OPTIONS } from '../../constants/common.constants';
import styles from './CommonDataGrid.module.scss';

const CommonDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  rowCount,
  paginationMode = 'client',
  getRowId = (row) => row._id || row.id,
  autoHeight = true,
  disableRowSelectionOnClick = true,
  className = '',
  ...rest
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        rowCount={rowCount}
        paginationMode={paginationMode}
        getRowId={getRowId}
        autoHeight={autoHeight}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        {...rest}
      />
    </div>
  );
};

CommonDataGrid.propTypes = {
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  paginationModel: PropTypes.object,
  onPaginationModelChange: PropTypes.func,
  pageSizeOptions: PropTypes.array,
  rowCount: PropTypes.number,
  paginationMode: PropTypes.oneOf(['client', 'server']),
  getRowId: PropTypes.func,
  autoHeight: PropTypes.bool,
  disableRowSelectionOnClick: PropTypes.bool,
  className: PropTypes.string,
};

export default CommonDataGrid;

