import { Controller } from "react-hook-form";
import PropTypes from "prop-types";
import Select from "react-select";

const SelectField = ({
  label = null,
  name,
  control,
  placeholder,
  options,
  errors,
  className = "",
  isLoading = false,
  disabled = false,
  isMulti = false,
}) => {
  return (
    <div className={`${className} h-fit z-10`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}:
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            isDisabled={disabled || isLoading}
            isLoading={isLoading}
            isMulti={isMulti} 
            options={options} 
            placeholder={isLoading ? "Đang tải dữ liệu..." : placeholder}
            value={options.filter((option) =>
              isMulti
                ? field.value?.includes(option.value)
                : field.value === option.value
            )} 
            onChange={(selected) =>
              field.onChange(
                isMulti
                  ? selected?.map((option) => option.value) || []
                  : selected?.value || ""
              )
            }
            className={`basic-single ${errors[name] ? "border-red-500" : ""}`}
            classNamePrefix="select"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: errors[name] ? "#ef4444" : base.borderColor,
                "&:hover": {
                  borderColor: errors[name] ? "#ef4444" : base.borderColor,
                },
              }),
            }}
          />
        )}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
      )}
    </div>
  );
};

SelectField.propTypes = {
  isMulti: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  isLoading: PropTypes.bool,
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  errors: PropTypes.object,
  className: PropTypes.string,
};

export default SelectField;