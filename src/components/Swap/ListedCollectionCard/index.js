import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
// import {Button} from "@mui/Button";
import { Carousel } from "react-responsive-carousel";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import InfoIcon from "@mui/icons-material/Info";
import MailIcon from "@mui/icons-material/Mail";
import MessageIcon from "@mui/icons-material/Message";
import TwitterIcon from "@mui/icons-material/Twitter";
import { CopyToClipboard } from "react-copy-to-clipboard";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import { useSelector } from "react-redux";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./style.scss";
import * as global from "../../../global";
import { useHashConnect } from "../../../assets/api/HashConnectAPIProvider.tsx";

const COLLECTION_TYPE_1 = "offer1";
const COLLECTION_TYPE_2 = "offer2";
const COLLECTION_TYPE_3 = "offer3";
const COLLECTION_TYPE_4 = "offer4";

const ListedCollectionCard = ({
  collectionInfo,
  cardMargin,
  collectionType,
  onClickSwapOfferButton,
  swapId,
}) => {
  const { walletData } = useHashConnect(); // connect with hashpack wallet
  const { accountIds } = walletData; // get wallet data
  const [copyLink, setCopyLink] = useState("");
  const tokenPrices = useSelector((state) => state.api.tokenPrices.payload);
  const [hdbarPriceInfo, setHbarPriceInfo] = useState([]);

  const totalHbarPrice =
    hdbarPriceInfo?.priceUsd &&
    (Number(
      parseFloat(
        collectionInfo.totalFloorPrice * hdbarPriceInfo.priceUsd
      ).toFixed(3)
    ) <= 0
      ? Number(
          parseFloat(
            collectionInfo.totalFloorPrice * hdbarPriceInfo.priceUsd
          ).toFixed(6)
        )
      : Number(
          parseFloat(
            collectionInfo.totalFloorPrice * hdbarPriceInfo.priceUsd
          ).toFixed(3)
        ));

  useEffect(() => {
    setHbarPriceInfo(global.getTokenPriceInfo(-1, tokenPrices));
  }, [tokenPrices]);

  return (
    <div
      className="listed-collection-card-wrapper"
      style={{ margin: `5px ${cardMargin}px` }}
    >
      <Carousel showThumbs={false} infiniteLoop={true} autoPlay={true}>
        {collectionInfo.nfts.map((item_, index_) => {
          return (
            <>
              <div className="single-nft">
                <video
                  className="nft-image"
                  alt="..."
                  src={item_.imgUrl}
                ></video>
                <img className="nft-image" alt="..." src={item_.imgUrl}></img>
                <div className="display-str-row nft-type">
                  <p>
                    {collectionType == COLLECTION_TYPE_4 ? (
                      <SwapHorizIcon style={{ color: "#color: #23f06f" }} />
                    ) : (
                      <>
                        NFT <SwapHorizIcon />
                        {collectionInfo.isListed == 0
                          ? collectionInfo.offerHbar + "HBAR"
                          : collectionInfo.offerType == 0
                          ? "NFT"
                          : collectionInfo.offerType == 1
                          ? "HBAR"
                          : "NFT & HBAR"}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="nft-name-verify">
                {collectionType == COLLECTION_TYPE_3 ? (
                  <p>
                    {collectionInfo.accountId == accountIds[0]
                      ? "YOUR NFTS"
                      : "OFFERED"}
                  </p>
                ) : (
                  <p>{`${item_.creator} | ${item_.name} #${item_.serialNum}`}</p>
                )}
              </div>
            </>
          );
        })}
      </Carousel>
      <div className="card-info-str">
        {collectionType == COLLECTION_TYPE_4 && (
          <>
            <div className="nft-success">
              <p className="color-primary">{`PROCESS :`} </p>{" "}
              <p className="color-secondary" style={{ marginLeft: "10px" }}>
                {collectionInfo.offerCount
                  ? "Successful Swap"
                  : "Ready for Claim"}
              </p>
            </div>
          </>
        )}
        <div className="nft-creator">
          <p className="color-primary">{`Creator :`} </p>{" "}
          <p
            className="color-secondary"
            style={{ marginLeft: "10px" }}
          >{` ${collectionInfo.accountId}`}</p>
        </div>
        {collectionInfo.nftCount && (
          <div className="display-str-row">
            <p className="color-primary">Nft Count :</p>
            <p className="color-third" style={{ marginLeft: "10px" }}>
              {collectionInfo.nftCount}
            </p>
          </div>
        )}
        <div className="display-str-row nft-token-icon ">
          <p className="color-primary">Floor Price :</p>
          <p className="color-third">{`${collectionInfo.totalFloorPrice}`}</p>
          <img src={hdbarPriceInfo && hdbarPriceInfo.icon} />
          <p className="color-secondary">{`(${totalHbarPrice}$)`}</p>
        </div>
        <div className="list-button-wrapper">
          <Button
            href=
            {`https://zuse.market/collection/${collectionInfo.tokenId}`}
            target="_blank"
          >
            <InfoIcon />
          </Button>
          <CopyToClipboard text={copyLink}>
            <div
              className="non-border"
              onClick={() => setCopyLink(collectionInfo.swapLink)}
            >
              <AssignmentReturnIcon />
            </div>
          </CopyToClipboard>


          <Button href="https://twitter.com/DeragodsNFT">
            <TwitterIcon />
          </Button>
          {onClickSwapOfferButton &&
            (collectionType == COLLECTION_TYPE_3 ? (
              collectionInfo.swapId == swapId && (
                <></>
                // <Button
                //   className="swap-button"
                //   onClick={() => onClickSwapOfferButton(swapId, collectionType)}
                // >
                //   <MessageIcon />
                // </Button>
              )
            ) : (
              <Button
                className="swap-button"
                onClick={() =>
                  onClickSwapOfferButton(
                    collectionInfo.swapId,
                    collectionType,
                    collectionInfo.offerType
                  )
                }
              >
                {collectionType === COLLECTION_TYPE_1 && <SwapHorizIcon />}
                {collectionType === COLLECTION_TYPE_2 && <SwapHorizIcon />}
                {collectionType === COLLECTION_TYPE_4 && <p>CLAIM</p>}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ListedCollectionCard;
