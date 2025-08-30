import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SearchAndFilter = ({ onSearch, onFilter, categories = [], statuses = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: null,
    endDate: null,
  });

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      startDate: null,
      endDate: null,
    });
    onFilter({});
  };

  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, background: 'rgba(255,255,255,0.9)' }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search events..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />
        <IconButton onClick={handleFilterClick} color="primary">
          <FilterListIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            mt: 1,
            p: 2,
            minWidth: 300,
          },
        }}
      >
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Box>
        </LocalizationProvider>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Chip
            label="Clear Filters"
            onClick={clearFilters}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Menu>

      {(filters.category || filters.status || filters.startDate || filters.endDate) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.category && (
            <Chip
              label={`Category: ${filters.category}`}
              onDelete={() => handleFilterChange('category', '')}
            />
          )}
          {filters.status && (
            <Chip
              label={`Status: ${filters.status}`}
              onDelete={() => handleFilterChange('status', '')}
            />
          )}
          {filters.startDate && (
            <Chip
              label={`From: ${filters.startDate.toLocaleDateString()}`}
              onDelete={() => handleFilterChange('startDate', null)}
            />
          )}
          {filters.endDate && (
            <Chip
              label={`To: ${filters.endDate.toLocaleDateString()}`}
              onDelete={() => handleFilterChange('endDate', null)}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SearchAndFilter; 