import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

const InputField = ({ label = null, name, control, placeholder, type = "text", errors, className = "", format = false, disabled = false }) => {
  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    const numericValue = value.toString().replace(/[^0-9]/g, "");
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (value) => {
    return value.replace(/,/g, "");
  };
  
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}:
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            disabled={disabled}
            min={0}
            id={name}
            {...field}
            className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 placeholder-gray-500 sm:text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
            type={(type == "number" && format) ? "text" : type}
            value={
              (type == "number" && format) ? formatNumber(field.value) : field.value
            }
            onChange={(e) => {
              if (type == "number") {
                if (format) {
                  const formattedValue = formatNumber(e.target.value); 
                  const rawValue = parseNumber(formattedValue);
                  field.onChange(rawValue);
                }
                else {
                  field.onChange(e.target.value);
                }
              } else {
                field.onChange(e.target.value);
              } 
            }}
            placeholder={placeholder}
          />
        )}
      />
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default InputField;

InputField.propTypes = {
  disabled: PropTypes.bool,
  format: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string,
  errors: PropTypes.object,
  className: PropTypes.string,
};
