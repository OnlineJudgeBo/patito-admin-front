import { useToast } from "@/components/ui/use-toast";
import React, { useCallback, useEffect, useState } from 'react';
import TopicCard from "../../components/TopicCard/TopicCard";
import { apiService } from "../../services/apiService";
import { AddTopicComponent } from "./AddTopicComponent";

function TopicsClassificationsPage() {
    const [topics, setTopic] = useState([]);
    const { toast } = useToast()

    const fetchTopics = useCallback(async () => {
        try {
            const data = await apiService.get("topics");
            const topicList = data.map(topic => ({
                topicId: topic.topicId,
                name: topic.name,
                classifications: topic.classifications,
            }));
            setTopic(topicList);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error al listar los temas",
                description: err.toString(),
            });
        }
    }, [setTopic]);

    useEffect(() => {
        fetchTopics();
    }, []);



    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Temas</h1>
            <AddTopicComponent></AddTopicComponent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topics.map((item, index) => (
                    <TopicCard key={item.topicId} title={item.name} topics={item.classifications} />
                ))}
            </div>
        </div>
    );
};

export default TopicsClassificationsPage;
