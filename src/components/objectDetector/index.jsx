import React, { useRef, useState } from "react";
import styled from "styled-components";

import "@tensorflow/tfjs-backend-cpu";
//import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Loader from "../loader/Loader";

const ObjectDetectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DetectorContainer = styled.div`
  min-width: 200px;
  height: 700px;
  border: 3px solid #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TargetImg = styled.img`
  height: 100%;
`;

const TargetBox = styled.div`
  position: absolute;

  left: ${({ x }) => x + "px"};
  top: ${({ y }) => y + "px"};
  width: ${({ width }) => width + "px"};
  height: ${({ height }) => height + "px"};

  border: 4px solid #1ac71a;
  background-color: transparent;
  z-index: 20;

  &::before {
    content: "${({ classType, score }) => `${classType} ${score.toFixed(1)}%`}";
    color: #1ac71a;
    font-weight: 500;
    font-size: 17px;
    position: absolute;
    top: -1.5em;
    left: -5px;
  }
`;

export function ObjectDetector({ setO_DETECTION, capturedImage, setPred }) {
  const imageRef = useRef();
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const isEmptyPredictions = !predictions || predictions.length === 0;

  const normalizePredictions = (predictions, imgSize) => {
    if (!predictions || !imgSize || !imageRef) return predictions || [];
    return predictions.map((prediction) => {
      const { bbox } = prediction;
      const oldX = bbox[0];
      const oldY = bbox[1];
      const oldWidth = bbox[2];
      const oldHeight = bbox[3];

      const imgWidth = imageRef.current.width;
      const imgHeight = imageRef.current.height;

      const x = (oldX * imgWidth) / imgSize.width;
      const y = (oldY * imgHeight) / imgSize.height;
      const width = (oldWidth * imgWidth) / imgSize.width;
      const height = (oldHeight * imgHeight) / imgSize.height;

      return { ...prediction, bbox: [x, y, width, height] };
    });
  };

  const detectObjectsOnImage = async (imageElement, imgSize) => {
    const model = await cocoSsd.load({});
    const predictions = await model.detect(imageElement, 6);
    const normalizedPredictions = normalizePredictions(predictions, imgSize);
    setPredictions(normalizedPredictions);
    setPred(normalizedPredictions)
    console.log("Predictions: ", predictions);
  };

  const onSelectImage = async () => {
    setPredictions([]);
    const imgElement = imageRef.current;
    setLoading(true);

    const screenWidth = window.screen.width;
    const imageElement = document.createElement("img");
    imageElement.src = capturedImage;
    imageElement.width = screenWidth / 2;
    imageElement.height = imageElement.width * (imageElement.height / imageElement.width);
    console.log(screenWidth);
    console.log(imageElement.width);
    console.log(imageElement.height);

    
    // if (screenWidth > 600) {
    //   canvasElement.width = screenWidth / 2;
    //   canvasElement.height = canvasElement.width * (img.height / img.width);
    // } else {
    //   canvasElement.width = screenWidth - 20;
    //   canvasElement.height = canvasElement.width * (img.height / img.width);
    // }
    imageElement.onload = async () => {
      const imgSize = {
        width: imageElement.width,
        height: imageElement.height,
      };
      await detectObjectsOnImage(imageElement, imgSize);
      setLoading(false);
    };
  };

  return (
    <ObjectDetectorContainer>
      <Loader show={isLoading} />
      <DetectorContainer>
        {<TargetImg src={capturedImage} ref={imageRef} />}
        {!isEmptyPredictions &&
          predictions.map((prediction, idx) => (
            <TargetBox
              key={idx}
              x={prediction.bbox[0]}
              y={prediction.bbox[1]}
              width={prediction.bbox[2]}
              height={prediction.bbox[3]}
              classType={prediction.class}
              score={prediction.score * 100}
            />
          ))}
      </DetectorContainer>
      <button id="button" onClick={onSelectImage}>
        בדוק
      </button>
      <button id="button" onClick={() => setO_DETECTION(false)}>
        <span class="	glyphicon glyphicon-arrow-left"></span>
      </button>
    </ObjectDetectorContainer>
  );
}
