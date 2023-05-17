import { useSession, signIn } from "next-auth/react";
import { FormEventHandler, useState } from "react";

import Router from "next/router";

export default function Login() {
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [passwordShown, setPasswordShown] = useState(false);
  const { data, status } = useSession();

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email: userInfo.email,
      password: userInfo.password,
    });
      if (res?.status == 200){
          Router.push("http://localhost:3000")
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-96">
      <h1 className=" text-3xl">Login </h1>
      <h2>{status}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-1/4 gap-4">
        <input
          className="border p-2"
          placeholder="Name"
          value={userInfo.email}
          onChange={({ target }) => {
            setUserInfo({ ...userInfo, email: target.value });
          }}
        />
        <input
          className="border p-2"
          placeholder="Password"
          value={userInfo.password}
          type = {passwordShown ? "text" : "password"}
          onChange={({ target }) => {
            setUserInfo({ ...userInfo, password: target.value });
          }}
        />
        <button
            onClick = {(event) => {
            event.preventDefault();
            togglePassword();
            }}>Show Password</button>
        <button
          className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 w-1/4 self-center font-medium rounded-lg "
          type="submit"
        >
          Sign In
        </button>
  
      </form>

          <button
              className="px-4 py-2 text-black bg-white-700 hover:bg-white-600 font-medium rounded-lg m-auto "
              onClick={() => {

                  Router.push("register");

              }}
          >
              Register
          </button>
      

    </div>
  );
}
