import { Controller } from "react-hook-form";
import { Editor } from '@tinymce/tinymce-react';
import PropTypes from "prop-types";

const TinyEditor = ({ control, name, errors }) => {
  const error = errors[name];

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Editor
            apiKey="k1po12gny9z83sfvjlk0plo490ugbnjbqwt4fu8akrny9bqs"
            value={field.value || ""}
            onEditorChange={(content) => field.onChange(content)}
            init={{
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              placeholder: "Nhập nội dung của bạn...",
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              language: 'vi',
            }}
          />
        )}
      />
      {error && (
        <small className="mt-1 block text-sm text-red-500">
          {error.message}
        </small>
      )}
    </>
  );
};

TinyEditor.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
};

export default TinyEditor;