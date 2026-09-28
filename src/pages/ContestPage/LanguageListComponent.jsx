import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { apiService } from '../../services/apiService';

const LanguageListComponent = ({ setFieldValue, userSelectedList, selectAllByDefault = false }) => {
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);

    useEffect(() => {
        if (userSelectedList?.length) {
            const options = userSelectedList.map(language => ({
                value: language.languageId,
                label: language.name
            }));
            setSelectedLanguages(options);
            setFieldValue('selectedLanguages', JSON.stringify(options.map(({ value }) => ({ languageId: value }))));
            return;
        }

        if (selectAllByDefault) {
            loadOptions('').then(options => {
                setSelectedLanguages(options);
                setFieldValue('selectedLanguages', JSON.stringify(options.map(({ value }) => ({ languageId: value }))));
            });
        }
    }, [userSelectedList, selectAllByDefault]);

    const loadOptions = async () => {
        try {
            const data = await apiService.get("programmingLanguages");
            return data.map(language => ({
                value: language.languageId,
                label: language.name
            }));
        } catch (err) {
            console.error('Error loading language list:', err);
            setErrorMessages([`Error loading language list: ${err.message}`]);
            return [];
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
