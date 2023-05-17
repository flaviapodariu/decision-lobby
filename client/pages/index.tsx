import { useSession, signOut } from "next-auth/react";
import { FormEventHandler, useRef, useState } from "react";

import Router from "next/router";

export default function Home() {
  const { data, status } = useSession();
  const [clicked, setClicked] = useState(false);
  const [clickedEnter, setClickedEnter] = useState(false);
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const [gameType, setGameType] = useState("riddle")

  const createRoom = async () => {
    const res = await fetch("http://localhost:5000/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data?.user?.email, nickname: nickname, gameType: gameType }, ),
    });
    const code = await res.json();
    if (res.status == 201) {
      console.log("created")
      const route = "lobby/" + code
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("code", code)
      Router.push(route)
    } else {
      console.log("create room failed")
    }
  };

  const enterRoom = async () => {
      const fetch_url = "http://localhost:5000/lobby/" + code
      const res = await fetch(fetch_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
      });
      const route = "lobby/" + code
      if(res.status == 200) {
          localStorage.setItem("nickname", nickname);
          Router.push(route)
      }

     
  };

  return (
    <div className=" w-full h-screen">
      <h1 className="text-center text-5xl p-8 font-bold">Decision Lobby</h1>
      <div className="flex m-auto mt-24 h-96 w-screen justify-around items-center">
        <div className="flex flex-col h-3/4 w-1/4 border-2 border-gray-700 items-center shadow-lg rounded-lg">
          <h2 className="text-2xl my-auto">Create Lobby</h2>
          <p className=" text-center px-4 ">
            Create a poll or a quick game and invite your friends
          </p>
          {clicked === false ? (
            <button
              className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto "
              onClick={() => {
                if (status === "unauthenticated") {
                  Router.push("login");
                } else {
                  setClicked(true);
                }
              }}
            >
              Create
            </button>
          ) : (
            <div className="flex flex-col my-auto">
              <input
                className="border p-2"
                placeholder="Enter your nickname"
                value={nickname}
                maxLength={10}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
              />
              <label>
                Pick a game:
                <select value={gameType} onChange={e => setGameType(e.target.value)}>
                    <option value="riddle">Riddles</option>
                    <option value="poll">Make a poll</option>
                    <option value="dice">Roll dices</option>
                </select>
              </label>
              <button
                className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto mt-2"
                onClick={createRoom}
              >
                Create Lobby
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col h-3/4 w-1/4 border-2 border-gray-700  items-center shadow-lg rounded-lg">
          <h2 className="text-2xl my-auto">Enter Lobby</h2>
          <p className="text-center px-4">Enter a friend's lobby by introducing the code</p>
          {clickedEnter === false ? (
            <button
              className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto"
              onClick={() => {
                setClickedEnter(true);
              }}
            >
              Enter
            </button>
          ) : (
            <div className="flex flex-col my-auto">
              <input
                className="border p-2"
                placeholder="Code"
                value={code}
                onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                }}
              />
              <input maxLength={10}
                     className="border p-2 mt-2"
                     placeholder="Nickname"
                     value={nickname}
                     onChange={(e) => {
                        setNickname(e.target.value);
                    }} />
                    
              <button className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg m-auto mt-2"
                onClick={enterRoom}>
                Enter Lobby
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
