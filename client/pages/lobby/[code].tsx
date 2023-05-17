import io, { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { RiddleGame } from "../../components/riddleGame";
import { Dice } from "../../components/dice";
import { Poll } from "../../components/poll";

export interface Riddle {
  answer: string;
  question: string;
}

interface RoomDetails {
  code: string;
  participants: string[];
  riddles: Riddle[];
  gameType: string;
}

export default function Lobby() {
  const data = useSession();
  const [socket, setSocket] = useState<Socket>();

  const [roomDetails, setRoomDetails] = useState<RoomDetails>();
  const [startPressed, setStartPressed] = useState(false);
  const currUser = useRef("");
  const isAdmin = useRef(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  const router = useRouter();
  const { code } = router.query;

  let localCode: string | null = "";

  async function getRoomDetails(code: string) {
    var url = "http://localhost:5000/lobby/" + code;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const roomDetails: RoomDetails = await res.json();
    if (roomDetails) {
      // console.log(roomDetails)
      setRoomDetails(roomDetails);
      if (localCode !== "" && localCode === code) {
        isAdmin.current = true;
      }
    }
  }

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const socket = io("http://127.0.0.1:5000", { autoConnect: false }).connect();
    setSocket(socket);

    currUser.current = localStorage.getItem("nickname") as string;
    localCode = localStorage.getItem("code");
    getRoomDetails(code as string);

    socket?.emit("new participant", {
      nickname: localStorage.getItem("nickname"),
      code: code,
    });
    window.addEventListener("beforeunload", function () {
      socket.disconnect();
    });
    return () => {
      socket.disconnect();
    };
  }, [router.isReady]);

  socket?.on("startGame", function () {
    setStartPressed(true);
  });

  socket?.on("add participant", function (newParticipant) {
    if (
      roomDetails?.participants?.includes(newParticipant?.data.nickname) ||
      newParticipant === undefined
    ) {
      return;
      // setRoomDetails(roomDetails)
    } else {
      const newParticipants = roomDetails?.participants;
      if (newParticipants === undefined) {
        return;
      }
      newParticipants?.push(newParticipant?.data.nickname);
      const newRoomDetails: RoomDetails = {
        code: code as string,
        participants: newParticipants,
        riddles: roomDetails?.riddles as Riddle[],
        gameType: roomDetails?.gameType as string,
      };
      console.log(newRoomDetails);
      setRoomDetails(newRoomDetails);
      console.log(roomDetails);
    }
  });
  socket?.on("remove participant", function (nickname: string) {
    const newParticipants = roomDetails?.participants.filter((p) => p !== nickname);
    if (newParticipants === undefined) {
      return;
    }
    const newRoomDetails: RoomDetails = {
      code: code as string,
      participants: newParticipants,
      riddles: roomDetails?.riddles as Riddle[],
      gameType: roomDetails?.gameType as string,
    };
    setRoomDetails(newRoomDetails);
  });

  if (roomDetails === null) {
    return <div>loading...</div>;
  }
  function onStartPressed() {
    if (roomDetails?.gameType == "poll") {
      if (question == "") {
        alert("You must ask a question!");
      } else if (options.length <= 0) {
        alert("You must place at least one option!");
      } else if (options.filter((o) => o != "").length != options.length) {
        alert("You have empty options, either place an option or remove it!");
      } else {
        //here we should send en emit not as start, but as start poll and send with it the question and the options
        console.log("poll started");
        socket?.emit("start", "started game");
        socket?.emit("start poll", {
          question: question,
          options: options,
        });
      }
    } else {
      console.log(currUser);
      console.log("game started");
      socket?.emit("start", "started game");
    }
  }

  const handleOptionsChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let newOptions = [...options];
    newOptions[index] = event.target.value;
    setOptions(newOptions);
  };

  const addField = () => {
    console.log("Add field");
    const newOption: string = "";
    setOptions([...options, newOption]);
  };

  const removeField = (index: number) => {
    console.log("Remove field");
    let newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  return (
    <div className="flex h-screen mt-40 w-11/12 justify-around">
      {!isAdmin.current && !startPressed ? (
        <div>
          <h1 className="text-2xl">Wait for the owner to start</h1>
        </div>
      ) : null}

      {isAdmin.current && !startPressed && roomDetails?.gameType == "poll" ? (
        <div className="flex flex-col h-1/4 gap-4 w-5/12">
          <input
            maxLength={20}
            className="border p-2 mt-2 w-9/12"
            placeholder="Question"
            value={question}
            required={true}
            onChange={(e) => {
              setQuestion(e.target.value);
            }}
          />
          <div className="">
            {options.map((option, index) => {
              return (
                <div key={index} className="py-3">
                  <input
                    name="option"
                    className="border-2 w-9/12 mr-2"
                    placeholder={`Option${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      handleOptionsChange(e, index);
                    }}
                  />
                  <button
                    onClick={() => removeField(index)}
                    className="px-2 py-1 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => addField()}
              className="px-2 py-1 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400"
            >
              Add option
            </button>
          </div>
          <button
            className="ml-0 px-6 py-3 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto"
            onClick={onStartPressed}
          >
            Start game
          </button>
        </div>
      ) : null}

      {isAdmin.current && !startPressed && roomDetails?.gameType !== "poll" ? (
        <div>
          <h1 className="text-2xl">You can start the game when you are ready</h1>
          <button
            className="ml-2 px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto"
            onClick={onStartPressed}
          >
            Start game
          </button>
        </div>
      ) : null}

      {startPressed ? (
        roomDetails?.gameType === "poll" ? (
          <Poll participants={roomDetails?.participants!} socket={socket!} />
        ) : roomDetails?.gameType === "riddle" ? (
          <RiddleGame
            socket={socket!}
            currUser={currUser.current}
            code={roomDetails?.code!}
            riddles={roomDetails?.riddles!}
          />
        ) : roomDetails?.gameType === "dice" ? (
          <Dice
            participants={roomDetails?.participants!}
            socket={socket!}
            currUser={currUser.current}
          />
        ) : null
      ) : null}

      <div className="flex flex-col h-72 w-72">
        <h2 className="bg-gray-700 text-white w-72 text-center rounded-t-lg pl-2">Participanti</h2>
        <div className="h-72 w-72 overflow-y-auto border-2 border-gray-700 rounded-b-lg">
          {roomDetails?.participants?.map((val, idx) => {
            return (
              <div key={idx} className="text-lg pl-2">
                {val}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
