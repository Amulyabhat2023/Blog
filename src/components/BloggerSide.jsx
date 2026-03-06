import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../cloudinary";

export default function BloggerSide({ onBack }) {

  const [title,setTitle] = useState("");
  const [desc,setDesc] = useState("");
  const [files,setFiles] = useState([]);

  const submitPost = async () => {

    if(!title) return alert("Enter title");

    let media = [];

    for(let file of files){

      const url = await uploadToCloudinary(file);

      media.push({
        url:url,
        name:file.name
      });

    }

    await addDoc(collection(db,"posts"),{

      title,
      desc,
      media,
      created:new Date()

    });

    alert("Post uploaded!");

    setTitle("");
    setDesc("");
    setFiles([]);

  };

  return (

    <div style={{padding:30}}>

      <button onClick={onBack}>Back</button>

      <h2>Create Post</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <br/><br/>

      <textarea
        placeholder="Description"
        value={desc}
        onChange={(e)=>setDesc(e.target.value)}
      />

      <br/><br/>

      <input
        type="file"
        multiple
        onChange={(e)=>setFiles([...e.target.files])}
      />

      <br/><br/>

      <button onClick={submitPost}>Upload</button>

    </div>

  );
}