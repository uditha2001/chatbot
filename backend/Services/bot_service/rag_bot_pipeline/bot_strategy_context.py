from Services.bot_service.rag_bot_pipeline.IBotService import IBotService
class Bot_Strategy_Context:
    def __init__(self, strategy: IBotService):
        self._strategy = strategy

    def execute_strategy(self, Question: str):
        return self._strategy.full_pipeline(Question)