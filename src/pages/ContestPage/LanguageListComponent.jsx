import { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { apiService } from '../../services/apiService';

const LanguageListComponent = ({ setFieldValue, userSelectedList }) => {
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const selectedLanguageKey = (userSelectedList || []).map(language => language.languageId).join(',');

    useEffect(() => {
        let active = true;
        apiService.get('programmingLanguages').then(data => {
            if (!active) return;
            const selectedLanguageIds = selectedLanguageKey ? selectedLanguageKey.split(',') : [];
            const options = data.map(language => ({ value: language.languageId, label: language.name }));
            const selected = selectedLanguageIds.length
                ? options.filter(option => selectedLanguageIds.includes(String(option.value)))
                : options;
            setLanguageOptions(options);
            setSelectedLanguages(selected);
            setFieldValue('selectedLanguages', JSON.stringify(selected.map(language => ({ languageId: language.value }))));
            setErrorMessage('');
        }).catch(err => {
            if (active) setErrorMessage(`Error loading language list: ${err.message}`);
        });
        return () => { active = false; };
    }, [selectedLanguageKey, setFieldValue]);

    const loadOptions = inputValue => languageOptions.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()));

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
                defaultOptions={languageOptions}
                onChange={handleInputChange}
                value={selectedLanguages}
                placeholder="Click para seleccionar un lenguaje."
                className="text-base w-full"
            />
            {errorMessage && <div className="text-red-500 text-sm mt-1">{errorMessage}</div>}
        </div>
    );
}

export default LanguageListComponent;
