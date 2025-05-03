import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, values, onChange }) => {
    // filters: [{ label, field, options: [{label, value}] }]
    // values: { [field]: value }
    // onChange: (field, value) => void

    return (
        <div className="filter-bar">
            {filters.map((filter) => (
                <select
                    key={filter.field}
                    className="filter-bar-select"
                    value={values[filter.field] || ''}
                    onChange={e => onChange(filter.field, e.target.value)}
                >
                    <option value="">{filter.label}</option>
                    {filter.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ))}
        </div>
    );
};
export default FilterBar;