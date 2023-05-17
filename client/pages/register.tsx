
import { FormEventHandler, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Router from "next/router";

  export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [registerStatus, setRegisterStatus] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePassword = () => {
      setPasswordShown(!passwordShown);
    };
    function timeout(delay: number) {
      return new Promise( res => setTimeout(res, delay) );
  }
    return (
      <div className="flex flex-col items-center justify-center h-90 gap-4">
        <h1 className="text-3xl" >Register </h1>
        <h2 id = "registerStatus">{registerStatus}</h2>
        <form className="flex flex-col w-1/4 gap-4">
          <input
            type="email"
            minLength={5}
            className="border p-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
          />
          <input
            type="text"
            minLength={5}
            className="border p-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col justify-content: space-between">
          <input
            className="border p-2"
            placeholder="Password"
            type = {passwordShown ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        
          </div>
          <input
            className="border p-2"
            placeholder="Confirm password"
            type = {passwordShown ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
           <button
            onClick = {(event) => {
            event.preventDefault();
            togglePassword();
            }}>Show Password</button>

          <button
            className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 w-1/4 self-center font-medium rounded-lg "
            type="submit"
            onClick={async(event) => {
              event.preventDefault();
              
              if(password == confirm){
                if(name.length >= 5 && email.length >= 5 && password.length >= 5) {
                    const body = {
                    email: email,
                    name: name,
                    password: password,
                    };  

                    const res = await fetch(" http://localhost:5000/auth/register", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                    });

                    if (res.status == 400) {
                        let message = document.getElementById('registerStatus')!;
                        message.style.color = "red";
                        setRegisterStatus("User already exists or something went wrong!");
                        return { id: "1231", email: email };
                    }
                    else if (res.status != 201) {
                        return null;
                    }
                    else {
                        let message = document.getElementById('registerStatus')!;
                        message.style.color = "green";
                        setRegisterStatus("User registered!");
                        await timeout(1000);
                        Router.push("login")
                        return { id: "1231", email: email };
                    }

                }
                else{
                    let message = document.getElementById('registerStatus')!;
                    message.style.color = "red";
                    setRegisterStatus("Input too short. Minimum length is 5.");
                }

              }
              else {
                  let message = document.getElementById('registerStatus')!;
                  message.style.color = "red";
                  setRegisterStatus("Passwords do not match!");
              }
              
              
                
            }
            }
          >
          Register
          </button>
          </form>
          </div>
          );
    }

