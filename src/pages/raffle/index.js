/*global chrome*/
import React, { useState, useEffect, useCallback } from "react";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Button } from "reactstrap";

import AddIcon from "@mui/icons-material/Add";
import Backdrop from "@mui/material/Backdrop";
import RefreshIcon from "@mui/icons-material/Refresh";
import Badge from "@mui/material/Badge";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { styled, alpha, useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import Dialog from "@mui/material/Dialog";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.scss";
import TicketCreate from "components/Raffle/TicketCreate";
import SingleTicket from "components/Raffle/SingleTicket";
import SoldTicket from "components/Raffle/soldTicket";
import WinsTicket from "components/Raffle/winsTicket";
import PenguDialog from "components/PenguDialog";
import BuyTicketDialog from "components/Raffle/BuyTicketDialog";
import HighLights from "components/HighLights";
import { useHashConnect } from "../../assets/api/HashConnectAPIProvider.tsx";
import * as global from "../../global";
import * as env from "../../env";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateTicketFlag } from "../../store/socketslice";
import { useParams } from "react-router-dom";

const MAX_WRAPPER_WIDTH = 1245;
const WALLET_NFT_CARD_WIDTH = 348;
const DB_NFT_CARD_WIDTH = 240;
const SOLD_NFT_CARD_WIDTH = 240;
const FROM_WALLET = "WALLET";
const FROM_ACTIVE = "ACTIVE";
const FROM_PREVIOUS = "PREVIOUS";
const FROM_WINS = "CLAIM";
const dispFromTypes = [FROM_ACTIVE, FROM_WALLET, FROM_PREVIOUS, FROM_WINS];
const MAX_NFT_PER_PAGE = 25;

let ws = null;

function Raffle() {
  const dispatch = useDispatch();
  const { param_raffle_id } = useParams();
  const [open, setOpen] = React.useState(true);
  const [hidden, setHidden] = React.useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [walletNftCardMargin, setWalletNftCardMargin] = useState(
    parseInt(
      window.innerWidth - 35 > MAX_WRAPPER_WIDTH
        ? (MAX_WRAPPER_WIDTH % WALLET_NFT_CARD_WIDTH) /
            parseInt(MAX_WRAPPER_WIDTH / WALLET_NFT_CARD_WIDTH) /
            2
        : ((window.innerWidth - 35) % WALLET_NFT_CARD_WIDTH) /
            parseInt((window.innerWidth - 35) / WALLET_NFT_CARD_WIDTH) /
            2
    )
  );
  const [dbNftCardMargin, setDbNftCardMargin] = useState(
    parseInt(
      window.innerWidth - 35 > MAX_WRAPPER_WIDTH
        ? (MAX_WRAPPER_WIDTH % DB_NFT_CARD_WIDTH) /
            parseInt(MAX_WRAPPER_WIDTH / DB_NFT_CARD_WIDTH) /
            2
        : ((window.innerWidth - 35) % DB_NFT_CARD_WIDTH) /
            parseInt((window.innerWidth - 35) / DB_NFT_CARD_WIDTH) /
            2
    )
  );
  const [soldNftCardMargin, setSoldNftCardMargin] = useState(
    parseInt(
      window.innerWidth - 35 > MAX_WRAPPER_WIDTH
        ? (MAX_WRAPPER_WIDTH % SOLD_NFT_CARD_WIDTH) /
            parseInt(MAX_WRAPPER_WIDTH / SOLD_NFT_CARD_WIDTH) /
            2
        : ((window.innerWidth - 35) % SOLD_NFT_CARD_WIDTH) /
            parseInt((window.innerWidth - 35) / SOLD_NFT_CARD_WIDTH) /
            2
    )
  );

  // dialog control
  const [penguDialogViewFlag, setPenguDialogViewFlag] = useState(false);
  const [penguDialogTitleStr, setPenguDialogTitleStr] = useState("");
  const [penguDialogContentStr, setPenguDialogContentStr] = useState("");
  const [penguDialogAgreeBtnStr, setPenguDialogAgreeBtnStr] = useState("");
  const [penguDialogType, setPenguDialogType] = useState("");

  // display wallet NFT or database NFT
  const [dispFromValue, setDispFromValue] = useState(dispFromTypes[0]);
  const [dispTabValue, setDispTabValue] = useState(0);

  const [buyTicketDialogViewFlag, setBuyTicketDialogViewFlag] = useState(false);
  // create Ticket
  const [currentCreateTicketPostData, setCurrentCreateTicketPostData] =
    useState({});

  // buy Ticket
  const [currentBuyTicketData, setCurrentBuyTicketData] = useState({});

  // get wallet info
  const {
    walletData,
    sendHbarAndNftToTreasury,
    sendTokenToTreasury,
    sendHbarToTreasury,
    receiveNft,
    associateToken,
  } = useHashConnect(); // connect with hashpack wallet
  const { accountIds } = walletData; // get wallet data

  const [scheduleInfo, setScheduleInfo] = useState([]);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  // get NFT from wallet
  const [nextLinkOfGetWalletNft, setNextLinkOfGetWalletNft] = useState(null);
  const [walletNftInfo, setWalletNftInfo] = useState([]);

  // get NFT from DB
  const [dbNftInfo, setDbNftInfo] = useState([]);
  // get history from DB
  const [soldNftInfo, setSoldNftInfo] = useState([]);

  // get wins from DB
  const [winsNftInfo, setWinsNftInfo] = useState([]);
  const [winsNtfCount, setWinsNtfCount] = useState(0);

  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loadingView, setLoadingView] = useState(false);

  const [winnerCount, setClaimCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const [nftSortMode, setNftSortMode] = useState("");
  const [nftSortType, setNftSortType] = useState("");

  const [addRaffleFlag, setAddRaffleFlag] = useState(false);
  const [adminInfo, setAdminInfo] = useState([]);

  const init = () => {
    setPenguDialogViewFlag(false);
    setCurrentCreateTicketPostData({});
    setNextLinkOfGetWalletNft(null);
    setDbNftInfo([]);
    setWalletNftInfo([]);
    setSoldNftInfo([]);
    setWinsNftInfo([]);
    setLoadingView(false);
    setRefreshFlag(!refreshFlag);
    setNftSortMode("ascending");
    setNftSortType("timeRemain");
  };

  useEffect(() => {
    if (accountIds?.length > 0) getWinsHistoryCount();
  }, [loadingView]);

  useEffect(() => {
    if (param_raffle_id) setHidden("hidden");
    console.log("&&&&&&&&&&&&&&&&&&&&", param_raffle_id);
  }, [param_raffle_id]);

  useEffect(() => {
    function handleResize() {
      const _tempWindowWidth = window.innerWidth;
      setWindowWidth(_tempWindowWidth);
      setWalletNftCardMargin(
        parseInt(
          _tempWindowWidth - 35 > MAX_WRAPPER_WIDTH
            ? (MAX_WRAPPER_WIDTH % WALLET_NFT_CARD_WIDTH) /
                parseInt(MAX_WRAPPER_WIDTH / WALLET_NFT_CARD_WIDTH) /
                2
            : ((_tempWindowWidth - 35) % WALLET_NFT_CARD_WIDTH) /
                parseInt((_tempWindowWidth - 35) / WALLET_NFT_CARD_WIDTH) /
                2
        )
      );
      setDbNftCardMargin(
        parseInt(
          _tempWindowWidth - 35 > MAX_WRAPPER_WIDTH
            ? (MAX_WRAPPER_WIDTH % DB_NFT_CARD_WIDTH) /
                parseInt(MAX_WRAPPER_WIDTH / DB_NFT_CARD_WIDTH) /
                2
            : ((_tempWindowWidth - 35) % DB_NFT_CARD_WIDTH) /
                parseInt((_tempWindowWidth - 35) / DB_NFT_CARD_WIDTH) /
                2
        )
      );
      setSoldNftCardMargin(
        parseInt(
          _tempWindowWidth - 35 > MAX_WRAPPER_WIDTH
            ? (MAX_WRAPPER_WIDTH % SOLD_NFT_CARD_WIDTH) /
                parseInt(MAX_WRAPPER_WIDTH / SOLD_NFT_CARD_WIDTH) /
                2
            : ((_tempWindowWidth - 35) % SOLD_NFT_CARD_WIDTH) /
                parseInt((_tempWindowWidth - 35) / SOLD_NFT_CARD_WIDTH) /
                2
        )
      );
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  useEffect(() => {
    if (accountIds?.length > 0) {
      getScheduleInfo();
      //autoAssociate(accountIds);

      ws = new WebSocket(env.SOCKET_URL);
      ws.onopen = () => {
        console.log(">>>>>>>>>>>>>>>>>>RaffleWebSocket Opened");
        const message = { message: "open" };
        ws.send(JSON.stringify(message));
      };

      ws.onmessage = async (e) => {
        const receiveData = JSON.parse(e.data);
        console.log(
          ">>>>>>>>>>>>>>>>>>RaffleWebSocket Message:",
          receiveData.message,
          receiveData.accountId
        );
        switch (receiveData.message) {
          case "connect":
            break;
          case "init":
            console.log(">>>>>>>>>>>>>>>>>RaffleWebSocket init", receiveData);
            getWinsHistoryCount();
            break;
          case "add_raffle":
            console.log(
              ">>>>>>>>>>>>>>>>>RaffleWebSocket add_raffle",
              receiveData
            );
            getWinsHistoryCount();
            setAddRaffleFlag(!addRaffleFlag);
            break;
          case "update_raffle":
            console.log(
              ">>>>>>>>>>>>>>>>>RaffleWebSocket update_raffle",
              receiveData
            );
            getWinsHistoryCount();
            break;
          case "buy_ticket":
            console.log(
              ">>>>>>>>>>>>>>>>>RaffleWebSocket buy_ticket",
              receiveData
            );
            dispatch(updateTicketFlag());
            break;
        }
      };

      if (dispFromValue === FROM_WALLET) getWalletNftData(null, accountIds[0]);
      else if (dispFromValue === FROM_ACTIVE)
        getDbNftData(0, [], "ascending", "timeRemain");
      else if (dispFromValue === FROM_WINS) getWinsHistory(0, []);

      return () => {
        // clearInterval(interval);
        if (ws) {
          ws.onclose = () => {
            console.log("WebSocket Disconnected");
          };
        }
      };
    } else {
      setWinsNftInfo([]);
      setWalletNftInfo([]);
      setNextLinkOfGetWalletNft(null);
      setRefreshFlag(!refreshFlag);
    }
  }, [accountIds]);

  useEffect(() => {
    //await sleep(1000 * 3);
    getDbNftData(0, [], "ascending", "timeRemain");
  }, []);

  const associateUpdateCheck = async (accountId, tokenId) => {
    console.log("autoAssociate log - 1 : ", accountId, tokenId);
    try {
      const associateInfo = await global.getRequest(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${accountId}/tokens?token.id=${tokenId}`
      );
      console.log("autoAssociate log - 2 : ", associateInfo);

      // already associated
      if (associateInfo.tokens?.length > 0)
        return { result: true, associated: true };

      return { result: true, associated: false };
    } catch (error) {
      return { result: false, error: error.message };
    }
  };

  const autoAssociate = async (tokenId) => {
    try {
      const associateState = await associateUpdateCheck(accountIds[0], tokenId);
      if (!associateState.result) {
        console.log("Something wrong with Mirror Network.");
        return;
      }
      if (associateState.associated) {
        console.log("Already associated.");
        return;
      }
      const associateResult = await associateToken(tokenId);
      if (associateResult) {
        console.log("Associate successful.");
        return;
      }
      console.log("Associate failed.");
    } catch (e) {
      console.log("Associate exception.", e);
    }
  };

  const onChangeDispValue = (newValue_) => {
    console.log(">>>>>>>>>>>>onChangeDispValue", newValue_);
    if (newValue_ == 4) {
      // Direct
      window.location.href = "/";
      return;
    }

    if (newValue_ == 5) {
      // Direct
      handleDrawerClose();
      return;
    }

    if (dispFromTypes[newValue_] !== dispFromValue) {
      setDispFromValue(dispFromTypes[newValue_]);
      setDispTabValue(newValue_);
      init();

      if (dispFromTypes[newValue_] === FROM_ACTIVE) {
        getDbNftData(0, [], "ascending", "timeRemain");
      } else if (
        dispFromTypes[newValue_] === FROM_WALLET &&
        accountIds.length > 0
      ) {
        getWalletNftData(null, accountIds[0]);
      } else if (dispFromTypes[newValue_] === FROM_PREVIOUS) {
        getRaffleHistory(0, []);
      } else if (dispFromTypes[newValue_] === FROM_WINS) {
        getWinsHistory(0, []);
      }
    }
  };

  const closeScheduleDialog = () => {
    setScheduleDialog(false);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const onClickRefreshData = () => {
    init();

    if (dispFromValue === FROM_ACTIVE) {
      getDbNftData(0, [], "ascending", "timeRemain");
    } else if (dispFromValue === FROM_WALLET && accountIds.length > 0) {
      getWalletNftData(null, accountIds[0]);
    } else if (dispFromValue === FROM_PREVIOUS) {
      getRaffleHistory(0, []);
    } else if (dispFromValue === FROM_WINS) {
      getWinsHistory(0, []);
    }
  };

  const displayPenguDialog = (title_, contentStr_, btnStr_, dlgType_) => {
    setPenguDialogTitleStr(title_);
    setPenguDialogContentStr(contentStr_);
    setPenguDialogAgreeBtnStr(btnStr_);
    setPenguDialogType(dlgType_);
    setPenguDialogViewFlag(true);
  };

  const penguDialogClose = () => {
    setLoadingView(false);
    setPenguDialogViewFlag(false);
  };

  const onClickPenguDialogAgreeBtn = (dlgType_) => {
    setPenguDialogViewFlag(false);
    if (dlgType_ === "create-tickets") {
      createTicket(currentCreateTicketPostData);
    }
    if (dlgType_ === "buy-ticket") {
      setBuyTicketDialogViewFlag(true);
    }
  };
  const buyTicketDialogClose = () => {
    setBuyTicketDialogViewFlag(false);
  };

  const onClickBuyTicketDialogAgreeBtn = (ticketCount_) => {
    // console.log("onClickBuyTicketDialogAgreeBtn log - 1 ", ticketCount_);
    setBuyTicketDialogViewFlag(false);
    buyTicket(currentBuyTicketData, ticketCount_);
  };

  //=============================================================================================
  // get scroll touch bottm event
  const handleContainerOnBottom = useCallback(() => {
    console.log("handleContainerOnBottom log - 1 : " + dispFromValue);
    if (dispFromValue === FROM_PREVIOUS) {
      // console.log('handleContainerOnBottom log - 2 : ', soldNftInfo.length, soldNftInfo);
      getRaffleHistory(soldNftInfo.length, soldNftInfo);
    } else if (dispFromValue === FROM_ACTIVE) {
      // console.log('handleContainerOnBottom log - 3 : ', dbNftInfo.length, dbNftInfo);
      getDbNftData(dbNftInfo.length, dbNftInfo, nftSortMode, nftSortType);
    } else if (dispFromValue == FROM_WINS) {
      getWinsHistory(winsNftInfo.length, winsNftInfo);
    }
  }, [soldNftInfo, dbNftInfo, winsNftInfo, dispFromValue]);

  const containerRef = useBottomScrollListener(handleContainerOnBottom);

  //=============================================================================================
  const getWinsHistoryCount = async () => {
    const _getWinsHistoryResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_WINS_HISTORY_COUNT +
        `?accountId=${accountIds[0]}`
    );
    console.log(_getWinsHistoryResult);
    setClaimCount(_getWinsHistoryResult.data.totalCount);
    return _getWinsHistoryResult.data.totalCount;
  };

  const getWinsHistory = async (skipCount_, prevInfo_, winsAct_ = true) => {
    winsAct_ && setLoadingView(true);

    if (!accountIds) {
      setLoadingView(false);
      return;
    }

    let _newWinsNftInfo = prevInfo_;
    // console.log("getWinsHistory log - 1 : ", MAX_NFT_PER_PAGE, skipCount_);
    const _getWinsHistoryResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_WINS_HISTORY_PREFIX +
        `?accountId=${accountIds[0]}&limitCount=${MAX_NFT_PER_PAGE}&skipCount=${skipCount_}`
    );
    // console.log("getWinsHistory log - 2 : ", _getWinsHistoryResult);
    console.log("getWinsHistory", winsAct_);
    if (_getWinsHistoryResult && _getWinsHistoryResult.data.result) {
      const _winsHistory = _getWinsHistoryResult.data.data;

      if (!winsAct_) {
        return true;
      }

      for (let i = 0; i < _winsHistory.length; i++) {
        const filter = {
          tokenId: _winsHistory[i].tokenId,
          serialNum: _winsHistory[i].serialNum,
        };
        const _findResult = _newWinsNftInfo.filter(function (item) {
          for (var key in filter) {
            if (item[key] === undefined || item[key] != filter[key])
              return false;
          }
          return true;
        });

        if (!_findResult || _findResult.length <= 0) {
          const _startDateList = _winsHistory[i].startDate.split("T");
          const _endDataList = _winsHistory[i].createdAt.split("T");

          const nftHotInfo = await global.getAdminInfo(
            `?tokenId=${_winsHistory[i].tokenId}&type=hot`
          );

          _newWinsNftInfo.push({
            tokenId: _winsHistory[i].tokenId,
            serialNum: _winsHistory[i].serialNum,
            name: _winsHistory[i].name,
            imgUrl: _winsHistory[i].imgUrl,
            creator: _winsHistory[i].creator,
            raffleCreator: _winsHistory[i].accountId,
            winner: _winsHistory[i].winnerId,
            participants: _winsHistory[i].participants,
            ticketsCount: _winsHistory[i].ticketsCount,
            soldCount: _winsHistory[i].soldCount,
            startDate: _startDateList[0],
            endDate: _endDataList[0],
            price: _winsHistory[i].price,
            tokenSelId: _winsHistory[i].tokenSelId,
            nftSendProcess: _winsHistory[i].nftSendProcess,
            nftHotInfo: nftHotInfo,
          });
        }
      }
      // console.log("getWinsHistory log - 4 : ", _newWinsNftInfo);
      setWinsNftInfo(_newWinsNftInfo);
      setRefreshFlag(!refreshFlag);
    }

    setLoadingView(false);
  };

  const getRaffleHistory = async (skipCount_, prevInfo_, searchInfo_) => {
    console.log("getRaffleHistory");
    setLoadingView(true);
    let _newSoldNftInfo = prevInfo_;
    let _searchSuffix = searchInfo_ ? `&searchInfo=${searchInfo_}` : "";
    if (!searchInfo_) setSearchValue("");

    // console.log("getRaffleHistory log - 1 : ", MAX_NFT_PER_PAGE, skipCount_);
    const _getRaffleHistoryResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_RAFFLE_HISTORY_PREFIX +
        `?limitCount=${MAX_NFT_PER_PAGE}&skipCount=${skipCount_}${_searchSuffix}`
    );
    // const _getRaffleHistoryResult = await global.getInfoResponse(env.SERVER_URL + env.GET_RAFFLE_HISTORY_PREFIX);
    // console.log("getRaffleHistory log - 2 : ", _getRaffleHistoryResult);
    if (_getRaffleHistoryResult && _getRaffleHistoryResult.data.result) {
      const _raffleHistory = _getRaffleHistoryResult.data.data;
      for (let i = 0; i < _raffleHistory.length; i++) {
        // console.log("getRaffleHistory log - 3 : ", _newSoldNftInfo);
        // console.log("getRaffleHistory log - 4 : ", _raffleHistory[i].tokenId, _raffleHistory[i].serialNum);

        const filter = {
          tokenId: _raffleHistory[i].tokenId,
          serialNum: _raffleHistory[i].serialNum,
          startDate: _raffleHistory[i].startDate,
        };
        const _findResult = _newSoldNftInfo.filter(function (item) {
          for (var key in filter) {
            if (item[key] === undefined || item[key] !== filter[key])
              return false;
          }
          return true;
        });

        // console.log("getRaffleHistory log - 5 : ", _findResult);

        if (!_findResult || _findResult.length <= 0) {
          // const _singleNftInfo = await updateUnInitalizedNftInfo(_raffleHistory[i].tokenId, _raffleHistory[i].serialNum);
          const _singleNftInfo = _raffleHistory[i];
          const _startDateList = _raffleHistory[i].startDate.split("T");
          const _endDataList = _raffleHistory[i].createdAt.split("T");

          const nftHotInfo = await global.getAdminInfo(
            `?tokenId=${_singleNftInfo.tokenId}&type=hot`
          );

          _newSoldNftInfo.push({
            tokenId: _singleNftInfo.tokenId,
            serialNum: _singleNftInfo.serialNum,
            name: _singleNftInfo.name,
            imgUrl: _singleNftInfo.imgUrl,
            creator: _singleNftInfo.creator,
            schedule: _singleNftInfo.schedule,
            raffleCreator: _raffleHistory[i].accountId,
            winner: _raffleHistory[i].winnerId,
            participants: _raffleHistory[i].participants,
            ticketsCount: _raffleHistory[i].ticketsCount,
            soldCount: _raffleHistory[i].soldCount,
            startDate: _startDateList[0],
            endDate: _endDataList[0],
            price: _raffleHistory[i].price,
            nftHotInfo: nftHotInfo,
          });
        }
      }
      // console.log("getRaffleHistory log - 3 : ", _newSoldNftInfo);
      setSoldNftInfo(_newSoldNftInfo);
      setRefreshFlag(!refreshFlag);
    } else setSoldNftInfo([]);

    setLoadingView(false);
  };

  const getScheduleInfo = async () => {
    if (!accountIds) return;
    setLoadingView(true);

    let _searchSuffix = "";

    if (param_raffle_id)
      _searchSuffix = _searchSuffix + "&_id=" + param_raffle_id;

    const ticketInfo = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_ALL_PREFIX +
        `?accountId=${accountIds[0]}${_searchSuffix}`
    );

    if (ticketInfo.data.result && ticketInfo.data.data.length) {
      const findInfo = ticketInfo.data.data.filter((item, index) => {
        item.schedule && (item.schedule = JSON.parse(item.schedule));

        let timeRemain =
          parseInt(item.timeLimit * 3600 * 1000 + item.createdTime) -
          Date.now();

        let timeLeft = parseInt(timeRemain / 3600 / 1000);
        if (timeLeft <= 0) {
          timeLeft = (parseInt(timeRemain / 60 / 1000) % 60) + 10000;
        }

        item.timeLeft = timeLeft;
        console.log("************", item);
        if (
          (item.timeLimit <= 68 && item.schedule.isWeeklyFee) ||
          item.schedule.isRenewFee
        )
          return timeLeft < env.MS_WEEK_TIME / 2;
      });

      console.log("getScheduleInfo***********", findInfo);
      setScheduleDialog(findInfo.length);
      setScheduleInfo(findInfo);
    }

    setLoadingView(false);
  };

  const getDbNftData = async (
    skipCount_,
    prevInfo_,
    sortMode_,
    sortType_,
    searchInfo_
  ) => {
    setLoadingView(true);
    let _newDbNftInfo = prevInfo_;
    let _searchSuffix = searchInfo_ ? `&searchInfo=${searchInfo_}` : "";
    if (!searchInfo_) setSearchValue("");

    if (param_raffle_id)
      _searchSuffix = _searchSuffix + "&_id=" + param_raffle_id;

    const _getTicketsInfoResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_PENDING_RAFFLE_PREFIX +
        `?limitCount=${MAX_NFT_PER_PAGE}&skipCount=${skipCount_}&sortMode=${sortMode_}&sortType=${sortType_}${_searchSuffix}`
    );
    // const _getTicketsInfoResult = await global.getInfoResponse(env.SERVER_URL + env.GET_ALL_PREFIX);
    console.log("getDbNftData log - 2 : ", _getTicketsInfoResult);
    if (_getTicketsInfoResult.data.result) {
      const _ticketsInfo = _getTicketsInfoResult.data.data;
      for (let i = 0; i < _ticketsInfo.length; i++) {
        const filter = {
          tokenId: _ticketsInfo[i].tokenId,
          serialNum: _ticketsInfo[i].serialNum,
        };
        const _findResult = _newDbNftInfo.filter(function (item) {
          for (var key in filter) {
            if (item[key] === undefined || item[key] !== filter[key])
              return false;
          }
          return true;
        });

        // console.log("getRaffleHistory log - 5 : ", _findResult);

        if (!_findResult || _findResult.length <= 0) {
          //const _singleNftInfo = await getNftInfo(_ticketsInfo[i].tokenId, _ticketsInfo[i].serialNum);
          const _singleNftInfo = _ticketsInfo[i];
          let _myEntryCount = 0;

          if (accountIds && accountIds.length > 0) {
            const _getEntryCountPostData = {
              accountId: accountIds[0],
              tokenId: _singleNftInfo.tokenId,
              serialNum: _singleNftInfo.serialNum,
            };
            const _getEntryCountPostResult = await global.postInfoResponse(
              env.SERVER_URL + env.GET_ENTRY_COUNT_PREFIX,
              _getEntryCountPostData
            );
            if (
              _getEntryCountPostResult &&
              _getEntryCountPostResult.data.result
            )
              _myEntryCount = _getEntryCountPostResult.data.data;
            // console.log("getDbNftData log - 5 : ", _myEntryCount);
          }

          let timeRemain =
            parseInt(
              _ticketsInfo[i].timeLimit * 3600 * 1000 +
                _ticketsInfo[i].createdTime
            ) - Date.now();

          let _timeLeft = parseInt(timeRemain / 3600 / 1000);
          if (_timeLeft <= 0) {
            _timeLeft = (parseInt(timeRemain / 60 / 1000) % 60) + 10000;
          }

          const _findResult = _newDbNftInfo.find(
            (WNinfo) =>
              WNinfo.tokenId === _singleNftInfo.tokenId &&
              WNinfo.serialNum === _singleNftInfo.serialNum
          );

          if (!_findResult) {
            const raffleLink =
              "http://95.217.98.125:3000/raffle/" + _singleNftInfo._id;

            const nftHotInfo = await global.getAdminInfo(
              `?tokenId=${_singleNftInfo.tokenId}&type=hot`
            );
            const nftRaffleInfo = await global.getAdminInfo(
              `?tokenId=${raffleLink}&type=discount`
            );
            _newDbNftInfo.push({
              raffleLink: raffleLink,
              accountId: _singleNftInfo.accountId,
              tokenId: _singleNftInfo.tokenId,
              serialNum: _singleNftInfo.serialNum,
              creator: _singleNftInfo.creator,
              name: _singleNftInfo.name,
              imgUrl: _singleNftInfo.imgUrl,
              ticketCreated: true,
              price: _ticketsInfo[i].price,
              tokenSelId: _ticketsInfo[i].tokenSelId,
              floorPrice: _singleNftInfo.floorPrice,
              totalCount: _ticketsInfo[i].totalCount,
              soldCount: _ticketsInfo[i].soldCount,
              timeLimit: _ticketsInfo[i].timeLimit,
              createdTime: _ticketsInfo[i].createdTime,
              timeLeft: _timeLeft,
              myEntry: _myEntryCount,
              verified: false,
              nftHotInfo: nftHotInfo,
              nftRaffleInfo: nftRaffleInfo,
            });
          }
        }
      }

      console.log(">>>>>>>>DBNft Info:", _newDbNftInfo);
      setDbNftInfo(_newDbNftInfo);
      setRefreshFlag(!refreshFlag);
    } else setDbNftInfo(_newDbNftInfo);
    setLoadingView(false);
  };

  const getWalletNftData = async (nextLink_, accountId_, searchInfo_) => {
    if (!accountIds) return;
    setLoadingView(true);

    let _searchSuffix = searchInfo_ ? `&searchInfo=${searchInfo_}` : "";
    if (!searchInfo_) setSearchValue("");

    let _urlStr;
    if (nextLink_) _urlStr = env.MIRROR_NET_URL + nextLink_;
    else
      _urlStr =
        env.MIRROR_NET_URL + env.GET_ACCOUNT_PREFIX + accountId_ + "/nfts";

    let _newWalletNftInfo = walletNftInfo;

    const _WNinfo = await global.getInfoResponse(_urlStr);

    if (_WNinfo && _WNinfo.data.nfts.length > 0) {
      // console.log("getWalletNftData log - 1 : ", _WNinfo.data);
      if (_WNinfo.data.links)
        setNextLinkOfGetWalletNft(_WNinfo.data.links.next);

      for (let i = 0; i < _WNinfo.data.nfts.length; i++) {
        const filter = {
          tokenId: _WNinfo.data.nfts[i].token_id,
          serialNum: _WNinfo.data.nfts[i].serial_number,
        };
        const _findResult = _newWalletNftInfo.filter(function (item) {
          for (var key in filter) {
            if (item[key] === undefined || item[key] !== filter[key])
              return false;
          }
          return true;
        });

        if (!_findResult || _findResult.length <= 0) {
          let _preMdUrl = base64ToUtf8(_WNinfo.data.nfts[i].metadata).split(
            "//"
          );
          // let _metadataUrl = env.IPFS_URL + _preMdUrl[1];
          let _metadataUrl =
            "https://hashpack.b-cdn.net/ipfs/" +
            _preMdUrl[_preMdUrl.length - 1];
          console.log("getWalletNftData log - 2 : ", _preMdUrl);
          let _metadata = await global.getInfoResponse(_metadataUrl);
          // console.log("getWalletNftData log - 2 : ", _metadata);

          if (_metadata) {
            let _preImgUrl = _metadata.data.image.split("//");
            const _imgUrl = env.IPFS_URL + _preImgUrl[1];
            const _tokenId = _WNinfo.data.nfts[i].token_id;
            const _serialNum = _WNinfo.data.nfts[i].serial_number;
            const _creator = _metadata.data.creator;
            const _name = _metadata.data.name;

            console.log("Raffle:searchInfo", searchInfo_);

            let _fallback = 0;

            const _getNftFee = await global.getInfoResponse(
              `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${_tokenId}`
            );
            // console.log("getNftInfo log - 1 : ", _getNftFee);
            if (
              _getNftFee.data?.custom_fees?.royalty_fees?.length > 0 &&
              _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee
            ) {
              _fallback =
                _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee
                  .amount / 100000000;
            }

            const _tokenZuseInfo = await global.getInfoResponse(
              `${env.SERVER_URL}/swap/get_collection_zuse_info?tokenId=${_tokenId}`
            );

            let _floorPrice = 0;
            if (
              _tokenZuseInfo &&
              _tokenZuseInfo.data.result &&
              _tokenZuseInfo.data.data &&
              _tokenZuseInfo.data.data.collectionStats &&
              _tokenZuseInfo.data.data.collectionStats.floor
            ) {
              _floorPrice += _tokenZuseInfo.data.data.collectionStats.floor;
              console.log("getNftInfo log - 1 : ", _floorPrice);
            }

            const nftHotInfo = await global.getAdminInfo(
              `?tokenId=${_tokenId.tokenId}&type=hot`
            );

            _newWalletNftInfo.push({
              tokenId: _tokenId,
              serialNum: _serialNum,
              creator: _creator,
              name: _name,
              imgUrl: _imgUrl,
              floorPrice: _floorPrice,
              fallback: _fallback,
              ticketCreated: false,
              verified: false,
              nftHotInfo: nftHotInfo,
            });
          }
        }
      }

      console.log("getWalletNftData log - 4 : ", _newWalletNftInfo);
      let searchINfo = _newWalletNftInfo.filter((item, index) => {
        if (
          searchInfo_ &&
          item.creator.indexOf(searchInfo_) == -1 &&
          item.name.indexOf(searchInfo_) == -1
        ) {
          return false;
        }
        return true;
      });
      setWalletNftInfo(searchINfo);
      setRefreshFlag(!refreshFlag);
    }
    setLoadingView(false);
  };

  const getNftInfo = async (tokenId_, serialNum_) => {
    let _nftInfo;
    let _fallback = 0;

    const _getNftFee = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}`
    );
    console.log("getNftInfo log - 1 : ", _getNftFee);

    if (
      _getNftFee.data?.custom_fees?.royalty_fees?.length > 0 &&
      _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee
    ) {
      _fallback =
        _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee.amount /
        100000000;
    }
    // console.log("getNftInfo log - 2 : ", _fallback);

    const _tokenZuseInfo = await global.getInfoResponse(
      `${env.SERVER_URL}/swap/get_collection_zuse_info?tokenId=${tokenId_}`
    );

    let _floorPrice = 0;
    if (
      _tokenZuseInfo &&
      _tokenZuseInfo.data.result &&
      _tokenZuseInfo.data.data &&
      _tokenZuseInfo.data.data.collectionStats &&
      _tokenZuseInfo.data.data.collectionStats.floor
    ) {
      _floorPrice += _tokenZuseInfo.data.data.collectionStats.floor;
      //  console.log("getNftInfo log - 1 : ", _floorPrice);
    }

    const _singleNftInfo = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}/nfts?serialNumber=${serialNum_}`
    );
    // console.log("getNftInfo log - 1 : ", _singleNftInfo);
    if (_singleNftInfo && _singleNftInfo.data.nfts.length > 0) {
      let _preMdUrl = base64ToUtf8(_singleNftInfo.data.nfts[0].metadata).split(
        "//"
      );
      //   console.log("getNftInfo log - 2 : ", _preMdUrl);

      let _metadataUrl =
        "https://hashpack.b-cdn.net/ipfs/" + _preMdUrl[_preMdUrl.length - 1];
      let _metadata = await global.getInfoResponse(_metadataUrl);

      if (_metadata) {
        let _preImgUrl = _metadata.data.image.split("//");
        const _imgUrl = "https://hashpack.b-cdn.net/ipfs/" + _preImgUrl[1];
        const _tokenId = _singleNftInfo.data.nfts[0].token_id;
        const _serialNum = _singleNftInfo.data.nfts[0].serial_number;
        const _creator = _metadata.data.creator;
        const _name = _metadata.data.name;

        _nftInfo = {
          accountId: accountIds[0],
          tokenId: _tokenId,
          serialNum: _serialNum,
          creator: _creator,
          name: _name,
          imgUrl: _imgUrl,
          floorPrice: _floorPrice,
          fallback: _fallback,
        };

        const _postData = {
          query: _nftInfo,
          isQueryFind: false,
        };
      }
    }
    return _nftInfo;
  };

  const updateUnInitalizedNftInfo = async (tokenId_, serialNum_) => {
    //--------------------TestMode Start by Paulo----------------------------
    //If token's imgUrl not exist raffleResult Database, perfrom following and update raffle record with imgUrl
    //Otherwise return raffleRecord
    const _postData = {
      query: {
        tokenId: tokenId_,
        serialNum: serialNum_,
      },
      isQueryFind: true,
    };

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.UPDATE_IF_RAFFLE_INFO_PREFIX,
      _postData
    );
    if (_postResult.data.result) {
      // All nftdata exist in Raffle.
      const _creator = _postResult.data.data.tokenId;
      const _name = _postResult.data.data.name;
      const _imgUrl = _postResult.data.data.imgUrl;
      const _floorPrice = _postResult.data.data.floorPrice;
      const _fallback = _postResult.data.data.fallback;

      const _nftInfo = {
        tokenId: tokenId_,
        serialNum: serialNum_,
        creator: _creator,
        name: _name,
        imgUrl: _imgUrl,
        floorPrice: _floorPrice,
        fallback: _fallback,
      };
      return _nftInfo;
    }
    //--------------------TestMode End---------------------------------------
    let _nftInfo;
    let _fallback = 0;

    const _getNftFee = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}`
    );
    console.log("getNftInfo log - 1 : ", _getNftFee);

    if (
      _getNftFee.data?.custom_fees?.royalty_fees?.length > 0 &&
      _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee
    ) {
      _fallback =
        _getNftFee.data.custom_fees.royalty_fees[0].fallback_fee.amount /
        100000000;
    }
    // console.log("getNftInfo log - 2 : ", _fallback);

    const _tokenZuseInfo = await global.getInfoResponse(
      `${env.SERVER_URL}/swap/get_collection_zuse_info?tokenId=${tokenId_}`
    );

    let _floorPrice = 0;
    if (
      _tokenZuseInfo &&
      _tokenZuseInfo.data.result &&
      _tokenZuseInfo.data.data &&
      _tokenZuseInfo.data.data.collectionStats &&
      _tokenZuseInfo.data.data.collectionStats.floor
    ) {
      _floorPrice += _tokenZuseInfo.data.data.collectionStats.floor;
      //  console.log("getNftInfo log - 1 : ", _floorPrice);
    }

    const _singleNftInfo = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}/nfts?serialNumber=${serialNum_}`
    );
    // console.log("getNftInfo log - 1 : ", _singleNftInfo);
    if (_singleNftInfo && _singleNftInfo.data.nfts.length > 0) {
      let _preMdUrl = base64ToUtf8(_singleNftInfo.data.nfts[0].metadata).split(
        "//"
      );
      //   console.log("getNftInfo log - 2 : ", _preMdUrl);

      let _metadataUrl =
        "https://hashpack.b-cdn.net/ipfs/" + _preMdUrl[_preMdUrl.length - 1];
      let _metadata = await global.getInfoResponse(_metadataUrl);

      if (_metadata) {
        let _preImgUrl = _metadata.data.image.split("//");
        const _imgUrl = "https://hashpack.b-cdn.net/ipfs/" + _preImgUrl[1];
        const _tokenId = _singleNftInfo.data.nfts[0].token_id;
        const _serialNum = _singleNftInfo.data.nfts[0].serial_number;
        const _creator = _metadata.data.creator;
        const _name = _metadata.data.name;

        _nftInfo = {
          accountId: accountIds[0],
          tokenId: _tokenId,
          serialNum: _serialNum,
          creator: _creator,
          name: _name,
          imgUrl: _imgUrl,
          floorPrice: _floorPrice,
          fallback: _fallback,
        };

        const _postData = {
          query: _nftInfo,
          isQueryFind: false,
        };

        await global.postInfoResponse(
          env.SERVER_URL + env.UPDATE_IF_RAFFLE_INFO_PREFIX,
          _postData
        );
      }
    }
    return _nftInfo;
  };

  const onClickLoadMoreNfts = () => {
    if (dispFromValue === FROM_WALLET) {
      getWalletNftData(nextLinkOfGetWalletNft, accountIds[0]);
    }
  };

  const onClickBuyEntry = async (tokenId_, serialNum_, schedule, priceUsd) => {
    // console.log("onClickBuyEntry log - 1 : ", tokenId_, serialNum_);
    if (!accountIds) {
      toast.warning("You have to connect wallet to buy entry.");
      return;
    }
    // const _associateResult = await tokenAssociateCheck(accountIds[0], tokenId_);
    // if (!_associateResult) {
    //     alert(`You have to associate ${tokenId_}`);
    //     return;
    // }

    if (schedule == "buy") {
      let _tempTicketInfo = dbNftInfo.filter(
        (tempTicketInfo) =>
          tempTicketInfo.tokenId === tokenId_ &&
          tempTicketInfo.serialNum === serialNum_
      );
      // console.log("onClickBuyEntry log - 2 : ", _tempTicketInfo);
      if (_tempTicketInfo.length > 0)
        setCurrentBuyTicketData(_tempTicketInfo[0]);
      displayPenguDialog(
        "Terms & Conditions",
        "1. Confirm the collection by clicking the i button on the right corner of the raffle display.<br />2. If the collection is listed on marketplaces, it is a verified collection. If otherwise, do due diligence before proceeding to purchase tickets.<br />3. Raffles shall not assume any liability or responsibility for any collection.<br />4. Raffles cannot refund ticket(s) when bought.<br />5. You can only buy 20% of the total tickets.",
        "AGREE",
        "buy-ticket"
      );
    } else if (schedule == "schedule") {
      setLoadingView(true);

      try {
        const amount = parseFloat(3 / priceUsd);
        // const amount = 1;
        console.log("onClickBuyEntry", amount, priceUsd);

        const transactionResult = await sendHbarToTreasury(amount);

        if (!transactionResult) {
          toast.error("A problem occurred. Please try again.");
          setLoadingView(false);
          return;
        }

        const postData = {
          accountId: accountIds[0],
          tokenId: tokenId_,
          serialNum: serialNum_,
          amount: amount,
        };

        console.log("onClickBuyEntry log - 6 : ", postData);

        const result = await global.postInfoResponse(
          env.SERVER_URL + env.UPDATE_SCHEDULE_INFO,
          postData
        );

        console.log("onClickBuyEntry log - 7 : ", result);

        if (!result?.data.result) {
          toast.error("A problem occurred. Please try again.");
        } else toast.success("Ticket extend successful!");
      } catch (e) {
        setLoadingView(false);
        console.log(e);
        toast.error("A problem occured. Please check your balances.");
      }
      setLoadingView(false);
    }
  };

  const tokenAssociateCheck = async (accountId_, tokenId_) => {
    let _containFlag = false;
    let _urlStr = "https://v2.api.kabuto.sh/account/" + accountId_ + "/token";
    let _response = await global.getInfoResponse(_urlStr);
    if (_response) {
      const _tokenData = _response.data.data;
      for (let i = 0; i < _tokenData.length; i++) {
        if (_tokenData[i].tokenId === tokenId_) _containFlag = true;
      }
    }
    return _containFlag;
  };

  const onClickSendRequest = async (tokenId_, serialNum_) => {
    setLoadingView(true);

    const _postData = {
      tokenId: tokenId_,
      serialNum: serialNum_,
    };

    const _sendRequestResult = await global.postInfoResponse(
      env.SERVER_URL + env.SEND_NFT_REQUEST_PREFIX,
      _postData
    );

    if (_sendRequestResult.data.result) {
      const _receiveResult = await receiveNft(tokenId_, serialNum_);
      if (_receiveResult) {
        let _newWinsNftInfo = winsNftInfo;
        for (let i = 0; i < _newWinsNftInfo.length; i++) {
          if (
            _newWinsNftInfo[i].tokenId === tokenId_ &&
            _newWinsNftInfo[i].serialNum === serialNum_ &&
            _newWinsNftInfo[i].nftSendProcess === "pending"
          ) {
            _newWinsNftInfo[i].nftSendProcess = "success";
          }
        }

        const _updatePostData = {
          tokenId: tokenId_,
          serialNum: serialNum_,
        };

        const _updateRequestResult = await global.postInfoResponse(
          env.SERVER_URL + env.UPDATE_WINS_HISTORY_PREFIX,
          _updatePostData
        );

        if (!_updateRequestResult.data.result) {
          toast.error(
            "A problem occurred during the NFT transmission process. Please try again."
          );
          setLoadingView(false);
          return;
        }

        setWinsNftInfo(_newWinsNftInfo);
        setRefreshFlag(!refreshFlag);
        toast.success("NFT transmission successful!");
      }
    }
    setLoadingView(false);
  };

  const onClickCreateTicket = (
    tokenId_,
    serialNum_,
    price_,
    tokenSelId_,
    time_,
    ticketsCount_,
    fallback_,
    creator_,
    name_,
    imgUrl_,
    floorPrice_,
    schedule
  ) => {
    setLoadingView(true);
    console.log(
      "onClickCreateTicket log - 1 : ",
      tokenId_,
      serialNum_,
      price_,
      tokenSelId_,
      time_,
      ticketsCount_
    );

    if (price_ <= 0) {
      toast.warning("The ticket price must be greater than zero.");
      setLoadingView(false);
      return;
    }

    // if (time_ < 24 || time_ > 168) {
    //   toast.warning(
    //     "The validity of the ticket must be between 24 and 168 hours."
    //   );
    //   setLoadingView(false);
    //   return;
    // }

    if (ticketsCount_ <= 0) {
      toast.warning("The number of tickets must be greater than zero.");
      setLoadingView(false);
      return;
    }

    const _postData = {
      accountId: accountIds[0],
      tokenId: tokenId_,
      serialNum: serialNum_,
      price: price_,
      tokenSelId: tokenSelId_,
      timeLimit: time_,
      totalCount: ticketsCount_,
      fallback: fallback_,

      creator: creator_,
      name: name_,
      imgUrl: imgUrl_,
      floorPrice: floorPrice_,
      schedule: schedule,
    };

    setCurrentCreateTicketPostData(_postData);

    displayPenguDialog(
      "Terms & Conditions",
      "1. The NFT prize will be transferred from your wallet into our escrow for all created raffles.<br/>2. A base fee charge of 10ℏ to host a raffle. If only one ticket is sold, the Raffle will roll. If no ticket is sold, your NFT will be refunded, but raffles will send the base fee to our treasury.<br/>3. If all tickets are sold out, the Raffle rolls immediately, disregarding the time left.<br/>4. Raffles will always proceed no matter the ticket sales.<br/>5. The minimum time for raffles is 24Hrs, and the maximum is 168Hrs.<br/>6. There is a 4% commission fee for all ticket sales.<br/>7. After ticket sales, raffles will not be able to be edited or canceled.<br/>8. We do not take responsibility for the promotion of raffles.",
      "AGREE",
      "create-tickets"
    );
    setLoadingView(false);
  };

  const associateCheck = async (_tokenId, operatorId) => {
    if (_tokenId == -1) return true; //HBAR token

    let _tokenAssociatedFlag = false;

    let _response = await axios.get(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/accounts/${operatorId}/tokens`
    );
    let _nextLink = _response.data.links.next;
    while (1) {
      const _nftData = _response.data.tokens;

      for (let i = 0; i < _nftData.length; i++) {
        if (_nftData[i].token_id === _tokenId) {
          _tokenAssociatedFlag = true;
          break;
        }
      }

      if (_nextLink === null) break;
      _response = await axios.get(
        `https://mainnet-public.mirrornode.hedera.com${_nextLink}`
      );
      _nextLink = _response.data.links.next;
    }

    console.log(
      "associateCheck log - 2 : ",
      _response.data,
      _tokenAssociatedFlag
    );

    return _tokenAssociatedFlag;
  };

  const buyTicket = async (ticketData_, ticketCount_) => {
    setLoadingView(true);
    // console.log("buyTicket log - 1 : ", ticketData_, ticketCount_);
    if (!accountIds) {
      toast.warning("Connect Wallet to buy ticket.");
      setLoadingView(false);
      return;
    }

    if (ticketCount_ <= 0) {
      toast.warning("Set the correct number of tickets you want to buy.");
      setLoadingView(false);
      return;
    }

    const _getSingleTicketInfo = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_ALL_PREFIX +
        `?tokenId=${ticketData_.tokenId}&serialNum=${ticketData_.serialNum}`
    );
    // console.log("buyTicket log - 2 : ", _getSingleTicketInfo);
    if (!_getSingleTicketInfo.data.result) {
      toast.error("A problem occurred. Please try again.");
      setLoadingView(false);
      return;
    }

    const _tempTicketInfo = _getSingleTicketInfo.data.data[0];
    const checkResult = await associateCheck(
      ticketData_.tokenSelId,
      accountIds[0]
    );

    if (checkResult == false) {
      toast.error(
        `Token is not associated. Please assoicate with token id(${ticketData_.tokenSelId})`
      );
      setLoadingView(false);
      return;
    }

    console.log("associateCheck", "function restart");

    if (_tempTicketInfo.soldCount >= _tempTicketInfo.totalCount) {
      toast.warning("Tickets are already sold out.");
      setLoadingView(false);
      return;
    }

    let _limitCount;
    if (_tempTicketInfo.totalCount < 5) _limitCount = 1;
    else _limitCount = parseInt(_tempTicketInfo.totalCount / 5);

    let _myEntryCount = 0;

    if (accountIds && accountIds.length > 0) {
      const _getEntryCountPostData = {
        accountId: accountIds[0],
        tokenId: _tempTicketInfo.tokenId,
        serialNum: _tempTicketInfo.serialNum,
      };
      const _getEntryCountPostResult = await global.postInfoResponse(
        env.SERVER_URL + env.GET_ENTRY_COUNT_PREFIX,
        _getEntryCountPostData
      );
      if (_getEntryCountPostResult && _getEntryCountPostResult.data.result)
        _myEntryCount = _getEntryCountPostResult.data.data;
    }

    // console.log("buyTicket log - 4 : ", _limitCount, _myEntryCount, ticketCount_);

    if (_myEntryCount + parseInt(ticketCount_) > _limitCount) {
      toast.warning("Set the correct number of tickets you want to buy.");
      setLoadingView(false);
      return;
    }

    const _sendResult = await sendTokenToTreasury(
      ticketData_.tokenSelId,
      parseFloat(_tempTicketInfo.price) * parseInt(ticketCount_)
    );
    if (!_sendResult) {
      toast.error("A problem occurred. Please try again.");
      setLoadingView(false);
      return;
    }

    const _postData = {
      accountId: _tempTicketInfo.accountId,
      tokenId: ticketData_.tokenId,
      serialNum: ticketData_.serialNum,
      buyerId: accountIds[0],
      ticketCount: ticketCount_,
    };

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.BUY_TICKET_PREFIX,
      _postData
    );

    if (!_postResult.data.result) {
      toast.error("A problem occurred. Please try again.");
      setLoadingView(false);
      return;
    }

    await changeDbNftStatus(
      ticketData_.tokenId,
      ticketData_.serialNum,
      ticketCount_
    );
    toast.success("Buy ticket successful.");
    setLoadingView(false);
  };

  const changeDbNftStatus = async (tokenId_, serialNum_, ticketCount_) => {
    let _tempDbNftInfo = dbNftInfo;
    for (let i = 0; i < _tempDbNftInfo.length; i++) {
      if (
        _tempDbNftInfo[i].tokenId === tokenId_ &&
        _tempDbNftInfo[i].serialNum === serialNum_
      ) {
        _tempDbNftInfo[i].soldCount =
          parseInt(_tempDbNftInfo[i].soldCount) + parseInt(ticketCount_);
        _tempDbNftInfo[i].myEntry =
          parseInt(_tempDbNftInfo[i].myEntry) + parseInt(ticketCount_);
      }
    }
    // console.log("changeDbNftStatus log - 1 : ", _tempDbNftInfo);
    setDbNftInfo(_tempDbNftInfo);
    setRefreshFlag(!refreshFlag);
  };

  const createTicket = async (postData_) => {
    //Check nft associate
    const _associateNftCheckResult = await global.postInfoResponse(
      env.SERVER_URL + env.RAFFLE_ASSOCIATE_CHECK_PREFIX,
      { tokenId: postData_.tokenId }
    );

    if (!_associateNftCheckResult || !_associateNftCheckResult.data.result) {
      toast.error(
        "A problem occurred during the nft token associate. Please try again."
      );
      setLoadingView(false);
      return;
    }

    //Check token assoicate
    if (postData_.tokenSelId != -1) autoAssociate(postData_.tokenSelId);
    // const _associateTokenCheckResult = await global.postInfoResponse(
    //   env.SERVER_URL + env.RAFFLE_ASSOCIATE_CHECK_PREFIX,
    //   { tokenId: postData_.tokenSelId }
    // );

    // if (
    //   !_associateTokenCheckResult ||
    //   !_associateTokenCheckResult.data.result
    // ) {
    //   toast.error(
    //     "A problem occurred during the fungible token associate. Please try again."
    //   );
    //   setLoadingView(false);
    //   return;
    // }

    let _ticketPrice =
      parseFloat(env.CREATE_TICKET_PRICE) + parseFloat(postData_.fallback);
    console.log("createTicket", postData_, postData_.fallback, _ticketPrice);
    const _sendResult = await sendHbarAndNftToTreasury(
      _ticketPrice,
      postData_.tokenId,
      postData_.serialNum
    );
    if (!_sendResult) {
      toast.error(
        "A problem occurred during the NFT transmission process. Please try again."
      );
      setLoadingView(false);
      return;
    }

    console.log("*********************", postData_);
    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.CREATE_TICKET_PREFIX,
      postData_
    );
    if (!_postResult?.data?.result) {
      toast.error(_postResult.data.error);
      setLoadingView(false);
      return;
    }

    await changeWalletNftStatus(postData_.tokenId, postData_.serialNum);
    toast.success("Create tickets successful.");
    setLoadingView(false);
  };

  const changeWalletNftStatus = async (tokenId_, serialNum_) => {
    let _tempWalletNftInfo = walletNftInfo;
    for (let i = 0; i < _tempWalletNftInfo.length; i++) {
      if (
        _tempWalletNftInfo[i].tokenId === tokenId_ &&
        _tempWalletNftInfo[i].serialNum === serialNum_
      ) {
        _tempWalletNftInfo[i].ticketCreated = true;
        break;
      }
    }
    setWalletNftInfo(_tempWalletNftInfo);
    setRefreshFlag(!refreshFlag);
  };

  const base64ToUtf8 = (base64Str_) => {
    // create a buffer
    const _buff = Buffer.from(base64Str_, "base64");

    // decode buffer as UTF-8
    const _utf8Str = _buff.toString("utf-8");

    return _utf8Str;
  };

  const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  //=============================================================================================
  // Radio button

  const changeNftSortMode = (value) => {
    //  console.log("changeNftSortMode log - 1 : ", value);
    setNftSortMode(value);
    getDbNftData(0, [], value, nftSortType);
  };

  const changeNftSortType = (value) => {
    // console.log("changeNftSortType log - 1 : ", event.target.value);
    setNftSortType(value);
    getDbNftData(0, [], nftSortMode, value);
  };

  const handleKeyChange = (e) => {
    if (e.key == "Enter") {
      console.log(
        ">>>>>>>>>>>Search Content:",
        e.target.value,
        e.key,
        dispFromTypes[dispTabValue]
      );
      setSearchValue(e.target.value);

      if (dispFromTypes[dispTabValue] === FROM_ACTIVE) {
        getDbNftData(0, [], "ascending", "timeRemain", e.target.value);
      } else if (dispFromTypes[dispTabValue] === FROM_WALLET) {
        getWalletNftData(null, accountIds[0], e.target.value);
      } else if (dispFromTypes[dispTabValue] === FROM_PREVIOUS) {
        getRaffleHistory(0, [], e.target.value);
      } else if (dispFromTypes[dispTabValue] === FROM_WINS) {
        getWinsHistory(0, [], e.target.value);
      }
    }
  };

  //=============================================================================================

  const drawerWidth = 240;

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      right: "25px",
      top: "-28px",
      border: `2px solid ${theme.palette.background.paper}`,
      padding: "0 4px",
    },
  }));

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    height: "40px",
    margin: "12px 20px 0px 0px",
    color: "white",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
      [theme.breakpoints.up("sm")]: {
        width: "12ch",
        "&:focus": {
          width: "20ch",
        },
      },
    },
  }));

  return (
    <>
      <div className="raffle-container">
        <div className="main-nav-open">
          <IconButton
            onClick={handleDrawerOpen}
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
        <div className={!open ? "raffle-menu menu-closed" : "raffle-menu"}>
          <div
            className="main-nav-logo"
            onClick={() => {
              window.location.href = "/";
            }}
          />
          <Tabs
            className={`disp-page-tab ${hidden}`}
            orientation="vertical"
            value={dispTabValue}
            onChange={(event, newValue) => onChangeDispValue(newValue)}
          >
            <Tab
              className={dispTabValue == 0 ? "active" : ""}
              icon={<div className="HomeIcon" />}
              aria-label="RAFFLES"
              value="0"
            />
            <Tab
              className={dispTabValue == 1 ? "active" : ""}
              icon={<div className="WalletIcon" />}
              aria-label="WALLET"
              value="1"
            />
            <Tab
              className={dispTabValue == 2 ? "active" : ""}
              icon={<div className="PreviousIcon" />}
              aria-label="PREVIOUS"
              tabIndex="2"
            />
            <Tab
              className={dispTabValue == 3 ? "active" : ""}
              icon={<div className="ClaimIcon" />}
              aria-label="CLAIM"
              value="3"
            ></Tab>
            {winnerCount && (
              <StyledBadge badgeContent={winnerCount}></StyledBadge>
            )}
            {/* <Tab
              className={dispTabValue == 4 ? "active" : ""}
              icon={<div class="RedirectIcon" />}
              aria-label="REDIRECT"
              value="4"
            ></Tab> */}
            <Tab
              className={dispTabValue == 5 ? "active" : ""}
              icon={<MenuIcon />}
              aria-label="CLOSE"
              value="5"
            ></Tab>
          </Tabs>
          {/* <div className="menu-text">
            <p>LET"S BUIDL</p>
            <p>@2022 dapp.deragods.com</p>
          </div> */}
        </div>

        {/* <Main open={open}> */}
        <div ref={containerRef} className="raffle-wrapper">
          <div className="space-between">
            <h1
              className="page-title"
              style={{
                margin:
                  dispFromValue === FROM_WALLET
                    ? `5px ${walletNftCardMargin}px`
                    : `5px ${soldNftCardMargin}px`,
              }}
            >
              {dispFromValue === FROM_WALLET
                ? "Create Raffle"
                : dispFromValue === FROM_ACTIVE
                ? param_raffle_id
                  ? `Raffle ${String(param_raffle_id).substring(
                      String(param_raffle_id).length - 4,
                      String(param_raffle_id).length
                    )}`
                  : "Raffles"
                : dispFromValue === FROM_WINS
                ? "CLAIM"
                : "PREVIOUS"}
            </h1>
          </div>

          <div
            class={`search-sort-bar ${hidden}`}
            style={{
              margin:
                dispFromValue === FROM_WALLET
                  ? `5px ${walletNftCardMargin}px`
                  : `5px ${soldNftCardMargin}px`,
            }}
          >
            <div className="d-flex row m-0 vertical-navigation">
              {/* <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ "aria-label": "search" }}
                  onKeyUp={(e) => handleKeyChange(e)}
                />
              </Search> */}
              <div className="refresh-data-button" onClick={onClickRefreshData}>
                <img src={require("assets/imgs/navigation/refresh.png")} />
              </div>
              {dispFromValue === FROM_ACTIVE && (
                <>
                  <div className="sort-wrapper">
                    <HighLights
                      onChange={changeNftSortType}
                      title={"SORT MODE"}
                      options={["ascending", "descending"]}
                      value={nftSortMode}
                    />
                  </div>
                  <div className="sort-wrapper">
                    <HighLights
                      onChange={changeNftSortType}
                      title={"SORT TYPE"}
                      options={["timeRemain", "createAt", "soldCount", "price"]}
                      value={nftSortType}
                    />
                  </div>
                </>
              )}
              {/* <RefreshIcon
                className="refresh-data-button"
                onClick={() => onClickRefreshData()}
              /> */}
            </div>
          </div>
          <div className="nft-disp-panel">
            {dispFromValue === FROM_ACTIVE &&
              dbNftInfo.length > 0 &&
              dbNftInfo.map((item_, index_) => {
                return (
                  <SingleTicket
                    singleNftInfo={item_}
                    nftCardMargin={dbNftCardMargin}
                    onClickBuyEntry={onClickBuyEntry}
                    addRaffleFlag={addRaffleFlag}
                    ticketType="buy"
                  />
                );
              })}
            {dispFromValue === FROM_WALLET &&
              walletNftInfo.length > 0 &&
              walletNftInfo.map((item_, index_) => {
                return (
                  <TicketCreate
                    singleNftInfo={item_}
                    nftCardMargin={walletNftCardMargin}
                    onClickCreateTicket={onClickCreateTicket}
                  />
                );
              })}
            {dispFromValue === FROM_PREVIOUS &&
              soldNftInfo.length > 0 &&
              soldNftInfo.map((item_, index_) => {
                return (
                  <SoldTicket
                    singleNftInfo={item_}
                    nftCardMargin={soldNftCardMargin}
                  />
                );
              })}
            {dispFromValue === FROM_WINS &&
              winsNftInfo.length > 0 &&
              winsNftInfo.map((item_, index_) => {
                return (
                  <WinsTicket
                    singleNftInfo={item_}
                    nftCardMargin={soldNftCardMargin}
                    onClickSendRequest={onClickSendRequest}
                  />
                );
              })}
            {dispFromValue === FROM_WALLET &&
              walletNftInfo.length > 0 &&
              nextLinkOfGetWalletNft && (
                <div
                  className="single-nft-wrapper"
                  style={{ margin: `5px ${walletNftCardMargin}px` }}
                >
                  <div className="d-flex row m-0">
                    <Button onClick={() => onClickLoadMoreNfts()}>
                      <AddIcon />
                    </Button>
                  </div>
                </div>
              )}
            {dispFromValue === FROM_WALLET &&
              accountIds?.length > 0 &&
              walletNftInfo.length === 0 &&
              searchValue && <h1>"{searchValue}" NFT not found !</h1>}
            {dispFromValue === FROM_PREVIOUS &&
              accountIds?.length > 0 &&
              soldNftInfo.length === 0 &&
              searchValue && <h1>"{searchValue}" NFT not found !</h1>}

            {dispFromValue === FROM_ACTIVE &&
              accountIds?.length > 0 &&
              dbNftInfo.length === 0 &&
              searchValue && <h1>"{searchValue}" NFT not found !</h1>}
            {dispFromValue === FROM_WINS &&
              accountIds?.length > 0 &&
              winsNftInfo.length === 0 &&
              searchValue && <h1>"{searchValue}" NFT not found !</h1>}
            {!accountIds &&
              (dispFromValue === FROM_WALLET ||
                dispFromValue === FROM_WINS) && <h1>Connect Wallet!</h1>}
          </div>
        </div>
        {/* </Main> */}
      </div>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => (loadingView ? 10000 : -1),
          backgroundColor: "#000",
        }}
        open={loadingView}
      >
        <img alt="" src={require("../../assets/imgs/loading.gif")} />
      </Backdrop>
      <Dialog open={penguDialogViewFlag} onClose={() => penguDialogClose()}>
        <PenguDialog
          titleText={penguDialogTitleStr}
          contentText={penguDialogContentStr}
          agreeBtnStr={penguDialogAgreeBtnStr}
          dialogType={penguDialogType}
          onClickDialogAgreeBtn={onClickPenguDialogAgreeBtn}
          onClickDialogCloseBtn={penguDialogClose}
        />
      </Dialog>
      <Dialog
        open={buyTicketDialogViewFlag}
        onClose={() => buyTicketDialogClose()}
      >
        <BuyTicketDialog
          ticketData={currentBuyTicketData}
          onClickDialogAgreeBtn={onClickBuyTicketDialogAgreeBtn}
          onClickDialogCloseBtn={buyTicketDialogClose}
        />
      </Dialog>

      <Dialog open={scheduleDialog} onClose={() => closeScheduleDialog()}>
        <div className="nft-disp-panel schedule-panel">
          <div className="dialog-title">
            <p>WEEKLY TICKET</p>
          </div>
          {scheduleInfo.length > 0 &&
            scheduleInfo.map((item, index_) => {
              return (
                <SingleTicket
                  singleNftInfo={item}
                  nftCardMargin={dbNftCardMargin}
                  onClickBuyEntry={onClickBuyEntry}
                  ticketType="schedule"
                />
              );
            })}
        </div>
      </Dialog>
      <ToastContainer autoClose={3000} draggableDirection="x" />
    </>
  );
}

export default Raffle;
