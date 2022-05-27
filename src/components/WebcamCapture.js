/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user"
}

const styles = css`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  button {
    margin-top: 5px;
  }
`

export function WebcamCapture({ imageSrc, setImageSrc }) {
  const webcamRef = useRef(null)

  const captureCallback = useCallback(
    () => {
      setImageSrc(webcamRef.current.getScreenshot())
    }, 
    [webcamRef]
  )

  const discardPhoto = () => {
    setImageSrc(null)
  }
  
  return (
    <div css={styles}>
      {!imageSrc && (
        <Webcam
          audio={false}
          width={300}
          height={168}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          ref={webcamRef}
        />
      )}
      {imageSrc && (
        <img alt="screenshot" 
          src={imageSrc}
        />
      )}  
      <button type="button" 
        onClick={imageSrc ? discardPhoto : captureCallback}>
          {imageSrc ? 'Descartar' : 'Capturar foto'}
      </button>
    </div>
  )
}