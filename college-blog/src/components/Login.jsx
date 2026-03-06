import { useState } from "react";

export default function Login({ onLogin }) {

  const [pass,setPass] = useState("");

  const handleLogin = () => {

    if(pass === "blog123"){
      onLogin();
    } else {
      alert("Wrong password");
    }

  };

  return (

    <div style={{textAlign:"center"}}>

      <h2>Blogger Login</h2>

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPass(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleLogin}>Login</button>

    </div>

  );
}