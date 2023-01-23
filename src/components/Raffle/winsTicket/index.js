import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useSelector } from "react-redux";
import "./style.scss";
import * as global from "../../../global";
import * as env from "../../../env";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const WinsTicket = ({ singleNftInfo, nftCardMargin, onClickSendRequest }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [tokenPriceInfo, setTokenPriceInfo] = useState([]);
  const tokenPrices = useSelector((state) => state.api.tokenPrices.payload);
  const totalTokenPrice =
    tokenPriceInfo?.priceUsd &&
    (Number(
      parseFloat(singleNftInfo.price * tokenPriceInfo.priceUsd).toFixed(3)
    ) <= 0
      ? Number(
          parseFloat(singleNftInfo.price * tokenPriceInfo.priceUsd).toFixed(6)
        )
      : Number(
          parseFloat(singleNftInfo.price * tokenPriceInfo.priceUsd).toFixed(3)
        ));

  useEffect(() => {
    setTokenPriceInfo(
      global.getTokenPriceInfo(singleNftInfo.tokenSelId, tokenPrices)
    );
  }, [tokenPrices]);

  return (
    <div
      className="wins-ticket-wrapper"
      style={{ margin: `5px ${nftCardMargin}px` }}
    >
      <video className="nft-image" alt="..." src={singleNftInfo.imgUrl}></video>
      <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>
      <div className="nft-circle-logo"></div>
      <div className="ntf-previous">
        <img src={require("assets/imgs/navigation/claim-raffle.png")}></img>
      </div>
      <div className="nft-name-verify">
        <p>{`${singleNftInfo.creator} | ${singleNftInfo.name} #${singleNftInfo.serialNum}`}</p>
      </div>
      <div className="nft-detail">
        <div className="disp-row">
          <p>PROCESS:</p>
          <p className="content-style color-green">
            {singleNftInfo.nftSendProcess == "pending"
              ? "ready to claim"
              : "success"}
          </p>
        </div>
        <div className="split-bar" />
        <div className="disp-row">
          <p>CREATOR:</p>
          <p className="content-style">{singleNftInfo.raffleCreator}</p>
        </div>
        <div className="disp-row">
          <p>CREATED AT:</p>
          <p className="content-style">{singleNftInfo.startDate}</p>
        </div>
        <div className="disp-row">
          <p>ENDED AT:</p>
          <p className="content-style">{singleNftInfo.endDate}</p>
        </div>
        {/* <div className="split-bar" /> */}
        <div className="disp-row">
          <p className="last-line-style">TICKETS SOLD:</p>
          <p className="current-entry">{`${
            singleNftInfo.soldCount > singleNftInfo.ticketsCount
              ? singleNftInfo.ticketsCount
              : singleNftInfo.soldCount
          }/${singleNftInfo.ticketsCount}`}</p>
          <p className="nft-token-icon ml-1 last-line-style">
            {`${singleNftInfo.price}`}
            <img src={tokenPriceInfo && tokenPriceInfo.icon} />
            {`(${totalTokenPrice}$)`}
          </p>
        </div>
        <div className="entry-buy-wrapper">
          <img
          title="Participants"
            src={require("assets/imgs/navigation/participants.png")}
            onClick={handleOpen}
          />
          <Button   title="Collection"
            href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
            target="_blank"
          >
            <InfoIcon />
          </Button>
          <a
          title="Share"
            className="non-border btn btn-secondary"
            onClick={() => {
              let w = 500;
              let h = 500;
              // Fixes dual-screen position                             Most browsers      Firefox
              const dualScreenLeft =
                window.screenLeft !== undefined
                  ? window.screenLeft
                  : window.screenX;
              const dualScreenTop =
                window.screenTop !== undefined
                  ? window.screenTop
                  : window.screenY;

              const width = window.innerWidth
                ? window.innerWidth
                : document.documentElement.clientWidth
                ? document.documentElement.clientWidth
                : window.width;
              const height = window.innerHeight
                ? window.innerHeight
                : document.documentElement.clientHeight
                ? document.documentElement.clientHeight
                : window.height;

              const systemZoom = width / window.screen.availWidth;
              const left = (width - w) / 2 / systemZoom + dualScreenLeft;
              const top = (height - h) / 2 / systemZoom + dualScreenTop;

              window.open(
                `https://twitter.com/intent/tweet?url=Visit%20This%20Raffle%20on%20%F0%9F%94%97${singleNftInfo.raffleLink}`,
                "newwindow",
                ` location=no width=${w},height=${h},top=${top},left=${left},`
              );
            }}
          >
            <TwitterIcon />
          </a>
          {singleNftInfo.nftSendProcess == "pending" && (
            <Button
              onClick={() =>
                onClickSendRequest(
                  singleNftInfo.tokenId,
                  singleNftInfo.serialNum
                )
              }
            >
              CLAIM
            </Button>
          )}
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h5">
            PARTICIPANTS
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2 }}
            style={{ wordWrap: "break-word" }}
          >
            <p>
              {singleNftInfo.participants == "No buyer!"
                ? "No buyer 😦 invite your friends next time!"
                : singleNftInfo.participants}
            </p>
          </Typography>
          <Typography
            id="modal-modal-button"
            sx={{ mt: 1 }}
            className="flex flex-row justify-center"
          >
            {" "}
            <Button
              onClick={() => {
                window.open(
                  `https://hashscan.io/mainnet/account/${env.TREASURY_ID_RAFFLE}`,
                  "_blank"
                );
              }}
            >
              {/* HASH SCAN */}
              <img
                src={require("assets/imgs/navigation/hashscanliogo.png")}
                style={{ height: "30px", width: "80px" }}
              ></img>
            </Button>
            <Button onClick={handleClose}>
              <CloseIcon />
            </Button>
          </Typography>
        </Box>
      </Modal>
      <ToastContainer autoClose={3000} draggableDirection="x" />
    </div>
  );
};

export default WinsTicket;
