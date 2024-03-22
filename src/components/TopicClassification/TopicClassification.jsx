import React, { useState, useEffect } from 'react';

const TopicClassificationComponent = ({ topics, selected, onSelectionChange }) => {
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [selectedClassifications, setSelectedClassifications] = useState([]);
    const [displayedClassifications, setDisplayedClassifications] = useState([]);

    useEffect(() => {
        const topicIds = selected.map(s => s.topic.topicId);
        const classificationIds = selected.map(s => s.classificationId);

        setSelectedTopics(topicIds);
        setSelectedClassifications(classificationIds);

        onSelectionChange(classificationIds);
    }, [selected]);

    useEffect(() => {
        if (selectedTopics.length > 0) {
            const lastSelectedTopic = topics.find(topic => topic.topicId === selectedTopics[selectedTopics.length - 1]);
            const newDisplayedClassifications = lastSelectedTopic.classifications.filter(classification =>
                !selectedClassifications.includes(classification.classificationId));
            setDisplayedClassifications(newDisplayedClassifications);
            onSelectionChange(selectedClassifications);
        } else {
            setDisplayedClassifications([]);
        }
    }, [selectedTopics, topics, selectedClassifications]);

    const handleTopicSelect = (topicId) => {
        setSelectedTopics([topicId]);
    };

    const handleClassificationSelect = (classificationId) => {
        setSelectedClassifications(prev =>
            prev.includes(classificationId) ? prev.filter(id => id !== classificationId) : [...prev, classificationId]
        );
    };

    const removeClassificationFromSelected = (classificationId) => {
        setSelectedClassifications(prev => prev.filter(id => id !== classificationId));
    };

    return (
        <div>
            <div className="flex mt-4">
                <div className="w-1/2 p-4 border border-gray-300 rounded-md shadow-sm">
                    <h2 className="text-xl font-bold border-b-2">Tema</h2>
                    <ul>
                        {topics.map((topic) => (
                            <li key={topic.topicId}
                                tabIndex={0}
                                role="button"
                                className={`cursor-pointer p-2 hover:bg-blue-100 ${selectedTopics.includes(topic.topicId) ? 'bg-blue-200' : ''}`}
                                onClick={() => handleTopicSelect(topic.topicId)}>
                                {topic.name}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-1/2 p-4 border border-gray-300 rounded-md shadow-sm">
                    <h2 className="text-xl font-bold border-b-2">Clasificación</h2>
                    {displayedClassifications.length > 0 ? (
                        <ul>
                            {displayedClassifications.map((classification) => (
                                <li key={classification.classificationId}
                                    className="cursor-pointer p-2 hover:bg-blue-100 bg-gray-100"
                                    onClick={() => handleClassificationSelect(classification.classificationId)}>
                                    {classification.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Selecciona un tema para ver sus clasificaciones o no hay más clasificaciones disponibles.</p>
                    )}
                </div>
            </div>

            <div className="p-4 border-b border-gray-300">
                <h2 className="text-xl font-bold mb-2">Clasificaciones Seleccionadas</h2>
                {selectedClassifications.length > 0 ? (
                    <ul>
                        {selectedClassifications.map(id => {
                            const classification = topics.flatMap(topic => topic.classifications).find(c => c.classificationId === id);
                            return (
                                <li key={id} className="inline-block bg-blue-200 p-2 mr-2 mb-2 cursor-pointer"
                                    onClick={() => removeClassificationFromSelected(id)}>
                                    {classification?.name} ×
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>No hay clasificaciones seleccionadas.</p>
                )}
            </div>
        </div>
    );
};

export default TopicClassificationComponent;
