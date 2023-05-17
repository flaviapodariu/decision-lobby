import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
    winner: string
}

export const GameEnded: React.FC<Props> = (props: Props) => { 
    const winner = props.winner

    return(
    <div>
        <h1 className="text-4xl mb-4">Game over! </h1>
        <h2 className="text-xl">The winner is {winner}</h2>
    </div>);
}
