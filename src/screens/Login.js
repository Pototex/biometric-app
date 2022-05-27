import React, { useCallback, useEffect, useRef, useState } from 'react'

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { WebcamCapture } from '../components/WebcamCapture'

const loginCss = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    text-align: left;
    font-size: 15px;
    margin-bottom: 5px;
  }

  input {
    margin-bottom: 20px;
  }

  .container {
    padding: 20px;
    border: 1px solid black;
    border-radius: 10px;
  }

  button {
    background-color: #5e85c4;
    height: 40px;
    border: none;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: .2em;
    color: #fff;
  }

  input {
    height: 35px;
    border: 1px solid #0e0e0e;
    border-radius: 5px;
  }

  a {
    margin-top: 20px;
  }
`

export default function Login() {
  const [imageSrc, setImageSrc] = useState()
  const [username, setUsername] = useState()
  const [imgResults, setImgResults] = useState([])
  const [recognize, setRecognize] = useState(-1)
  
  const handleChange = (e) => {
    const {value} = e.target
    setUsername(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(e)
    if (imageSrc && username) {
      console.log({username, imageSrc})
      uploadFile()
    }
  }

  const uploadFile = async () => {
    try {
      const response = await fetch('http://localhost:3027/login',
        {
          method: 'POST', 
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ "base64Image" : imageSrc, username })
        }
      )
      if(response) {
        const data = await response.json()
        setImgResults(data.imgResults)
        setRecognize(data.recognize)
      }
    } catch(error) {
      console.error(error)
    }
  }


  return (
    <div css={loginCss}>
      <div className="container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username" style={{right: 0}}>Username:</label>
          <input id="username" onChange={handleChange}/>
          <WebcamCapture
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
          />
          <button type="submit">
            Iniciar
          </button>
        </form>
      </div>

      {imgResults?.length > 0 && (<h1>Resultados</h1>)}

      {recognize > 0  && (<h4>{ recognize < 0.5 ? ('Soy yo!!!') : ('No soy yo!!!')} {`(${recognize})`}</h4>
)}
      
      {imgResults?.length > 0 && imgResults.map((img) => (
        <div key={img.image}>
          <h4>{img.title}</h4>
          <img src={`http://localhost:3027/out/${img.image}`} alt="result"/>
        </div>
      ))}

      <a href="/register">Registro</a>

    </div>
  )
}
