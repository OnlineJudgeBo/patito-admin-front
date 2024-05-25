
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ErrorMessage } from 'formik';
import { useAtom } from "jotai";
import { useEffect } from 'react';
import UploadAdapter from "../../components/CKEditor/upload_adapter";
import { ckEditorAtom } from "../../context/manager";
import './CKEditorStyle.css';

const CkeditorComponent = ({ setFieldValue, valueElement }) => {
    const [ckEditorValue, setCkeditorValue] = useAtom(ckEditorAtom);

    useEffect(() => {
        setCkeditorValue(valueElement)
    }, [valueElement]);

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setCkeditorValue(data);
        setFieldValue('description', data);
    };

    function UploadAdapterPlugin(editor) {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new UploadAdapter(loader);
        };
    }

    return (
        <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Descripción</label>
            <CKEditor
                editor={ClassicEditor}
                data={ckEditorValue}
                config={{
                    toolbar: {
                        shouldNotGroupWhenFull: true,
                        items: [
                            'fontColor', 'fontBackgroundColor', '|',
                            'link', '|',
                            'bold', 'italic', '|',
                            'bulletedList', 'numberedList', '|',
                            'code', 'codeBlock', '|',
                            'insertTable', '|',
                            'blockQuote', '|',
                            'imageUpload', '|',
                            'MathType', 'ChemType',
                            'SourceEditing'
                        ]
                    },
                    extraPlugins: [UploadAdapterPlugin],
                    upload: {}
                }}
                onChange={handleEditorChange}
            />

            <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
        </div>
    )
}
export default CkeditorComponent;
