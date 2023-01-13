import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function HighLights({ onChange, title, options, value }) {
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
        onChange(event.target.value);
    };

    return (
        <FormControl fullWidth>
        <InputLabel id="demo-simple-select-helper-label" >{title}</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={age}
          label={title}
          onChange={handleChange}
        >
        {options.map((value, index)=>{
            return <MenuItem value={value}>{value.toUpperCase()}</MenuItem>
        })}
        
        </Select>
      </FormControl>
    );
}