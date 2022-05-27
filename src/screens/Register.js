import React, { useCallback, useRef, useState } from 'react'

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import Webcam from 'react-webcam'
import { WebcamCapture } from '../components/WebcamCapture';

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

export default function Register() {
  const [imageSrc, setImageSrc] = useState()
  const [username, setUsername] = useState()
  const [result, setResult] = useState(null)
  
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
      const response = await fetch('http://localhost:3027/upload',
        {
          method: 'POST', 
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ "base64Image" : imageSrc, username })
        }
      )
      if(response) {
        const data = await response.json()
        // setImageSrc(data.url)
        setResult(data)
      }
    } catch(error) {
      console.error(error)
    }
  } 

  return (
    <div css={loginCss}>
      <div className="container">
        <h1>Sign up</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input id="username" onChange={handleChange}/>
          <WebcamCapture
            imageSrc={imageSrc}
            setImageSrc={setImageSrc}
          />
          <button type="submit">
            Registrarse
          </button>
        </form>
      </div>

      { result && (<h1>{result?.detectedFaces > 0 ? 'Exito' : 'Error'}</h1>) }

      <a href="/">Login</a>
    </div>
  )
}
