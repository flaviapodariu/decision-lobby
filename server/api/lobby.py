from flask import Blueprint, request, jsonify
from . import db
import random
from .models import Lobby
from flask_cors import cross_origin

lobby = Blueprint('lobby', __name__)

def generate_code(code_length=4):
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    code = ''
    for l in range(code_length):
        code += random.choice(letters)
    return code

def getAllRiddles():
    riddles_ref = db.collection(u'riddles').stream()
    riddles = [r.to_dict() for r in riddles_ref]
    return riddles

@lobby.route('/<code>/', methods=['GET'])
@cross_origin()
def getLobby(code):
    
    lobbies_ref = db.collection(u'lobbies')
    try:
        lobby = lobbies_ref.document(code).get().__dict__['_data']
        print(lobby)
    
    
    except Exception as e:
        return e, 404

    return jsonify(lobby), 200

    

@lobby.route('', methods=['POST'])
@cross_origin()
def createLobby():
    code = generate_code()
    email = request.json.get('email')
    nickname = request.json.get('nickname')
    game_type = request.json.get('gameType')
    participants = []

    try:

      lobbies_ref = db.collection(u'lobbies')

      if lobbies_ref.document(code).get().exists:
        code = generate_code()

      if(game_type == 'riddle'):
        all_riddles = getAllRiddles()
        lobby_riddles = [all_riddles[i] for i in range(3)] # 3 random riddles per lobby
      else:
        lobby_riddles = []  

      new_lobby = Lobby(code, email, participants, game_type, lobby_riddles)   
      lobbies_ref.document(code).set(new_lobby.__dict__)

    except Exception as e:
        return f"An error has occured {e}", 400  


    return jsonify(code), 201

 
# @lobby.route('/<code>', methods=['PUT'])
# @cross_origin()
def remove_participant(code, nickname):
    new_participants = []
    try:
        lobby_ref = db.collection(u'lobbies').document(code)
        lobby = lobby_ref.get()
        if lobby.exists: 

            new_participants = lobby.__dict__['_data']['participants']
            new_participants.remove(nickname)
            
            lobby_ref.update({
                "participants": new_participants
            })

    except Exception as e:
        pass 

    return f"Participant {nickname} disconnected", 200       

def add_participant(code, nickname):
    print(code)
    print(nickname)
    new_participants = []
    try:
        lobby_ref = db.collection(u'lobbies').document(code)
        lobby = lobby_ref.get()
        if lobby.exists: 

            new_participants = lobby.__dict__['_data']['participants']
            print('--------------------------------------')
            # print(new_participants)
            new_participants.append(nickname)
            # print(new_participants)
            lobby_ref.update({
                "participants": new_participants
            })
    except Exception as e:
        return f"An error occured ", 500

    return f"Participant {nickname} has entered the lobby", 200


@lobby.route('/<code>', methods=['POST'])
@cross_origin()
def check_lobby_exists(code):
    try:
        lobby_ref = db.collection(u'lobbies').document(code)
        lobby = lobby_ref.get()
        if lobby.exists: 
            return f"Success", 200
        else: 
            return "No lobby with that code ", 404
    except Exception as e:
        return f"An error has occured {e}"



def deleteLobby(code):
    lobby = db.collection(u'lobbies').document(code)
    try:
        if lobby.get().exists:
            lobby.delete()
    except Exception as e:  # exceptie mai specifica?
        return f"An error has occured {e}"   

    return f"Lobby {code} deleted"         
      
