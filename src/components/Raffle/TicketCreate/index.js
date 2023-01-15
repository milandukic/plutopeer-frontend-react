/*global chrome*/
import React, { useEffect, useState } from "react";
import { Button, Input } from "reactstrap";
import Dialog from "@mui/material/Dialog";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/Info";
import * as global from "../../../global";
import * as env from "../../../env";
import "./style.scss";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useHashConnect } from "../../../assets/api/HashConnectAPIProvider.tsx";
import { useSelector } from "react-redux";
import Checkbox from "@mui/material/Checkbox";

const TicketCreate = ({
  singleNftInfo,
  nftCardMargin,
  onClickCreateTicket,
}) => {
  const { walletData } = useHashConnect(); // connect with hashpack wallet
  const { accountIds } = walletData; // get wallet data
  const tokenPrices = useSelector((state) => state.api.tokenPrices.payload);
  const [priceValue, setPriceValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [ticketsValue, setTicketsValue] = useState("");
  const [tokenIconUrl, setTokenIconUrl] = useState("");
  const [tokenInfos, setTokenInfos] = useState([]);
  const [tokenDialog, setTokenDialog] = useState(false);
  const [tokenSelId, setTokenSelId] = useState("-1");

  singleNftInfo.schedule = {
    isWeeklyFee: false,
    isRenewFee: false,
    isDrawWhenSellout: false,
    isDrawIfNotPay: false,
  };

  const [schedule, setSchedule] = useState(singleNftInfo.schedule);

  useEffect(() => {
    getTokenInfo();
  }, []);

  const handleCheckedChange = (event, key) => {
    console.log(schedule, schedule[key]);
    const tempSchedule = { ...schedule };
    tempSchedule[key] = event.target.checked;
    setSchedule(tempSchedule);

    console.log("*********************", key, tempSchedule, schedule);
  };

  const handleChange = (event, nextView) => {
    console.log("TicketCreate:handleChange", nextView);
    setTokenSelId(nextView);

    if (nextView == null) {
      setTokenSelId(-1);
      setTokenIconUrl(tokenInfos[0].icon);
    } else
      setTokenIconUrl(
        tokenInfos.find((item, index) => item.token_id == nextView).icon
      );
  };

  const getTokenInfo = async () => {
    const tokens = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens?account.id=${accountIds[0]}`
    );

    let updateTokens = [];
    updateTokens.push({ token_id: "-1", symbol: "HBAR" });
    if (tokens?.data.tokens) {
      tokens.data.tokens.map((item, index) => {
        if (item.type == "FUNGIBLE_COMMON")
          updateTokens.push({ token_id: item.token_id, symbol: item.symbol });
      });
    }

    updateTokens.map((item, index) => {
      const findPriceItem = global.getTokenPriceInfo(
        item.token_id,
        tokenPrices
      );
      if (findPriceItem != null) {
        item["icon"] = findPriceItem.icon;
        item["price"] = findPriceItem.price;
        item["priceUsd"] = findPriceItem.priceUsd;
      }
    });

    console.log("TicketCreate:updateTokens", updateTokens);
    setTokenInfos(updateTokens);
    updateTokens[0].icon && setTokenIconUrl(updateTokens[0].icon);
  };

  return (
    <div
      className="single-nft-wrapper"
      style={{ margin: `5px ${nftCardMargin}px` }}
    >
      <video className="nft-image" alt="..." src={singleNftInfo.imgUrl}></video>
      <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>
      <div className="nft-circle-logo"></div>
      <div className="nft-name-verify">
        <p>{`${singleNftInfo.creator} | ${singleNftInfo.name} #${singleNftInfo.serialNum}`}</p>
      </div>
      {singleNftInfo.verified && <VerifiedIcon className="verify-icon" />}

      {!singleNftInfo.ticketCreated && (
        <div className="ticket-create">
          <Input
            type="number"
            value={priceValue}
            onChange={(e) => {
              setPriceValue(e.target.value);
            }}
            placeholder="ticket price"
          />
          <Input
            type="number"
            value={timeValue}
            onChange={(e) => {
              setTimeValue(e.target.value);
            }}
            placeholder="time (hours)"
          />
          <Input
            type="number"
            value={ticketsValue}
            onChange={(e) => {
              setTicketsValue(e.target.value);
            }}
            placeholder="ticket supply"
          />
        </div>
      )}
      {singleNftInfo.ticketCreated && (
        <div className="ticket-created">
          <p>{`Price: ${priceValue} ℏ`}</p>
          <p>{`Time: ${timeValue} hrs`}</p>
          <p>{`Tickets: ${ticketsValue} tickets`}</p>
          <p className="status-label">Ticket Created!</p>
        </div>
      )}

      <div className="entry-buy-wrapper">
        <Button
          href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
        >
          <InfoIcon />
        </Button>
        <div className="selected-token">
          <p>TOKEN:</p>
          <Checkbox onClick={() => setTokenDialog(true)} checked></Checkbox>
        </div>
        <Button
          onClick={() =>
            onClickCreateTicket(
              singleNftInfo.tokenId,
              singleNftInfo.serialNum,
              priceValue,
              tokenSelId,
              timeValue,
              ticketsValue,
              singleNftInfo.fallback,
              singleNftInfo.creator,
              singleNftInfo.name,
              singleNftInfo.imgUrl,
              singleNftInfo.floorPrice,
              schedule
            )
          }
        >
          create
        </Button>
      </div>
      <Dialog open={tokenDialog} onClose={() => setTokenDialog(false)}>
        <div class="raffle-schedule-dialog">
          <div className="dialog-title">
            <p>WEEKLY TICKET</p>
          </div>
          {Object.keys(env.scheduleData).map((item, index) => {
            return (
              <div class="raffle-schedule-div">
                <Checkbox
                  inputProps={{ "aria-label": "Checkbox demo" }}
                  checked = {schedule[item]}
                  onChange={(e) => handleCheckedChange(e, item)}
                />
                <p>{env.scheduleData[item]} </p>
              </div>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
};

export default TicketCreate;
