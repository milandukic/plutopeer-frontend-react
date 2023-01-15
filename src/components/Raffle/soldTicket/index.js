import React, { useState, useEffect } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Button } from "reactstrap";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useSelector } from "react-redux";
import "./style.scss";
import * as global from "../../../global";

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

const SoldTicket = ({ singleNftInfo, nftCardMargin }) => {
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
      global.getTokenPriceInfo(
        singleNftInfo.tokenSelId ? singleNftInfo.tokenSelId : -1,
        tokenPrices
      )
    );
  }, [tokenPrices]);

  return (
    <div
      className="sold-ticket-wrapper"
      style={{ margin: `5px ${nftCardMargin}px` }}
    >
      <video className="nft-image" alt="..." src={singleNftInfo.imgUrl}></video>
      <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>
      <div className="nft-circle-logo"></div>
      <div className="ntf-previous">
        <img src={require("assets/imgs/navigation/previous.png")}></img>
      </div>
      <div className="nft-name-verify">
        <p>{`${singleNftInfo.creator} | ${singleNftInfo.name} #${singleNftInfo.serialNum}`}</p>
      </div>
      <div className="nft-detail">
        <div className="disp-row">
          <img
            src={require("assets/imgs/navigation/winner.png")}
            style={{ width: "20px" }}
          ></img>
          <p>WINNER:</p>
          <p className="content-style color-green">{singleNftInfo.winner}</p>
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
            src={require("assets/imgs/navigation/participants.png")}
            onClick={handleOpen}
          />
          <Button
            href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
          >
            <InfoIcon />
          </Button>
          <Button href="https://twitter.com/DeragodsNFT">
            <TwitterIcon />
          </Button>
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
            <p>{singleNftInfo.participants}</p>
          </Typography>
          <Typography id="modal-modal-button" sx={{ mt: 1 }} >
            <Button onClick={handleClose}  >
              HASH SCAN
            </Button>
            <Button onClick={handleClose}>
              <CloseIcon />
            </Button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default SoldTicket;
