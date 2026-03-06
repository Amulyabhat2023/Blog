import React, {useState,useEffect} from "react";
import {db} from "./firebase";
import {collection,addDoc,getDocs,deleteDoc,doc} from "firebase/firestore";
import {uploadToCloudinary} from "./cloudinary";

const BLOG_PASS = "blog123";
const VIEW_PASS = "view123";

export default function App(){

const [mode,setMode]=useState("home");
const [posts,setPosts]=useState([]);
const [title,setTitle]=useState("");
const [desc,setDesc]=useState("");
const [files,setFiles]=useState([]);
const [pass,setPass]=useState("");
const [auth,setAuth]=useState(false);

useEffect(()=>{
loadPosts();
},[]);

async function loadPosts(){
const snapshot = await getDocs(collection(db,"blogs"));

let data = snapshot.docs.map(d=>({
id:d.id,
...d.data()
}));

setPosts(data);
}

async function createPost(){

if(!title || !desc){
alert("Fill title and description");
return;
}

let media=[];

for(let f of files){
let uploaded = await uploadToCloudinary(f);
media.push(uploaded);
}

await addDoc(collection(db,"blogs"),{
title,
desc,
media,
date:new Date().toLocaleString()
});

setTitle("");
setDesc("");
setFiles([]);

loadPosts();
alert("Uploaded!");
}

async function deletePost(id){
await deleteDoc(doc(db,"blogs",id));
loadPosts();
}

function loginBlogger(){

if(pass===BLOG_PASS){
setAuth(true);
setMode("blogger");
}
else{
alert("Wrong Password");
}

}

function loginViewer(){

if(pass===VIEW_PASS){
setAuth(true);
setMode("viewer");
}
else{
alert("Wrong Password");
}

}

if(mode==="home"){

return(

<div style={{padding:40}}>

<h1>College Blog</h1>

<button onClick={()=>setMode("blogLogin")}>
Blogger Login
</button>

<button onClick={()=>setMode("viewerLogin")}>
Viewer Login
</button>

</div>

)

}

if(mode==="blogLogin"){

return(

<div style={{padding:40}}>

<h2>Blogger Password</h2>

<input
type="password"
value={pass}
onChange={e=>setPass(e.target.value)}
/>

<button onClick={loginBlogger}>
Login
</button>

<button onClick={()=>setMode("home")}>
Back
</button>

</div>

)

}

if(mode==="viewerLogin"){

return(

<div style={{padding:40}}>

<h2>Viewer Password</h2>

<input
type="password"
value={pass}
onChange={e=>setPass(e.target.value)}
/>

<button onClick={loginViewer}>
Enter
</button>

<button onClick={()=>setMode("home")}>
Back
</button>

</div>

)

}

if(mode==="blogger"){

return(

<div style={{padding:40}}>

<button onClick={()=>setMode("home")}>
Back
</button>

<h2>Create Post</h2>

<input
placeholder="Title"
value={title}
onChange={e=>setTitle(e.target.value)}
/>

<br/><br/>

<textarea
placeholder="Description"
value={desc}
onChange={e=>setDesc(e.target.value)}
/>

<br/><br/>

<input
type="file"
multiple
onChange={e=>setFiles([...e.target.files])}
/>

<br/><br/>

<button onClick={createPost}>
Upload
</button>

<hr/>

<h2>Your Posts</h2>

{posts.map(p=>(

<div key={p.id} style={{border:"1px solid gray",margin:20,padding:20}}>

<h3>{p.title}</h3>

<p>{p.desc}</p>

{p.media?.map((m,i)=>{

if(m.type==="image")
return <img key={i} src={m.url} width="200"/>

if(m.type==="video")
return <video key={i} src={m.url} width="200" controls/>

return null

})}

<br/>

<button onClick={()=>deletePost(p.id)}>
Delete
</button>

</div>

))}

</div>

)

}

if(mode==="viewer"){

return(

<div style={{padding:40}}>

<button onClick={()=>setMode("home")}>
Back
</button>

<h2>All Blogs</h2>

{posts.map(p=>(

<div key={p.id} style={{border:"1px solid gray",margin:20,padding:20}}>

<h3>{p.title}</h3>

<p>{p.desc}</p>

{p.media?.map((m,i)=>{

if(m.type==="image")
return <img key={i} src={m.url} width="200"/>

if(m.type==="video")
return <video key={i} src={m.url} width="200" controls/>

return null

})}

</div>

))}

</div>

)

}

}