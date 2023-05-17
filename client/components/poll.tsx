import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
    socket: Socket,
    participants: string[]
}
interface Answer {
    answer: string 
    nickname: string 
}

export const Poll: React.FC<Props> = (props: Props) => {
    const [answer, setAnswer] = useState("")
    const [sentAnswer, setSentAnswer] = useState<boolean>(false)

    const [everyoneAnswered, setEveryoneAnswered] = useState<boolean>(false)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [answersCounted, setAnswersCounted] = useState<{key: string, value: number}[]>([])
    const [question, setQuestion] = useState("")
    const [options, setOptions] = useState([])
    const socket = props.socket
    const participants = props.participants
    const currUser = localStorage.getItem('nickname')

    const sendAnswer = () => {
        setSentAnswer(true)
        console.log("answer sent")
        console.log(answer)
        console.log(currUser)
        socket?.emit("answer sent", {
            nickname: currUser,
            answer: answer
        });
    };

    socket?.on("poll started", function(questionAndOptions){
        setQuestion(questionAndOptions.question)
        setOptions(questionAndOptions.options)
    })

    socket?.on("someone answered", function(userAnswer){
        const answer = userAnswer.answer
        const user = userAnswer.nickname
        console.log("We have an answer!")
        console.log(answer)
        console.log(user)
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
                    setEveryoneAnswered(true)

                    countAnswers()
                }
            }
        }
        console.log(answers)
        //add answer and check if everyone answered
        //make visual change in participants list to show who answered
    })

    function countAnswers() {
        const finalResults = new Map<string, number>()
        answers.forEach((answer) => {
            const nr_of_coiches = finalResults.get(answer.answer)
            if(nr_of_coiches === undefined){
                finalResults.set(answer.answer, 1)
            }
            else{
                finalResults.set(answer.answer, nr_of_coiches + 1)
            }
        })

        //convert from Map to Array
        const countedAnswersArray = Array.from(finalResults, ([key, value]) => ({
            key,
            value
        }))

        console.log(countedAnswersArray)

        setAnswersCounted(countedAnswersArray)
    }

    function showAnswerWithCount(value: string, key: number, map: any){
        return (
            <div>
                {key}
                {value}
            </div>
        )
    }

    function showCountedAnswers(finalCountedAnswers: {key:string, value: number }[]){
        if(finalCountedAnswers === undefined){
            return
        }
        else{
            console.log(finalCountedAnswers)
            return(
                finalCountedAnswers.forEach((val) => {
                    console.log(val.key)
                    console.log(val.value)
                    return (
                        <div>
                            {val.key}
                            {val.value}
                        </div>
                    )
                })
            )
        }
    }

    if(everyoneAnswered){
        console.log(answersCounted)
        return(
            <div className="h-full w-5/12 flex flex-col gap-3">
                        <h1 className=" text-xl">{question}</h1>
                        <h1 className=" text-4xl">Results:</h1>
                        <h2 className="text-xl"> Number of people -- Option</h2>
                        <div>
                            {
                                answersCounted?.map((answer) => {
                                    return (
                                        <div className="py-2 px-4 border-2 flex justify-between " >
                                            <p>{answer.key}</p>
                                            <p> {answer.value}</p>
                                             
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
        )
    }
    else{
        if(sentAnswer){
            console.log("You already answered")
            return(
                        <div className="text-4xl">
                            Waiting for the others!
                        </div>
            )
        }
        else{
            return (
                <div className="w-5/12">
                    <div className="flex flex-col  gap-3">
                        <label className=" text-4xl border-b-2 pb-2">{question} </label>
                            {
                                options?.map((option) => {
                                    return (
                                        <div className="py-4 px-2 border-2">
                                            <input 
                                                type="radio" 
                                                name="answer" 
                                                value={option} 
                                                disabled = {sentAnswer}
                                                onChange={(e) => {
                                                    setAnswer(e.target.value);
                                                }}
                                            />
                                            <label className="text-xl"> {option} </label>
                                        </div>
                                    )
                                })
                            }
                            <button 
                                type="submit" disabled= {sentAnswer || !answer} value="Submit"
                                className="ml-0 m-auto px-8 py-4 text-white bg-gray-700 hover:bg-gray-600 font-medium rounded-lg cursor-pointer  "
                                onClick={sendAnswer}
                            > 
                                Send Answer
                            </button>
                        </div>
                    </div>
            )
        }
    }
}
