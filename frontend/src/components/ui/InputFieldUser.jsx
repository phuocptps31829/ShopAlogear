import { Controller } from "react-hook-form";
import PropTypes from "prop-types";

const InputFieldUser = ({ className, control, name, label, placeholder, errors, disabled = false, type = "text" }) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            onChange={(e) => field.onChange(e.target.value)}
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-gray-600 focus:border-gray-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        )}
      />
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};

InputFieldUser.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
};

export default InputFieldUser;
