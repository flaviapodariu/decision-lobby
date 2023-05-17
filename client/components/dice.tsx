
import Router from "next/router";
import { useRef, useState } from "react";
import diceRoll from '../images/diceRoll.gif'
import dice1 from '../images/1.png'
import dice2 from '../images/2.png'
import dice3 from '../images/3.png'
import dice4 from '../images/4.png'
import dice5 from '../images/5.png'
import dice6 from '../images/6.png'
import { Socket } from "socket.io-client";
import React from "react";

interface Props {
  participants: string[],
  socket: Socket,
  currUser: string  
}

interface Answer {
  diceNr: string 
  name: string 
}

export const Dice : React.FC<Props> = (props: Props) => {
    const [diceNr, setDiceNr] = useState(randomNumberInRange(1, 6));
    const [img, setImg] = useState(dice6.src);
    const [answers, setAnswers] = useState<Answer[]>([])
    const [everyoneAnswered, setEveryoneAnswered] = useState<boolean>(false)
    const [diceRolled, setDiceRolled] = useState<boolean>(false)
    const socket = props.socket
    const currUser = props.currUser
    const participants = props.participants
    const [disable, setDisable] = React.useState(false);


    function sendMessage()  {
      console.log("dice rolled")
      socket?.emit("dice rolled", {
          name: currUser,
          diceNr: diceNr,
      });
  };

  socket?.on("someone rolled a dice", async function(userAnswer){
    const diceNr = userAnswer.diceNr
    const user = userAnswer.name
    console.log(userAnswer.name)
    if (userAnswer === undefined || answers.includes(userAnswer))
        {
            return
        }
        else{
            if (participants === undefined){
                return
            }
            else{
                const newAnswers = answers
                newAnswers.push(userAnswer)
                setAnswers(newAnswers)
                
                if(answers.length == participants?.length!){
                    console.log("Everyone answered!!!!!!!!!!!")
                    await timeout(1500);
                    console.log(answers)
                    setEveryoneAnswered(true)
                }
            }
        }
        console.log(answers)
  })
    function randomNumberInRange(min:number, max:number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      function timeout(delay: number) {
        return new Promise( res => setTimeout(res, delay) );
    }
      async function changeDicePic(diceNumber: number) {
        await timeout(1000);
        switch(diceNumber){
        case (1):
          setImg(dice1.src);
          break;
        case (2):
          setImg(dice2.src);
          break;
        case (3):
          setImg(dice3.src);
          break;
        case (4):
          setImg(dice4.src);
          break;
        case (5):
          setImg(dice5.src);
          break;
        case (6):
          setImg(dice6.src);
          break;
        }
    }
    if(everyoneAnswered == true){
      
      return (
        <div className="flex flex-row items-center justify-center h-full w-1/2">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex flex-col justify-center gap-1">
              <h3>Everybody rolled the dice!</h3>
              {
                                answers.map((answer) => {
                                    return (
                                        <div>
                                            {answer.name} -- {answer.diceNr}
                                        </div>
                                    )
                                })
                            }
              </div>
            </div>
        </div>
    )
    }
    else if (diceRolled == true){
      
        return(
          <div className="flex flex-row items-center justify-center h-full w-1/2">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="flex flex-col justify-center gap-1">
             <h3>Wait for everyone to roll the dice!</h3>
              </div>
            </div>
          </div>
        )
    }
    else{
      return (
        <div className="flex flex-row items-center justify-center h-full w-1/2">
            <div className="flex flex-col items-center justify-center h-full">
                <div className="flex flex-col justify-center gap-1">
        <img src={img}/> 
        <button
            disabled={disable}
            onClick = {async(event) => {
            event.preventDefault();
            setDiceNr(randomNumberInRange(1, 6));
            setImg(diceRoll.src);
            
            changeDicePic(diceNr);
            sendMessage();
            setDisable(true)
            await timeout(1500);
            setDiceRolled(true)
            }}
            
          className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 self-center font-medium rounded-lg "
          type="submit"
        >
          Roll the Dice!
        </button>
                  </div>
              </div>
          </div>
    )
  }

}