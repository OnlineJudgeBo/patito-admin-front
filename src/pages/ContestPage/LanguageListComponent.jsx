import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { apiService } from '../../services/apiService';

const LanguageListComponent = ({ setFieldValue, userSelectedList }) => {
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);

    useEffect(() => {
        if (userSelectedList == "") {
            return
        }

        const options = userSelectedList.map(language => ({
            value: language.languageId,
            label: language.name
        }));

        const formattedLanguages = userSelectedList.map((language) => ({
            languageId: language.languageId,
        }));

        setFieldValue('selectedLanguages', JSON.stringify(formattedLanguages));
        setSelectedLanguages(options)
    }, [userSelectedList]);

    const loadOptions = async (inputValue, callback) => {
        try {
            return await apiService.get("programmingLanguages").then((data) => {
                const options = data.map(language => ({
                    value: language.languageId,
                    label: language.name
                }));
                return options
            })
        } catch (err) {
            console.error('Error loading language list:', err);
            setErrorMessages([`Error loading language list: ${err.message}`]);
            callback([]);
        }
    };

    const handleInputChange = (newValue, actionMeta) => {
        if (actionMeta.action === 'remove-value') {
            setSelectedLanguages(current => {
                const updatedLanguages = current.filter(language => language.value !== actionMeta.removedValue.value);
                const formattedLanguages = updatedLanguages.map((language) => ({
                    languageId: language.value,
                }));
                setFieldValue('selectedLanguages', JSON.stringify(formattedLanguages));
                return updatedLanguages;
            });
        } else {
            const updatedLanguages = newValue || [];
            setSelectedLanguages(updatedLanguages);
            const formattedLanguages = updatedLanguages.map((language) => ({
                languageId: language.value,
            }));
            setFieldValue('selectedLanguages', JSON.stringify(formattedLanguages));
        }
    };


    return (
        <div className="mb-4">
            <label htmlFor="selectedLanguages" className="block text-sm font-medium text-gray-700">Select Language</label>
            <AsyncSelect
                isMulti
                loadOptions={loadOptions}
                defaultOptions
                onChange={handleInputChange}
                value={selectedLanguages}
                placeholder="Click para seleccionar un lenguaje."
                className="text-base w-full"
            />
            {errorMessages.length > 0 && (
                <div className="text-red-500 text-sm mt-1">
                    {errorMessages[0]}
                </div>
            )}
        </div>
    );
}

export default LanguageListComponent;
