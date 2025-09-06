import axios from "axios";
import { knowledgeBase } from "../types/ChatBotDto";
import { privateAxios } from "../common/Axios";

export const ask=async (question: string, knowledge_base: knowledgeBase) => {
    try{
        const response= await privateAxios.post('/ask', {
            question: question,
            knowledge_base: knowledge_base
        });
        return response.data;
    }
    catch(error){
        console.error("Error in ask function:", error);
        throw error;
    }
    
}