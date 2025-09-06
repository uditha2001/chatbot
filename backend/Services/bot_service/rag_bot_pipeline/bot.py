from langchain_core.runnables import RunnableLambda
from functools import partial
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel
from pydantic import Field
from langchain.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableAssign
from Services.bot_service.rag_bot_pipeline.IBotService import IBotService
import logging
class KnowledgeBase(BaseModel):
    input: str = Field(default="general", description="user response")
    summary: str = Field(default="", description="Summary of conversation so far")
    response: str = Field(default="", description="An ideal response to the user based on their new message")

class BotPipeline(IBotService):


    def RExtract(self,pydantic_class, llm, prompt):
        '''
        Runnable Extraction module
        Returns a knowledge dictionary populated by slot-filling extraction
        '''
        parser = PydanticOutputParser(pydantic_object=pydantic_class)
        instruct_merge = RunnableAssign({'format_instructions' : lambda x: parser.get_format_instructions()})
        def preparse(string):
            if '{' not in string: string = '{' + string
            if '}' not in string: string = string + '}'
            string = (string
                .replace("\\_", "_")
                .replace("\n", " ")
                .replace("\\]", "]")
                .replace("\\[", "[")
            )
            # print(string)  ## Good for diagnostics
            return string
        return instruct_merge | prompt | llm | preparse | parser
 


    def full_pipeline(self, Question: str, existing_knowledge_base: KnowledgeBase = None):
        logger = logging.getLogger(__name__)
        chat_llm = OllamaLLM(model="mistral:latest", temperature=0.5)
        instruct_llm = chat_llm | StrOutputParser()
        
        sys_message = (
            "You are a helpful and knowledgeable sport coach. "
            "You will help the user with their fitness goals and provide personalized advice based on their inputs. "
            "The user just responded: '{input}'. Please update the knowledge base. "
            "You will also keep track of the user's progress and provide encouragement along the way. "
            "Save conversation summary in 'summary' and an ideal response to the user in 'response'.\n"
            "{format_instructions}\n\n"
            "OLD KNOWLEDGE BASE: {know_base}\n\n"
            "NEW MESSAGE: {input}\n\n"
            "NEW KNOWLEDGE BASE:"
        )
        
        logger.info(f"🚀 Executing pipeline for: '{Question}'")
        parser_prompt = ChatPromptTemplate.from_template(sys_message)
       
        try:
            # ✅ Initialize if None
            if existing_knowledge_base is None:
                existing_knowledge_base = KnowledgeBase()
            
            # ✅ Pass the CLASS to RExtract (this stays the same always)
            extractor = self.RExtract(KnowledgeBase, instruct_llm, parser_prompt)
            #                         ↑ Always the same CLASS
            
            # ✅ Pass the INSTANCE DATA as input to the extractor
            extraction_input = {
                'know_base': existing_knowledge_base.model_dump_json(indent=2),  # Convert to JSON string
                #            ↑ This is the actual data that changes each time
                'input': Question
            }
            
            logger.info(f"📥 Old KB: {existing_knowledge_base}")
            logger.info(f"🎯 New message: '{Question}'")
            
            # ✅ The extractor processes the changing input data
            extracted_knowledge = extractor.invoke(extraction_input)
            logger.info(f"✨ Updated KB: {extracted_knowledge}")
            
            if hasattr(extracted_knowledge, 'response') and extracted_knowledge.response:
                final_response = {
                    "answer": extracted_knowledge.response,
                    "current_knowledgeBase": extracted_knowledge
                }
                logger.info(f"✅ Using extracted response")
                return final_response
            else:
                fallback_answer = f"Hello! You said '{Question}'. I'm your fitness coach - how can I help you reach your fitness goals today?"
                final_response = {
                    "answer": fallback_answer,
                    "current_knowledgeBase": extracted_knowledge if extracted_knowledge else existing_knowledge_base
                }
                logger.info(f"🔄 Using fallback response")
                return final_response
                
        except Exception as e:
            logger.error(f"❌ Error in extraction: {e}")
            logger.error(f"🔍 Error type: {type(e)}")
            
            fallback_response = {
                "answer": f"Hello! You said '{Question}'. I'm your fitness coach - how can I help you reach your fitness goals today?",
                "current_knowledgeBase": KnowledgeBase(
                    input=Question,
                    summary="Error occurred during processing",
                    response=f"Hello! I'm here to help with your fitness goals."
                )
            }
            logger.info(f"🔄 Using fallback: {fallback_response}")
            return fallback_response