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
  const [minDialog, setMinDialog] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tokenSelId, setTokenSelId] = useState("-1");

  const initSchedule = {
    isWeeklyFee: false,
    isRenewFee: false,
    isDrawWhenSellout: false,
    isDrawIfNotPay: false,
  };

  const checkedSchedule = {
    isWeeklyFee: false,
    isRenewFee: true,
    isDrawWhenSellout: false,
    isDrawIfNotPay: false,
  };

  const [schedule, setSchedule] = useState(initSchedule);
  const [adminInfo, setAdminInfo] = useState([]);
  useEffect(() => {
    if (accountIds) {
      getTokenInfo();
    }
  }, [accountIds]);

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

  const getAdminInfo = async () => {
    const tokenInfos = await global.getInfoResponse(
      env.SERVER_URL + env.GET_ADMIN_INFO_PREFIX + "?type=hts"
    );

    let temp = [];
    if (tokenInfos?.data.result) {
      tokenInfos?.data.data.map((item, index) => {
        temp.push(item.tokenId);
      });
      console.log("getAdminInfo", temp);
      return temp;
    }
  };

  const getTokenInfo = async () => {
    let updateTokens = [];
    let adminInfos = await getAdminInfo();
    updateTokens.push({ token_id: "-1" });
    adminInfos.map((item, index) => {
      updateTokens.push({ token_id: item });
    });

    updateTokens.map((item, index) => {
      const findPriceItem = global.getTokenPriceInfo(
        item.token_id,
        tokenPrices
      );

      if (findPriceItem != null) {
        item["icon"] = findPriceItem.icon;
        item["price"] = findPriceItem.price;
        item["priceUsd"] = findPriceItem.priceUsd;
        if (item["token_id"] == -1) item["symbol"] = " HBAR";
        else item["symbol"] = findPriceItem.symbol;
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
          <p className="status-label">Raffle Created!</p>
        </div>
      )}

      <div className="entry-buy-wrapper ticket-create">
        <div className="select-token-div">
          <p>TOKEN:</p>
          <img src={tokenIconUrl} onClick={() => setTokenDialog(true)}></img>
        </div>

        <div className="minium-ticket-div">
          <p>MINIUM TICKET SALES:</p>
          <Checkbox
            onClick={() => {
              setChecked(!checked);
              if (checked) {
                setSchedule(initSchedule);
              } else {
                setSchedule(checkedSchedule);
                setMinDialog(true);
              }
            }}
            tokenDialog
          ></Checkbox>
        </div>
        <div className="button-div">
          <Button
            href={`https://zuse.market/collection/${singleNftInfo.tokenId}`}
          >
            <InfoIcon />
          </Button>

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
      </div>
      <Dialog open={tokenDialog} onClose={() => setTokenDialog(false)}>
        <div class="token-select-dialog">
          <ToggleButtonGroup
            orientation="vertical"
            value={tokenSelId}
            exclusive
            onChange={handleChange}
          >
            {tokenInfos.map((item, index) => {
              return (
                <ToggleButton value={item.token_id} aria-label="list">
                  <img src={item.icon}></img>
                  {item.symbol}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </div>
      </Dialog>
      <Dialog open={minDialog} onClose={() => setMinDialog(false)}>
        <div class="raffle-schedule-dialog">
          <div className="dialog-title">
            <p>MINIUM TICKET SALE</p>
          </div>
          <div class="raffle-schedule-div">
            <p>
              "Minimum Ticket Sales" is the lowest number of tickets that need
              to be sold for the raffle drawing to take place. There's a fee
              after the first free week of hosting.
            </p>
          </div>
          <div class="raffle-schedule-div">
            <p>If you choose this option:</p>
            {Object.keys(env.scheduleData).map((item, index) => {
              return <p>{env.scheduleData[item]} </p>;
            })}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TicketCreate;
