import { useState } from "react";

export default function ViewerSide({ posts, onBack }) {

  const [selected,setSelected] = useState(null);
  const [idx,setIdx] = useState(0);

  const openPost = (p)=>{

    setSelected(p);
    setIdx(0);

  };

  const closePost = ()=>setSelected(null);

  return (

    <div style={{padding:20}}>

      <button onClick={onBack}>Back</button>

      <h2>All Posts</h2>

      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((p,i)=>(
        <div
          key={i}
          style={{border:"1px solid gray",padding:15,marginBottom:10}}
          onClick={()=>openPost(p)}
        >
          <h3>{p.title}</h3>
          <p>{p.desc}</p>

          {p.media && p.media.length>0 && (
            <img
              src={p.media[0].url}
              width="200"
            />
          )}

        </div>
      ))}

      {selected && (

        <div style={{marginTop:30}}>

          <h2>{selected.title}</h2>
          <p>{selected.desc}</p>

          {selected.media && selected.media.length>0 && (

            <div>

              <img
                src={selected.media[idx].url}
                width="400"
              />

              <br/><br/>

              <button
                onClick={()=>setIdx((idx-1+selected.media.length)%selected.media.length)}
              >
                Prev
              </button>

              <button
                onClick={()=>setIdx((idx+1)%selected.media.length)}
              >
                Next
              </button>

            </div>

          )}

          <br/>

          <button onClick={closePost}>Close</button>

        </div>

      )}

    </div>

  );
}