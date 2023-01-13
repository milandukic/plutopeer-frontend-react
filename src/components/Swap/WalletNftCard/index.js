import React from "react";
import { Button } from "reactstrap";
import CheckIcon from "@mui/icons-material/Check";
import InfoIcon from "@mui/icons-material/Info";
import "./style.scss";

const WalletNftCard = ({ singleNftInfo, nftCardMargin, selectWalletNft }) => {
  return (
    <div
      className="swap-nft-card-wrapper"
      style={{ margin: `5px ${nftCardMargin}px` }}
      onClick={() =>
        selectWalletNft(singleNftInfo.tokenId, singleNftInfo.serialNum)
      }
    >
      <video className="nft-image" alt="..." src={singleNftInfo.imgUrl}></video>
      <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>

      <div className="swap-content-wrapper">
        <div className="nft-name-verify">
          <p>{`${singleNftInfo.creator} | ${singleNftInfo.name}`}</p>
        </div>
        {!singleNftInfo.ticked && <div className="verify-icon-unticked" />}
        {singleNftInfo.ticked && <CheckIcon className="verify-icon" />}
        <div className="entry-buy-wrapper">
          <Button
            href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
          >
            <InfoIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletNftCard;
