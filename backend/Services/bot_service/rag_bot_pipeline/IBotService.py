from abc import ABC, abstractmethod
class IBotService(ABC):
    @abstractmethod
    def full_pipeline(self,Question:str):
        pass
    