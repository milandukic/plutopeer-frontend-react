import React, { useState } from "react";
import { Button } from "reactstrap";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import { Carousel } from "react-responsive-carousel";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import "./style.scss";

const WalletNftCard = ({ tickedNftInfo, cardMargin, onConfirmList }) => {
  const [nftExChecked, setNftExChcked] = useState(false);
  const [hbarExChecked, setHbarExChcked] = useState(false);

  const handleCheckedChange = (id) => {
    id == "nft-checkbox"
      ? setNftExChcked(!nftExChecked)
      : setHbarExChcked(!hbarExChecked);
  };

  return (
    <div className="offer-nft-card-wrapper">
      <Carousel showThumbs={false} infiniteLoop={true} autoPlay={true}>
        {tickedNftInfo.map((item_, index_) => {
          return (
            <>
              <div className="single-nft">
                <video
                  className="nft-image"
                  alt="..."
                  src={item_.imgUrl}
                ></video>
                <img className="nft-image" alt="..." src={item_.imgUrl}></img>
              </div>
              <div className="nft-name-verify">
                <p>{`${item_.creator} | ${item_.name} #${item_.serialNum}`}</p>
              </div>
            </>
          );
        })}
      </Carousel>

      <div
        className="nft-option-bar"
        onClick={(e) => handleCheckedChange("nft-checkbox")}
      >
        {nftExChecked ? (
          <CheckIcon className="verify-icon" />
        ) : (
          <div className="verify-icon-unticked" />
        )}
        <p>
          NFT <SwapHorizIcon /> NFT
        </p>
      </div>
      <div
        className="nft-option-bar"
        onClick={(e) => handleCheckedChange("ehbar-checkbox")}
      >
        {hbarExChecked ? (
          <CheckIcon className="verify-icon" />
        ) : (
          <div className="verify-icon-unticked" />
        )}
        <p>
          NFT <SwapHorizIcon /> HBAR
        </p>
      </div>
      <div className="list-button-wrapper">
        <Button
          className="swap-button"
          onClick={() =>
            onConfirmList(
              nftExChecked && hbarExChecked
                ? 2
                : nftExChecked
                ? 0
                : hbarExChecked
                ? 1
                : -1
            )
          }
        >
          <SwapHorizIcon />
        </Button>
      </div>
    </div>
  );
};

export default WalletNftCard;
