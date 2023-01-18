import React, { useEffect, useState } from "react";
import WheelComponent from "./wheel";
import Confetti from "react-confetti";
import Dialog from "@mui/material/Dialog";
import * as global from "../../../global";

import "./style.scss";

const RaffleWheel = ({ singleRaffle, onClose }) => {
  // console.log(">>>>>>>>>>>>>>>>>>>>RaffleWheel:", singleRaffle);

  // let resSec = 100;
  const [resSec, setResSec] = useState(0);
  const [disCount, setDiscount] = useState(0);
  const [conRun, setConRun] = useState(false);
  const [spintStart, setSpinStart] = useState(false);
  const [timeLeft, setTimeLeft] = useState(resSec);
  const [segments, setSegments] = useState([]);
  const [segColors, setSegColors] = useState([]);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const timerDelay = 1000;

  let timerHandle = 0;

  useEffect(() => {
    if (resSec != 0) {
      timerHandle = setInterval(onTimerTick, timerDelay);
    }
  }, [resSec]);
  useEffect(() => {
    if (singleRaffle && singleRaffle.participants) initData();
  }, [singleRaffle]);

  const initData = async () => {
    let curTime = await global.getTime();

    let resSec = singleRaffle.timeLimit
      ? parseInt(
          (parseInt(
            singleRaffle.timeLimit * 3600 * 1000 + singleRaffle.createdTime
          ) -
            curTime) /
            1000
        )
      : 0;

    setResSec(resSec);
    setDiscount(resSec);
    const partArray = singleRaffle.participants;
    if (singleRaffle.winnerId) setSpinStart(true);
    const num = partArray ? partArray.length : 0;
    setSegColors(getColors(num));
    setSegments(partArray);

    console.log("RaffleWheel initData", partArray);
  };

  const onWheelFinished = (winner) => {
    setConRun(true);
  };

  function getColors(num) {
    const hsls = [];
    for (let i = 0; i < num; i++) {
      var letters = "0123456789ABCDEF";
      var color = "#";
      for (var j = 0; j < 6; j++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      hsls.push(color);
    }
    return hsls;
  }

  const onRoutteClose = () => {
    setConRun(false);
    clearInterval(timerHandle);
    onClose();
  };

  let p = disCount;

  console.log("refresh", p);
  const onTimerTick = () => {
    p = p - 1;
    if (p <= 0) {
      setSpinStart(true);
      setDiscount(p);
      clearInterval(timerHandle);
    } else {
      console.log(p);
      setDiscount(p);
    }
  };

  useEffect(() => {}, []);

  return (
    <>
      <WheelComponent
        segments={segments}
        segColors={segColors}
        winningSegment={singleRaffle.winnerId}
        onFinished={(winner) => onWheelFinished(winner)}
        primaryColor="gray"
        contrastColor="white"
        buttonText=""
        isOnlyOnce={false}
        onClose={onClose}
        isStart={spintStart}
      ></WheelComponent>
      <div className="winnerFixedImage">
        {/* <video className="nft-image" alt="..." src={singleRaffle.imgUrl}></video> */}
        <img className="nft-image" alt="..." src={singleRaffle.imgUrl} />
        <h1>{!spintStart && `${disCount}s`}</h1>
      </div>

      <Dialog open={conRun} onClose={onRoutteClose} fullScreen={false}>
        <div className="congratulationDialogTitle">
          <h3>We have a winner!</h3>
        </div>
        <div className="congratulationDialogId">
          <h1>{singleRaffle.winnerId}</h1>
        </div>
      </Dialog>

      <Confetti
        style={{
          position: "fixed",
        }}
        width={width}
        height={height}
        run={conRun}
      />
    </>
  );
};

export default RaffleWheel;
