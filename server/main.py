from api import create_app
from flask_socketio import SocketIO 
from flask_cors import CORS
from flask import request, session
from flask_session import Session
from api.lobby import remove_participant, add_participant
from api.lobby import getAllRiddles

app = create_app()
Session(app)
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins='*', ping_timeout=5, ping_interval=5)


solution = getAllRiddles()

@socketio.event
def connect():
    print("connected", request.sid)

@socketio.event
def disconnect():
    s = session.get(request.sid)
    remove_participant(s.get("code"), s.get("nickname"))
    socketio.emit("remove participant", s.get("nickname"))
    session.clear()
    print('disconnected')

@socketio.on('start')
def handle_start(message):
    socketio.emit('startGame', "started game for all")


@socketio.on('guess')
def handle_event(json):
    ans = ''
    for s in solution:
        if s['question'] == json['question']:
            ans = s['answer']
    if(ans  == ''):
        print("question does not exist")    

    if json["message"] == ans:
        socketio.emit("message response", {"status": "done", "winner": json["name"]}, json=True, to=request.sid)
    print(json)

@socketio.on("dice rolled")
def handle_event(json):
    print("ceva")
    socketio.emit("someone rolled a dice", {"name": json["name"], "diceNr": json["diceNr"]}, json=True)
    print(json)

@socketio.on('game ended')
def handle_eog(json):
    socketio.emit("eog response", {"winner": json["winner"], "room": json["room"]}, json=True, broadcast=True)

@socketio.on('answer sent')
def handle_answer(json):
    socketio.emit("someone answered", {"nickname": json["nickname"], "answer": json["answer"]}, json=True)

@socketio.on('new participant')
def handle_new_participant(data):
    session[request.sid] = dict([("nickname", data.get("nickname")), ("code", data.get("code"))])
    msg, code = add_participant(data.get("code"), data.get("nickname"))
    print(code)
    # print("we have a new arrival")
    socketio.emit("add participant",{'data':data}, broadcast=True)

@socketio.on("start poll")
def handle_start_poll(json):
    socketio.emit("poll started", {"question": json["question"], "options": json["options"]})

if __name__ == "__main__":
    socketio.run(app, debug=True)
            




