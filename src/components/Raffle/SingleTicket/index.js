import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/Info";
import TwitterIcon from "@mui/icons-material/Twitter";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import Dialog from "@mui/material/Dialog";
import * as env from "../../../env";
import * as global from "../../../global";
import RaffleWheel from "../RaffleWheel";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./style.scss";

const SingleTicket = ({
  singleNftInfo,
  nftCardMargin,
  onClickBuyEntry,
  addRaffleFlag,
}) => {
  console.log("**********SingleTicket singleNftInfo", singleNftInfo);
  const { param_raffle_id } = useParams();
  const [horizontal, setHorizontal] = useState("horizontal");
  const [open, setOpen] = useState(false);
  const [accountInfo, setAccountInfo] = useState([]);
  const [participantsCount, setParticipantCount] = useState(0);
  const ticketData = useSelector((state) => state.socket.ticketData);
  const [copyLink, setCopyLink] = useState("");
  const [tokenPriceInfo, setTokenPriceInfo] = useState([]);
  const [hdbarPriceInfo, setHbarPriceInfo] = useState([]);
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

  const totalHbarPrice =
    hdbarPriceInfo?.priceUsd &&
    (Number(
      parseFloat(singleNftInfo.price * hdbarPriceInfo.priceUsd).toFixed(3)
    ) <= 0
      ? Number(
          parseFloat(singleNftInfo.price * hdbarPriceInfo.priceUsd).toFixed(6)
        )
      : Number(
          parseFloat(singleNftInfo.price * hdbarPriceInfo.priceUsd).toFixed(3)
        ));

  useEffect(() => {
    if (param_raffle_id) setHorizontal("");
    else setHorizontal("horizontal");
  }, [horizontal]);

  useEffect(() => {
    setTokenPriceInfo(
      global.getTokenPriceInfo(singleNftInfo.tokenSelId, tokenPrices)
    );
    setHbarPriceInfo(global.getTokenPriceInfo(-1, tokenPrices));
  }, [tokenPrices]);

  useEffect(() => {
    getRaffleInfo();
  }, [addRaffleFlag]);

  useEffect(() => {
    getTicketInfo();
  }, [ticketData]);

  useEffect(() => {
    getTicketInfo();
  }, []);

  const getTicketInfo = async () => {
    const raffleInfo = await global.getInfoResponse(
      env.SERVER_URL +
        env.GETL_ALL_SOLD_INFO +
        `?accountId=${singleNftInfo.accountId}&tokenId=${singleNftInfo.tokenId}&serialNum=${singleNftInfo.serialNum}`
    );

    if (raffleInfo.data.result && raffleInfo.data.data.length) {
      let idArray = [];
      raffleInfo.data.data.map((item, index) => {
        idArray.push(item.buyerId);
      });
      singleNftInfo.participants = idArray;
      setParticipantCount(idArray.length);
      setAccountInfo({ ...singleNftInfo });
      console.log("getTicketInfo", singleNftInfo);
    }
  };

  const getRaffleInfo = async () => {
    const raffleInfo = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_SINGLE_RAFFLE +
        `?accountId=${singleNftInfo.accountId}&tokenId=${singleNftInfo.tokenId}&serialNum=${singleNftInfo.serialNum}&nftSendProcess=pending`
    );
    if (raffleInfo.data.result) {
      let singleRaffle = raffleInfo.data.data;

      let wId =
        singleRaffle.winnerId == "No Winner!"
          ? singleRaffle.accountId
          : singleRaffle.winnerId;

      singleRaffle.participants = singleRaffle.participants.split(",");
      singleRaffle.winnerId = wId;
      setParticipantCount(singleRaffle.participants.length);
      setAccountInfo({ ...singleRaffle });
      //setWinnerId(wId);
      setOpen(true);
      console.log("SingleTicket: getRaffleInfo", raffleInfo.data.data);
    }
  };

  const handleJoinLive = async () => {
    await getTicketInfo();
    setOpen(true);
  };

  const closeJoinLive = () => {
    setOpen(false);
  };

  // singleNftInfo.timeLeft =
  //   singleNftInfo.timeLeft < 10000 ? 0 : singleNftInfo.timeLeft;

  return (
    <>
      <div className={`single-ticket-wrapper`}>
        <div className={`single-sub-wrapper ${horizontal}`}>
          <video
            className="nft-image"
            alt="..."
            src={singleNftInfo.imgUrl}
          ></video>
          <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>
          {
            <div
              className={
                singleNftInfo.nftHotInfo.length
                  ? "nft-circle-hot-logo"
                  : "nft-circle-logo"
              }
            ></div>
          }
          {participantsCount > 0 &&
            singleNftInfo.timeLeft >= 10000 &&
            singleNftInfo.timeLeft - 10000 <= 5 && (
              <div className="ntf-live-roulette">
                <div className="nft-live-image" />
                <div className="nft-roulette-image" onClick={handleJoinLive} />
              </div>
            )}
          {singleNftInfo.verified && <VerifiedIcon className="verify-icon" />}
        </div>

        <div className={`single-sub-wrapper`}>
          <div className={`nft-name-verify ${horizontal}`}>
            <p>{`${singleNftInfo.creator} | ${singleNftInfo.name} `}</p>
          </div>
          <div className="nft-token-icon d-flex row m-0">
            <p className="mr-1">Price/entry:</p>
            <p className="color-secondary">{`${singleNftInfo.price}`}</p>
            <img src={tokenPriceInfo && tokenPriceInfo.icon} />
            <p className="color-secondary">{`(${totalTokenPrice}$)`}</p>
          </div>
          <div className="d-flex row m-0">
            <p className="mr-1">Time left:</p>
            <p className="color-red">
              {singleNftInfo.timeLeft >= 10000
                ? `${singleNftInfo.timeLeft - 10000}m`
                : `${singleNftInfo.timeLeft}h`}
            </p>
          </div>
          <div className="nft-token-icon d-flex row m-0">
            <p className="mr-1">Floor Price:</p>
            <p className="color-third">{`${singleNftInfo.floorPrice}`}</p>
            <img src={hdbarPriceInfo && hdbarPriceInfo.icon} />
            <p className="color-secondary">{`(${totalHbarPrice}$)`}</p>
          </div>
          <div className="d-flex row m-0">
            <p className="mr-1">Current entries:</p>
            <p className="current-entry color-third">{`${
              singleNftInfo.soldCount > singleNftInfo.totalCount
                ? singleNftInfo.totalCount
                : singleNftInfo.soldCount
            }/${singleNftInfo.totalCount}`}</p>
            <p>{`Your entries: ${singleNftInfo.myEntry}`}</p>
          </div>
          <div className="entry-buy-wrapper">
            <Button
              href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
            >
              <InfoIcon />
            </Button>
            <CopyToClipboard text={copyLink}>
              {/* <Button
                className="non-border"
                onClick={() => setCopyLink(singleNftInfo.raffleLink)}
              > */}
              <Button
                className="non-border"
                onClick={() => window.location.href = singleNftInfo.raffleLink}
              >
                <AssignmentReturnIcon />
              </Button>
            </CopyToClipboard>
            <Button href="https://twitter.com/DeragodsNFT">
              <TwitterIcon />
            </Button>
            <Button
              onClick={() =>
                onClickBuyEntry(singleNftInfo.tokenId, singleNftInfo.serialNum)
              }
            >
              BUY
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={() => closeJoinLive()}
        className="wheel-dialog"
        style={{ width: "100%", height: "100%" }}
      >
        <RaffleWheel
          singleRaffle={accountInfo}
          onClose={() => closeJoinLive()}
        />
      </Dialog>
    </>
  );
};

export default SingleTicket;
