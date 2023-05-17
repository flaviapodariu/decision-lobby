from . import db


class User():
    def __init__(self, name, email, password) -> None:
        self.name = name
        self.email = email
        self.password = password

    def __repr__(self) -> str:
        return f'{self.name}, {self.email}, {self.password}'

    def to_dict(self):
        return {'name': self.name, "email": self.email, "password": self.password}
        
    @staticmethod
    def from_dict(dict):
        return User(dict['name'], dict['email'], dict['password'])

class Lobby():
    def __init__(self, code, email , participants, game_type, riddles) -> None:
        self.code = code
        self.email = email
        self.participants = participants
        self.gameType = game_type
        self.riddles = riddles

    def __repr__(self) -> str:
        return f'{self.code}, {self.email}, {self.participants}, {self.game_type} {self.riddles}'

    @staticmethod
    def from_dict(dict):
        return Lobby(dict['code'], dict['email'], dict['participants'], dict['gameType'], dict['riddles'])

class Riddle():
    def __init__(self, question, answer) -> None:
        self.question = question
        self.answer = answer

    def __repr__(self) -> str:
        return f'{self.question}, ---> {self.answer}'    

    @staticmethod
    def from_dict(dict):
        return Riddle(dict['question'], dict['answer'])

    def to_dict(self):
        return {'question': self.question, 'answer': self.answer}        