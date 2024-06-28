import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { apiService } from "../../services/apiService";

const TopicCard = ({ title, topics }) => {
    const [editIndex, setEditIndex] = useState(null);
    const [editName, setEditName] = useState('');
    const { toast } = useToast()

    const handleEditClick = (index, currentName) => {
        setEditIndex(index);
        setEditName(currentName);
    };

    const handleSaveClick = async (index, topic) => {
        try {
            const updatedTopic = { ...topic, name: editName };
            await apiService.update("topics", updatedTopic.classificationId, updatedTopic);
            topics[index].name = editName;
            setEditIndex(null);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error al listar los temas",
                description: err.toString(),
            });
        }
    };

    const handleCancelClick = () => {
        setEditIndex(null);
    };

    return (
        <Card className="p-4 border rounded shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-semibold mb-4">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {topics.map((topic, index) => (
                        <li key={topic.classificationId} className="flex justify-between items-center mb-2">
                            {editIndex === index ? (
                                <div className="flex items-center">
                                    <Input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="border rounded p-1"
                                    />
                                    <Button onClick={() => handleSaveClick(index, topic)} variant="success">Save</Button>
                                    <Button onClick={handleCancelClick} className="secondary">Cancel</Button>
                                </div>
                            ) : (
                                <>
                                    <span>{topic.name}</span>
                                    <div>
                                        <Button onClick={() => handleEditClick(index, topic.name)} variant="outline">
                                            <FaEdit />
                                        </Button>
                                        {/*<Button variant="destructive" className="ml-2">
                                            <FaTrash />
                                        </Button>*/}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export default TopicCard;
