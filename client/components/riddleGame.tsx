import { useRef, useState, useCallback } from "react"
import { Socket } from "socket.io-client";
import { Riddle } from "../pages/lobby/[code]";
import { GameEnded } from "./gameEnded";

interface Props {
    socket: Socket,
    currUser: string,
    code: string,
    riddles: Riddle[]

}

export const RiddleGame: React.FC<Props> = (props: Props) => {
    console.log(props.currUser)
    const currRiddleIndex = useRef(0)
    const [guess, setGuess] = useState("");
    const prompt = useRef(props.riddles[0].question)
    const [question, setQuestion] = useState(prompt.current)
    const socket = props.socket
    const currUser = props.currUser
    const winner = useRef("")
    const [gameEnded, setGameEnded] = useState(false)

    const sendMessage = () => {
        console.log("message sent")
        socket?.emit("guess", {
            name: currUser,
            message: guess,
            question: prompt.current
        });
        setGuess("")
    };

    const onGameOver = useCallback((isOver:boolean) => {
        setGameEnded(isOver);
    }, [setGameEnded]);

    socket?.off("message response").on("message response", function (msg) {
        if (msg?.status === 'done') {
        
            if (currRiddleIndex.current == 2) {
                console.log("ended")
                socket?.emit("game ended", {
                    winner: currUser,
                    room: props.code!
                });
            }
            else {
                currRiddleIndex.current += 1
                const riddle = props.riddles?.[currRiddleIndex.current]!.question
                prompt.current = riddle
                setQuestion(prompt.current)
            }  
        }
    });

    socket?.on("eog response", function (gameInfo) {
        console.log(gameInfo, "-------inf")
        winner.current = gameInfo?.winner
        setGameEnded(true)
    });
    return (
      !gameEnded ? (
             <div className = "flex w-5/12" >
                    <div className="flex flex-col gap-4">
                        <label className="text-4xl">{question} </label>
                        <input
                            className="border-2 py-2 px-2"
                            placeholder="Guess"
                            value={guess}
                            onChange={(e) => {
                                setGuess(e.target.value);
                            }}
                        />
                        <button
                            className="ml-0 mt-0 m-auto px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg"
                            onClick={sendMessage}
                        >
                            {" "}
                            Send guess
                        </button>
                    </div>
                </div>
        ): (<GameEnded
                winner = {winner.current}
        />)
    
    )
}
