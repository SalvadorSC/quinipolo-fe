import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholderKey?: string;
};

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholderKey = "searchByUsername",
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={t(placeholderKey)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "9999px",
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBox;
