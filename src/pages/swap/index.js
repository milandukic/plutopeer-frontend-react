import React, { useState, useEffect, useCallback, useRef } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Backdrop from "@mui/material/Backdrop";
import Badge from "@mui/material/Badge";
import { styled, alpha, useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import { useBottomScrollListener } from "react-bottom-scroll-listener";
import { Button } from "reactstrap";
import Dialog from "@mui/material/Dialog";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SwapVerticalCircleIcon from "@mui/icons-material/SwapVerticalCircle";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckIcon from "@mui/icons-material/Check";
import GetAppIcon from "@mui/icons-material/GetApp";
import InfoIcon from "@mui/icons-material/Info";
import MessageIcon from "@mui/icons-material/Message";
import SearchIcon from "@mui/icons-material/Search";
import { Input } from "reactstrap";
import { useAlert } from "react-alert";
import PenguDialog from "components/PenguDialog";
import axios from "axios";
import "./style.scss";

import * as env from "../../env";
import * as global from "../../global";
import { useHashConnect } from "../../assets/api/HashConnectAPIProvider.tsx";
import WalletNftCard from "components/Swap/WalletNftCard";
import OfferNftCard from "components/Swap/OfferNftCard";
import ListedCollectionCard from "components/Swap/ListedCollectionCard";
import NotificationSound from "../../assets/sounds/bell.mp3";
import { Textarea } from "@mui/joy";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import InputBase from "@mui/material/InputBase";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { KeyboardCommandKey } from "@mui/icons-material";

const FROM_ACTIVE = "ACTIVE";
const FROM_WALLET = "WALLET";
const FROM_OFFERS = "OFFERS";
const FROM_CLAIM = "CLAIM";
const dispFromTypes = [FROM_ACTIVE, FROM_WALLET, FROM_OFFERS, FROM_CLAIM];

const MAX_WRAPPER_WIDTH = 1245;
const NFT_CARD_WIDTH = 240;
const SWAP_OFFER_CARD_WIDTH = 260;

const LIMIT_NFT_TICK_COUNT = 7;

//Modified by 3
// const LIST_NFT_PRICE = 11;
const LIST_NFT_PRICE = 0.01;

const MAX_NFT_PER_PAGE = 25;

//offer Type
const COLLECTION_TYPE_1 = "offer1";
const COLLECTION_TYPE_2 = "offer2";
const COLLECTION_TYPE_3 = "offer3";
const COLLECTION_TYPE_4 = "offer4";
let ws = null;

function Swap() {
  const alert = useAlert();
  const audioPlayer = useRef(null);
  const playAudio = () => {
    audioPlayer.current.play();
  };

  const [penguDialogTitleStr, setPenguDialogTitleStr] = useState("");
  const [penguDialogContentStr, setPenguDialogContentStr] = useState("");
  const [penguDialogAgreeBtnStr, setPenguDialogAgreeBtnStr] = useState("");
  const [penguDialogType, setPenguDialogType] = useState("");
  const [collectionMessageDlgView, setCollectionMessageDlgView] =
    useState(false);
  const [firstPopUpDlgView, setFirstPopUpDlgView] = useState(false);
  const [listCollectionDialogView, setListCollectionDialogView] =
    useState(false);
  const {
    walletData,
    sendHbarAndMultiNftsToTreasury,
    receiveMultipleAndHbarNfts,
    receiveHbar,
    sendHbarToTreasury,
    associateToken
  } = useHashConnect();
  const { accountIds } = walletData;
  const [loadingView, setLoadingView] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [nftCardMargin, setNftCardMargin] = useState(
    parseInt(
      window.innerWidth - 35 > MAX_WRAPPER_WIDTH
        ? (MAX_WRAPPER_WIDTH % NFT_CARD_WIDTH) /
            parseInt(MAX_WRAPPER_WIDTH / NFT_CARD_WIDTH) /
            2
        : ((window.innerWidth - 35) % NFT_CARD_WIDTH) /
            parseInt((window.innerWidth - 35) / NFT_CARD_WIDTH) /
            2
    )
  );
  const [swapOfferCardMargin, setSwapOfferCardMargin] = useState(
    parseInt(
      window.innerWidth - 35 > MAX_WRAPPER_WIDTH
        ? (MAX_WRAPPER_WIDTH % SWAP_OFFER_CARD_WIDTH) /
            parseInt(MAX_WRAPPER_WIDTH / SWAP_OFFER_CARD_WIDTH) /
            2
        : ((window.innerWidth - 35) % SWAP_OFFER_CARD_WIDTH) /
            parseInt((window.innerWidth - 35) / SWAP_OFFER_CARD_WIDTH) /
            2
    )
  );
  const [dispFromValue, setDispFromValue] = useState(dispFromTypes[0]);
  const [dispTabValue, setDispTabValue] = useState(0);
  const onClickRefreshData = () => {
    console.log("onClickRefreshData log - 1");
    if (accountIds?.length > 0) checkNewOffer();
    if (dispFromValue === FROM_WALLET && accountIds?.length > 0) {
      getWalletNftData(null, accountIds[0], []);
    } else if (dispFromValue === FROM_ACTIVE) {
      getDbCollectionData(0, []);
    } else if (dispFromValue === FROM_OFFERS) {
      getSwapOfferInfo([]);
    } else if (dispFromValue === FROM_CLAIM) {
      getClaimCollectionInfo([]);
    }
  };

  // change disp value
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
      setWalletNftInfo([]);
      setDbCollectionInfo([]);
      setSwapOfferInfo([]);
      setClaimCollectionInfo([]);
      setRefreshFlag(!refreshFlag);

      if (dispFromTypes[newValue_] === FROM_WALLET && accountIds?.length > 0) {
        getWalletNftData(null, accountIds[0], []);
      } else if (dispFromTypes[newValue_] === FROM_ACTIVE) {
        getDbCollectionData(0, []);
      } else if (
        dispFromTypes[newValue_] === FROM_OFFERS &&
        accountIds?.length > 0
      ) {
        getSwapOfferInfo([]);
      } else if (
        dispFromTypes[newValue_] === FROM_CLAIM &&
        accountIds?.length > 0
      ) {
        getClaimCollectionInfo([]);
      }
    }
  };

  const displayPenguDialog = (title_, contentStr_, btnStr_, dlgType_) => {
    setPenguDialogTitleStr(title_);
    setPenguDialogContentStr(contentStr_);
    setPenguDialogAgreeBtnStr(btnStr_);
    setPenguDialogType(dlgType_);
  };

  useEffect(() => {
    function handleResize() {
      const _tempWindowWidth = window.innerWidth;
      setWindowWidth(_tempWindowWidth);
      setNftCardMargin(
        parseInt(
          _tempWindowWidth - 35 > MAX_WRAPPER_WIDTH
            ? (MAX_WRAPPER_WIDTH % NFT_CARD_WIDTH) /
                parseInt(MAX_WRAPPER_WIDTH / NFT_CARD_WIDTH) /
                2
            : ((_tempWindowWidth - 35) % NFT_CARD_WIDTH) /
                parseInt((_tempWindowWidth - 35) / NFT_CARD_WIDTH) /
                2
        )
      );
      setSwapOfferCardMargin(
        parseInt(
          _tempWindowWidth - 35 > MAX_WRAPPER_WIDTH
            ? (MAX_WRAPPER_WIDTH % SWAP_OFFER_CARD_WIDTH) /
                parseInt(MAX_WRAPPER_WIDTH / SWAP_OFFER_CARD_WIDTH) /
                2
            : ((_tempWindowWidth - 35) % SWAP_OFFER_CARD_WIDTH) /
                parseInt((_tempWindowWidth - 35) / SWAP_OFFER_CARD_WIDTH) /
                2
        )
      );
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  // get nft information if wallet connected
  useEffect(() => {
    if (accountIds?.length > 0) {
      //--------------------------------------------------------------------------------------------------
      ws = new WebSocket(env.SOCKET_URL);
      ws.onopen = () => {
        console.log(">>>>>>>>>>>>>>>>>>SwapWebSocket On Opened");
        const message = { accountId: accountIds[0], message: "open" };
        ws.send(JSON.stringify(message));
      };

      ws.onmessage = (e) => {
        const receiveData = JSON.parse(e.data);
        console.log(
          ">>>>>>>>>>>>>>>>>>SwapWebSocketOn Message:",
          receiveData.message,
          receiveData.accountId
        );
        switch (receiveData.message) {
          case "connect":
            console.log(">>>>>>>>>>>>>>>>>>SwapWebSocket On Connect");
            break;
          case "init":
            getClaimCount();
            getOfferCount();
            break;
        }
      };

      console.log(">>>>>>>>>>>>>>>>>UseEffect Init", accountIds[0]);

      if (dispFromValue === FROM_WALLET)
        getWalletNftData(null, accountIds[0], []);
      else if (dispFromValue === FROM_ACTIVE) getDbCollectionData(0, []);
      else if (dispFromValue === FROM_OFFERS) getSwapOfferInfo([]);
      else if (dispFromValue === FROM_CLAIM) getClaimCollectionInfo([]);

      const interval = setInterval(() => {
        getClaimCount();
        getOfferCount();
      }, 3000);

      return () => {
        clearInterval(interval);
        ws.onclose = () => {
          console.log("WebSocket Disconnected");
        };
      };
    } else {
      if (dispFromValue === FROM_WALLET) setWalletNftInfo([]);
      else if (dispFromValue === FROM_OFFERS) setSwapOfferInfo([]);
      else if (dispFromValue === FROM_CLAIM) setClaimCollectionInfo([]);
    }
  }, [accountIds, dispFromValue]);

  // get collection information from server when page loaded
  useEffect(async () => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Init>>>>>>>>>>>>>>>>>>>>>>>>");
    getDbCollectionData(0, []);
    displayPenguDialog(
      "TERMS-OF-USE",
      '<p>This is a peer-to-peer trading service that supports exchanging as many NFTs as possible in one swift & secure trade.</p> <br><p>To swap.</p><br>  <p>1. Click “WALLET” and List the NFT you wish to swap.</p><p>2. Click "OFFER" and wait for an offer.</p><p>3. Accept/Reject the offer.</p><p>4. If accepted, click "CLAIM" to get your swapped NFT.</p><p>5. To delist your NFT, click "CLAIM" and claim your listed NFT.</p><p>Easy, secure and fast!</p><br><p style= "color:red">Note:</p><p>Swap charges a service fee of 11H.</p>',
      "AGREE",
      "swap-popup"
    );
    setFirstPopUpDlgView(true);
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
  
  const autoAssociate = async (accountIds, tokenId) => {
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
  };


  //--------------------------------------------------------------------------------------------------

  // check new offer
  const checkNewOffer = async () => {
    console.log("checkNewOffer log - 1");
    if (!accountIds) return;
    const _getNewOffer = await global.getInfoResponse(
      env.SERVER_URL +
        env.CHECK_NEW_OFFER_PREFIX +
        `?accountId=${accountIds[0]}`
    );
    console.log("checkNewOffer log - 2 : ", _getNewOffer, offerNftCount);
    if (_getNewOffer.data.result) {
      // if (_getNewOffer.data.data.newOfferCount > 0) {
      //     playAudio();
      //     toast.success(`${_getNewOffer.data.data.newOfferCount} new swap offer created!`);
      // }
      // setOfferNftCount(_getNewOffer.data.data.newOfferCount);

      // if (_getNewOffer.data.data.successedOfferCount > 0) {
      //     playAudio();
      //     toast.success(`${_getNewOffer.data.data.successedOfferCount} offer successed!`);
      // }
      // if (_getNewOffer.data.data.declindeOfferCount > 0) {
      //     playAudio();
      //     toast.success(`${_getNewOffer.data.data.declindeOfferCount} offer declined!`);
      // }

      return;
    }
  };

  //--------------------------------------------------------------------------------------------------

  // get collection can claim from DB
  const [claimCollectionInfo, setClaimCollectionInfo] = useState([]);

  const [claimCount, setClaimCount] = useState(0);
  const [offerNftCount, setOfferNftCount] = useState(0);

  const getClaimCount = async () => {
    const _getDbCollectionResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_SINGLE_COLLECTION_PREFIX +
        `?accountId=${accountIds[0]}`
    );

    if (_getDbCollectionResult && _getDbCollectionResult.data.result) {
      setClaimCount(_getDbCollectionResult.data.data.length);
    }
  };

  const getOfferCount = async () => {
    const _getSwapOfferResult = await global.getInfoResponse(
      env.SERVER_URL + env.GET_SWAP_OFFER_PREFIX + `?accountId=${accountIds[0]}`
    );
    if (_getSwapOfferResult && _getSwapOfferResult.data.result) {
      setOfferNftCount(_getSwapOfferResult.data.data.length);
    }
  };

  const getClaimCollectionInfo = async (prevInfo_) => {
    setLoadingView(true);
    let _newClaimCollectinInfo = prevInfo_;

    const _getDbCollectionResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_SINGLE_COLLECTION_PREFIX +
        `?accountId=${accountIds[0]}`
    );
    console.log("getClaimCollectionInfo log - 1 : ", _getDbCollectionResult);

    if (_getDbCollectionResult && _getDbCollectionResult.data.result) {
      const _tempCollectionData = _getDbCollectionResult.data.data;
      setClaimCount(_getDbCollectionResult.data.data.length);
      for (let i = 0; i < _tempCollectionData.length; i++) {
        const _filter = { swapId: _tempCollectionData[i].swapId };
        const _findResult = filterObject(_newClaimCollectinInfo, _filter);

        if (_findResult.length === 0) {
          const _getListedNftResult = await global.getInfoResponse(
            env.SERVER_URL +
              env.GET_LISTED_NFT_PREFIX +
              `?swapId=${_tempCollectionData[i].swapId}`
          );
          console.log("getClaimCollectionInfo log - 2 : ", _getListedNftResult);

          if (_getListedNftResult && _getListedNftResult.data.result) {
            const _tempNftData = _getListedNftResult.data.data;
            let _collectionNfts = [];
            let _totalFloorPrice = 0;
            for (let j = 0; j < _tempNftData.length; j++) {
              const _singleNftInfo = await getNftInfo(
                _tempNftData[j].tokenId,
                _tempNftData[j].serialNum
              );
              _totalFloorPrice += _singleNftInfo.floorPrice;
              _collectionNfts.push(_singleNftInfo);
            }
            _newClaimCollectinInfo.push({
              accountId: _tempCollectionData[i].accountId,
              swapId: _tempCollectionData[i].swapId,
              nftCount: _tempCollectionData[i].nftCount,
              offerCount: _tempCollectionData[i].offerCount,
              offerType: _tempCollectionData[i].offerType,
              isListed: _tempCollectionData[i].isListed,
              offerHbar: _tempCollectionData[i].offerHbar,
              offerCount: _tempCollectionData[i].offerCount,
              totalFloorPrice: _totalFloorPrice,
              nfts: _collectionNfts,
            });
          }
        }
      }
      console.log("getClaimCollectionInfo log - 3 : ", _newClaimCollectinInfo);
      setClaimCollectionInfo(_newClaimCollectinInfo);
      setRefreshFlag(!refreshFlag);
    }
    setLoadingView(false);
  };

  const onClickClaimCollectionButton = async (swapId_) => {
    setLoadingView(true);

    console.log("onClickClaimCollectionButton log - 1 : ", swapId_);

    if (!accountIds) {
      toast.warning("Connect wallet!");
      setLoadingView(false);
      return;
    }

    const _getClaimNfts = await global.getInfoResponse(
      env.SERVER_URL + env.GET_LISTED_NFT_PREFIX + `?swapId=${swapId_}`
    );
    console.log("onClickClaimCollectionButton log - 2 : ", _getClaimNfts);

    if (!_getClaimNfts || _getClaimNfts?.length === 0) {
      toast.error("Something wrong with NFTs");
      setLoadingView(false);
      return;
    }

    const _nftData = _getClaimNfts.data.data;
    const _postResult1 = await global.postInfoResponse(
      env.SERVER_URL + env.CLAIM_REQUEST_PREFIX,
      { swapId: swapId_ }
    );
    console.log("onClickClaimCollectionButton log - 2 : ", _postResult1);

    const singleCollection = await global.getInfoResponse(
      env.SERVER_URL + env.GET_SINGLE_COLLECTION_PREFIX + `?swapId=${swapId_}`
    );

    let offerHbar = 0;
    if (
      singleCollection &&
      singleCollection.data.result &&
      singleCollection.data.data[0].offerHbar
    ) {
      offerHbar = singleCollection.data.data[0].offerHbar;
    }

    const _receiveResult = await receiveMultipleAndHbarNfts(
      _nftData,
      offerHbar
    );
    if (!_receiveResult) {
      toast.error(`Something wrong with claim!`);
      setLoadingView(false);
      return;
    }

    const _postResult2 = await global.postInfoResponse(
      env.SERVER_URL + env.DELETE_COLLECTION_PREFIX,
      { swapId: swapId_ }
    );
    console.log("onClickClaimCollectionButton log - 3 : ", _postResult2);

    await getClaimCollectionInfo([]);

    toast.success("Claim successful!");
    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  const [swapOfferInfo, setSwapOfferInfo] = useState([]);

  // get swap offer from DB
  const getSwapOfferInfo = async (prevInfo_) => {
    setLoadingView(true);

    if (!accountIds) return;

    let _newSwapOfferInfo = prevInfo_;

    const _getSwapOfferResult = await global.getInfoResponse(
      env.SERVER_URL + env.GET_SWAP_OFFER_PREFIX + `?accountId=${accountIds[0]}`
    );
    console.log("getSwapOfferInfo log - 1 : ", _getSwapOfferResult);

    if (_getSwapOfferResult && _getSwapOfferResult.data.result) {
      const _tempSwapOfferData = _getSwapOfferResult.data.data;

      for (let i = 0; i < _tempSwapOfferData.length; i++) {
        const _filter = {
          collectionOneSwapId: _tempSwapOfferData[i].collectionOneSwapId,
          collectionTwoSwapId: _tempSwapOfferData[i].collectionTwoSwapId,
        };
        const _findResult = filterObject(_newSwapOfferInfo, _filter);

        if (_findResult.length === 0) {
          const _getSwapOfferResult1 = await global.getInfoResponse(
            env.SERVER_URL +
              env.GET_SINGLE_COLLECTION_PREFIX +
              `?swapId=${_tempSwapOfferData[i].collectionOneSwapId}`
          );
          console.log("getSwapOfferInfo log - 2 : ", _getSwapOfferResult1);
          const _getListedNftResult1 = await global.getInfoResponse(
            env.SERVER_URL +
              env.GET_LISTED_NFT_PREFIX +
              `?swapId=${_tempSwapOfferData[i].collectionOneSwapId}`
          );
          console.log("getSwapOfferInfo log - 3 : ", _getListedNftResult1);

          const _tempNftData1 = _getListedNftResult1.data.data;
          let _collectionNfts1 = [];
          let _totalFloorPrice1 = 0;
          for (let j = 0; j < _tempNftData1.length; j++) {
            const _singleNftInfo = await getNftInfo(
              _tempNftData1[j].tokenId,
              _tempNftData1[j].serialNum
            );
            _totalFloorPrice1 += _singleNftInfo.floorPrice;
            _collectionNfts1.push(_singleNftInfo);
          }

          const _getSwapOfferResult2 = await global.getInfoResponse(
            env.SERVER_URL +
              env.GET_SINGLE_COLLECTION_PREFIX +
              `?swapId=${_tempSwapOfferData[i].collectionTwoSwapId}`
          );
          console.log("getSwapOfferInfo log - 4 : ", _getSwapOfferResult2);
          const _getListedNftResult2 = await global.getInfoResponse(
            env.SERVER_URL +
              env.GET_LISTED_NFT_PREFIX +
              `?swapId=${_tempSwapOfferData[i].collectionTwoSwapId}`
          );
          console.log("getSwapOfferInfo log - 5 : ", _getListedNftResult2);

          const _tempNftData2 = _getListedNftResult2.data.data;
          let _collectionNfts2 = [];
          let _totalFloorPrice2 = 0;
          for (let j = 0; j < _tempNftData2.length; j++) {
            const _singleNftInfo = await getNftInfo(
              _tempNftData2[j].tokenId,
              _tempNftData2[j].serialNum
            );
            _totalFloorPrice2 += _singleNftInfo.floorPrice;
            _collectionNfts2.push(_singleNftInfo);
          }

          _newSwapOfferInfo.push({
            collectionOneSwapId: _tempSwapOfferData[i].collectionOneSwapId,
            collectionTwoSwapId: _tempSwapOfferData[i].collectionTwoSwapId,
            collectionOneInfo: {
              accountId: _getSwapOfferResult1.data.data[0].accountId,
              swapId: _getSwapOfferResult1.data.data[0].swapId,
              nftCount: _getSwapOfferResult1.data.data[0].nftCount,

              offerType: _getSwapOfferResult1.data.data[0].offerType,
              offerHbar: _getSwapOfferResult1.data.data[0].offerHbar,
              memoStr: _getSwapOfferResult1.data.data[0].memoStr,
              isListed: _getSwapOfferResult1.data.data[0].isListed,

              offerCount: _getSwapOfferResult1.data.data[0].offerCount,
              totalFloorPrice: _totalFloorPrice1,
              nfts: _collectionNfts1,
            },
            collectionTwoInfo: {
              accountId: _getSwapOfferResult2.data.data[0].accountId,
              swapId: _getSwapOfferResult2.data.data[0].swapId,
              nftCount: _getSwapOfferResult2.data.data[0].nftCount,

              offerType: _getSwapOfferResult2.data.data[0].offerType,
              offerHbar: _getSwapOfferResult2.data.data[0].offerHbar,
              memoStr: _getSwapOfferResult2.data.data[0].memoStr,
              isListed: _getSwapOfferResult2.data.data[0].isListed,

              offerCount: _getSwapOfferResult2.data.data[0].offerCount,
              totalFloorPrice: _totalFloorPrice2,
              nfts: _collectionNfts2,
            },
          });
        }
      }
      console.log("getSwapOfferInfo log - 6 : ", _newSwapOfferInfo);
      setSwapOfferInfo(_newSwapOfferInfo);
      setRefreshFlag(!refreshFlag);
    }

    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // get collection from DB
  const [dbCollectionInfo, setDbCollectionInfo] = useState([]);

  //get collection and sub nft info from server
  const getDbCollectionData = async (skipCount_, prevInfo_) => {
    setLoadingView(true);
    let _newDbCollectionInfo = prevInfo_;

    const _getDbCollectionResult = await global.getInfoResponse(
      env.SERVER_URL +
        env.GET_COLLECTION_PREFIX +
        `?limitCount=${MAX_NFT_PER_PAGE}&skipCount=${skipCount_}`
    );
    console.log("getDbCollectionData log - 1 : ", _getDbCollectionResult);

    if (_getDbCollectionResult && _getDbCollectionResult.data.result) {
      const _tempCollectionData = _getDbCollectionResult.data.data;

      for (let i = 0; i < _tempCollectionData.length; i++) {
        const _filter = { swapId: _tempCollectionData[i].swapId };
        const _findResult = filterObject(_newDbCollectionInfo, _filter);

        const _getListedNftResult = await global.getInfoResponse(
          env.SERVER_URL +
            env.GET_LISTED_NFT_PREFIX +
            `?swapId=${_tempCollectionData[i].swapId}`
        );
        if (_findResult.length === 0) {
          console.log("getDbCollectionData log - 2 : ", _getListedNftResult);

          if (
            _getListedNftResult &&
            _getListedNftResult.data.result &&
            _tempCollectionData[i].isListed
          ) {
            const _tempNftData = _getListedNftResult.data.data;
            let _collectionNfts = [];
            let _totalFloorPrice = 0;
            for (let j = 0; j < _tempNftData.length; j++) {
              const _singleNftInfo = await getNftInfo(
                _tempNftData[j].tokenId,
                _tempNftData[j].serialNum
              );
              _totalFloorPrice += _singleNftInfo.floorPrice;
              _collectionNfts.push(_singleNftInfo);
            }
            _newDbCollectionInfo.push({
              swapLink:
              "http://95.217.98.125:3000/swap/"  + _tempCollectionData[i]._id,
              accountId: _tempCollectionData[i].accountId,
              swapId: _tempCollectionData[i].swapId,
              nftCount: _tempCollectionData[i].nftCount,
              offerCount: _tempCollectionData[i].offerCount,
              offerType: _tempCollectionData[i].offerType,
              isListed: _tempCollectionData[i].isListed,
              totalFloorPrice: _totalFloorPrice,
              nfts: _collectionNfts,
            });
          }
        }
      }
      console.log("getDbCollectionData log - 3 : ", _newDbCollectionInfo);
      setDbCollectionInfo(_newDbCollectionInfo);
      setRefreshFlag(!refreshFlag);
    }
    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // my NFT collection view dialog
  const [myCollectionDlgView, setMyCollectionDlgView] = useState(false);

  // close my NFT collection view dialog
  const onCloseMyCollectionDlg = () => {
    setMyCollectionDlgView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // collection swap dialog
  const [collectionSwapDlgView, setCollectionSwapDlgView] = useState(false);

  const onCloseCollectionSwapDlg = () => {
    setCollectionSwapDlgView(false);
  };

  const onClickSwapRequest = async () => {
    console.log("onClickSwapRequest log - 1");

    setLoadingView(true);

    const _postData = {
      accountId: accountIds[0],
      collectionOneSwapId: swapCollection1.swapId,
      collectionTwoSwapId: swapCollection2.swapId,
    };

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.ADD_NEW_SWAP_OFFER_PREFIX,
      _postData
    );
    console.log("onClickSwapRequest log - 2 : ", _postResult);
    if (!_postResult.data.result) {
      toast.error(_postResult.data.error);
      setLoadingView(false);
      return;
    }

    let _tempDbCollectionInfo = dbCollectionInfo;
    for (let i = 0; i < _tempDbCollectionInfo.length; i++) {
      if (_tempDbCollectionInfo[i].swapId === swapCollection1.swapId) {
        _tempDbCollectionInfo[i].offerCount =
          parseInt(_tempDbCollectionInfo[i].offerCount) + 1;
      }
    }

    setDbCollectionInfo(_tempDbCollectionInfo);
    setMyCollectionDlgView(false);
    setCollectionSwapDlgView(false);
    setRefreshFlag(!refreshFlag);

    toast.success("Create swap offer successful!");
    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // collections to swap
  const [swapCollection1, setSwapCollection1] = useState({});
  const [swapCollection2, setSwapCollection2] = useState({});
  const [swapOfferType, setSwapOfferType] = useState({});
  const onClickSwapOfferButton = async (
    swapId_,
    collectionType_,
    offerType_
  ) => {
    setSwapOfferType(offerType_);
    if (collectionType_ == COLLECTION_TYPE_3) {
      handleClickMessage(swapId_);
      return;
    }
    console.log("onClickSwapOfferButton log - 1 : ", swapId_);
    setLoadingView(true);
    if (!accountIds) {
      toast.warning("To swap NFTs, you need to connect wallet.");
      setLoadingView(true);
      return;
    }

    const collectionResult = await global.getInfoResponse(
      env.SERVER_URL + env.GET_IF_COLLECTION_PREFIX + `?swapId=${swapId_}`
    );
    if (
      !collectionResult.data.result ||
      collectionResult.data.data.length <= 0
    ) {
      setLoadingView(true);
      return;
    }

    const _findResult = collectionResult.data.data;

    console.log("onClickSwapOfferButton log - 2 : ", _findResult);

    let _collectionNfts = [];
    let _totalFloorPrice = 0;
    const _getListedNftResult = await global.getInfoResponse(
      env.SERVER_URL + env.GET_LISTED_NFT_PREFIX + `?swapId=${swapId_}`
    );
    if (_getListedNftResult && _getListedNftResult.data.result) {
      const _tempNftData = _getListedNftResult.data.data;
      for (let j = 0; j < _tempNftData.length; j++) {
        const _singleNftInfo = await getNftInfo(
          _tempNftData[0].tokenId,
          _tempNftData[0].serialNum
        );
        _totalFloorPrice += _singleNftInfo.floorPrice;
        _collectionNfts.push(_singleNftInfo);
      }
    }
    _findResult[0].totalFloorPrice = _totalFloorPrice;
    _findResult[0].nfts = _collectionNfts;

    if (
      _findResult[0].accountId === accountIds[0] &&
      collectionType_ === COLLECTION_TYPE_1
    ) {
      toast.warning("This NFT collection is yours.");
      setLoadingView(false);
      return;
    }

    if (collectionType_ === COLLECTION_TYPE_1) {
      setMyCollectionDlgView(true);
      getWalletNftData(null, accountIds[0], []);
      setSwapCollection1(_findResult[0]);
      setSwapCollection2({});
    } else if (collectionType_ === COLLECTION_TYPE_2) {
      setMyCollectionDlgView(false);
      console.log(
        "onClickSwapOfferButton log - 3 : ",
        swapCollection1,
        _findResult[0]
      );
      setSwapCollection2(_findResult[0]);
      setCollectionSwapDlgView(true);
    }
    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // get NFT from wallet
  const [nextLinkOfGetWalletNft, setNextLinkOfGetWalletNft] = useState(null);
  const [walletNftInfo, setWalletNftInfo] = useState([]);
  const [tickedNftInfo, setTickedNftInfo] = useState([]);
  const [collectionSwapPrice, setCollectionSwapPrice] = useState("");

  // get wallet nft information
  const getWalletNftData = async (nextLink_, accountId_, prevInfo_) => {
    console.log("getWalletNftData log - 0 : ", nextLink_, accountId_);
    setLoadingView(true);
    let _urlStr;
    if (nextLink_) _urlStr = env.MIRROR_NET_URL + nextLink_;
    else
      _urlStr =
        env.MIRROR_NET_URL + env.GET_ACCOUNT_PREFIX + accountId_ + "/nfts";

    let _newWalletNftInfo = prevInfo_;
    const _WNinfo = await global.getInfoResponse(_urlStr);

    if (_WNinfo && _WNinfo.data.nfts.length > 0) {
      console.log("getWalletNftData log - 1 : ", _WNinfo.data);
      setNextLinkOfGetWalletNft(_WNinfo.data.links.next);

      for (let i = 0; i < _WNinfo.data.nfts.length; i++) {
        const _filter = {
          tokenId: _WNinfo.data.nfts[i].token_id,
          serialNum: _WNinfo.data.nfts[i].serial_number,
        };
        const _findResult = filterObject(_newWalletNftInfo, _filter);
        // console.log("getWalletNftData log - 2 : ", _findResult);

        if (_findResult.length === 0) {
          const _singleNftInfo = await getNftInfo(
            _WNinfo.data.nfts[i].token_id,
            _WNinfo.data.nfts[i].serial_number
          );
          // console.log("getWalletNftData log - 3 : ", _singleNftInfo);

          if (_singleNftInfo) {
            _newWalletNftInfo.push({
              tokenId: _singleNftInfo.tokenId,
              serialNum: _singleNftInfo.serialNum,
              creator: _singleNftInfo.creator,
              name: _singleNftInfo.name,
              imgUrl: _singleNftInfo.imgUrl,
              fallback: _singleNftInfo.fallback,
              ticked: false,
            });
          }
        }
      }

      console.log("getWalletNftData log - 4 : ", _newWalletNftInfo);
      setWalletNftInfo(_newWalletNftInfo);
      setRefreshFlag(!refreshFlag);
    }
    setLoadingView(false);
  };

  //--------------------------------------------------------------------------------------------------

  // on select wallet nft card
  const selectWalletNft = (tokenId_, serialNum_) => {
    // console.log("selectWalletNft log - 1 : ", tokenId_, serialNum_);

    setLoadingView(true);
    const _tickedFilter = { ticked: true };
    const _findTickedResult = filterObject(walletNftInfo, _tickedFilter);
    const _currentFilter = { tokenId: tokenId_, serialNum: serialNum_ };
    const _findCurrentResult = filterObject(walletNftInfo, _currentFilter);

    if (
      !_findCurrentResult[0].ticked &&
      _findTickedResult.length >= LIMIT_NFT_TICK_COUNT
    ) {
      toast.warning("The maximum number of selectable NFTs is 7.");
      return;
    }

    let _newWalletNftInfo = walletNftInfo;

    for (let i = 0; i < _newWalletNftInfo.length; i++) {
      if (
        _newWalletNftInfo[i].tokenId === tokenId_ &&
        _newWalletNftInfo[i].serialNum === serialNum_
      ) {
        _newWalletNftInfo[i].ticked = !_newWalletNftInfo[i].ticked;
        break;
      }
    }

    setWalletNftInfo(_newWalletNftInfo);
    setLoadingView(false);
    setRefreshFlag(!refreshFlag);
  };

  const onClickListNfts = () => {
    if (!accountIds) {
      toast.warning("You have to wallet connect!");
      setLoadingView(false);
      return;
    }

    const _tickedFilter = { ticked: true };
    const _findTickedResult = filterObject(walletNftInfo, _tickedFilter);
    console.log("listSelectedNft log - 2 : ", _findTickedResult);

    if (_findTickedResult.length === 0) {
      toast.warning("No NFT selected!");
      setLoadingView(false);
      return;
    }

    setTickedNftInfo(_findTickedResult);
    setListCollectionDialogView(true);
  };

  const confirmOffer = (offerType, isListed) => {
    listSelectedNft(offerType, isListed).then((postResult) => {
      postResult.data.result &&
        onClickSwapOfferButton(postResult.data.data, COLLECTION_TYPE_2);
    });
  };
  // list selected wallet nfts
  const listSelectedNft = async (offerType = 0, isListed = 0) => {
    try {
      if (offerType == -1) {
        toast("At least one option must be selected.");
        return;
      }
      setLoadingView(true);
      console.log("listSelectedNft log - 1", offerType, isListed);

      if (!accountIds) {
        toast.warning("You have to wallet connect!");
        setLoadingView(false);
        return;
      }

      const _tickedFilter = { ticked: true };
      const _findTickedResult = filterObject(walletNftInfo, _tickedFilter);
      console.log("listSelectedNft log - 2 : ", _findTickedResult);

      if (
        _findTickedResult.length === 0 &&
        (isListed || (!isListed && offerType != 1))
      ) {
        toast.warning("No NFT selected!");
        setLoadingView(false);
        return;
      }

      if (isListed) setListCollectionDialogView(false);
      else setMyCollectionDlgView(false);

      let _totalFallback = 0;
      for (let i = 0; i < _findTickedResult.length; i++) {
        _totalFallback += _findTickedResult[i].fallback;
        const _associateCheckResult = await global.postInfoResponse(
          env.SERVER_URL + env.SWAP_ASSOCIATE_CHECK_PREFIX,
          { tokenId: _findTickedResult[i].tokenId }
        );

        if (!_associateCheckResult || !_associateCheckResult.data.result) {
          toast.error(
            "A problem occurred during the token associate. Please try again."
          );
          setLoadingView(false);
          return;
        }
      }

      let _listPrice =
        (isListed ? parseFloat(LIST_NFT_PRICE) : 0) +
        parseFloat(_totalFallback) +
        parseFloat(offerHbar);
      console.log("listSelectedNft log - 3 : ", _totalFallback, _listPrice);

      let _transactionResult = null;

      if (!isListed && offerType == 1)
        _transactionResult = await sendHbarToTreasury(_listPrice);
      else
        _transactionResult = await sendHbarAndMultiNftsToTreasury(
          _findTickedResult,
          _listPrice
        );

      if (!_transactionResult) {
        toast.error("A problem occurred. Please try again.");
        setLoadingView(false);
        return;
      }

      const _postData = {
        accountId: accountIds[0],
        nftInfo: _findTickedResult,
        offerType: offerType,
        isListed: isListed,
        offerHbar: offerHbar,
        fallback: _totalFallback,
      };

      const _postResult = await global.postInfoResponse(
        env.SERVER_URL + env.LIST_NEW_NFTS_PREFIX,
        _postData
      );
      console.log("listSelectedNft log - 6 : ", _postResult);

      if (!_postResult || !_postResult.data.result) {
        toast.error("A problem occurred. Please try again.");
        setLoadingView(false);
        setListCollectionDialogView(false);
        return;
      }

      const _untickedFilter = { ticked: false };
      const _findUntickedResult = filterObject(walletNftInfo, _untickedFilter);
      console.log("listSelectedNft log - 7 : ", _findTickedResult);

      setWalletNftInfo(_findUntickedResult);
      setRefreshFlag(!refreshFlag);
      toast.success("Selected NFTs successfully listed!");

      setLoadingView(false);
      return _postResult;
    } catch (e) {
      setLoadingView(false);
      return;
    }
  };

  //--------------------------------------------------------------------------------------------------

  const onClickApproveOfferBtn = async (offerInfo_) => {
    setLoadingView(true);
    console.log("onClickApproveOfferBtn log - 1 : ", offerInfo_);

    if (!accountIds) return;

    const _postData = {
      accountId: accountIds[0],
      collectionOneSwapId: offerInfo_.collectionOneInfo.swapId,
      collectionTwoSwapId: offerInfo_.collectionTwoInfo.swapId,
    };

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.APPROVE_SWAP_OFFER_PREFIX,
      _postData
    );
    console.log("onClickApproveOfferBtn log - 2 : ", _postResult);
    if (!_postResult || !_postResult.data.result) {
      toast.error(_postResult.data.error);
      setLoadingView(false);
      return;
    }
    await getSwapOfferInfo([]);
    toast.success("Swap offer successful!");
    setLoadingView(false);
  };

  const onClickDeleteOfferBtn = async (offerInfo_) => {
    setLoadingView(true);
    console.log("onClickDeleteOfferBtn log - 1 : ", offerInfo_);

    if (!accountIds) return;

    const _postData = {
      accountId: accountIds[0],
      collectionOneSwapId: offerInfo_.collectionOneInfo.swapId,
      collectionTwoSwapId: offerInfo_.collectionTwoInfo.swapId,
    };

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.DELETE_SWAP_OFFER_PREFIX,
      _postData
    );
    console.log("onClickDeleteOfferBtn log - 2 : ", _postResult);
    if (!_postResult || !_postResult.data.result) {
      toast.error(_postResult.data.error);
      setLoadingView(false);
      return;
    }
    await getSwapOfferInfo([]);
    toast.success("Delete offer successful!");
    setLoadingView(false);
  };

  //==================================================================================================
  // basic functions

  // sleep
  const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // associate check
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

  // check target_ contains filter_
  // filter_ : { tokenId: "0.0.123456", serialNum: "123" };
  const filterObject = (target_, filter_) => {
    const _result = target_.filter(function (item) {
      for (var key in filter_) {
        if (item[key] === undefined || item[key] !== filter_[key]) return false;
      }
      return true;
    });
    return _result;
  };

  // get nft information from mirrornode
  const getNftInfo = async (tokenId_, serialNum_) => {
    let _nftInfo;
    let _fallback = 0;

    const _getNftFee = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}`
    );
    // console.log("getNftInfo log - 1 : ", _getNftFee);
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
      console.log("getNftInfo log - 1 : ", _floorPrice);
    }

    const _singleNftInfo = await global.getInfoResponse(
      `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenId_}/nfts?serialNumber=${serialNum_}`
    );
    // console.log("getNftInfo log - 1 : ", _singleNftInfo);
    if (_singleNftInfo && _singleNftInfo.data.nfts.length > 0) {
      let _preMdUrl = base64ToUtf8(_singleNftInfo.data.nfts[0].metadata).split(
        "//"
      );
      // console.log("getNftInfo log - 2 : ", _preMdUrl);

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
          tokenId: _tokenId,
          serialNum: _serialNum,
          creator: _creator,
          name: _name,
          imgUrl: _imgUrl,
          fallback: _fallback,
          floorPrice: _floorPrice,
        };
      }
    }
    return _nftInfo;
  };

  // convert metadata base64 string to utf8
  const base64ToUtf8 = (base64Str_) => {
    // create a buffer
    const _buff = Buffer.from(base64Str_, "base64");

    // decode buffer as UTF-8
    const _utf8Str = _buff.toString("utf-8");

    return _utf8Str;
  };

  //==================================================================================================

  // get scroll touch bottm event
  const handleContainerOnBottom = useCallback(() => {
    if (dispFromValue === FROM_WALLET) {
      if (accountIds.length > 0)
        getWalletNftData(nextLinkOfGetWalletNft, accountIds[0], walletNftInfo);
    }
  }, [dispFromValue, walletNftInfo, nextLinkOfGetWalletNft]);

  const containerRef = useBottomScrollListener(handleContainerOnBottom);

  //==================================================================================================

  const [offerHbar, setOfferHbar] = useState(0);
  const [memoList, setMemoList] = useState([]);
  const [memoContent, setMemoContent] = useState("");
  const [memoSwapId, setMemoSwapId] = useState("");
  const [memoActive, setMemoActive] = useState(true);

  const handleMemoChange = (e) => {
    setMemoContent(e.target.value);
  };

  const handleSendMemo = async () => {
    console.log(String(memoContent), String(memoContent).length);
    if (memoContent == "" || memoContent == "\n") {
      toast.warning("Write message");
      setMemoContent("");
      return;
    }

    let swapId = memoSwapId;
    let tempList = [];
    const singleCollection = await global.getInfoResponse(
      env.SERVER_URL + env.GET_SINGLE_COLLECTION_PREFIX + `?swapId=${swapId}`
    );

    if (singleCollection.data.result) {
      tempList = singleCollection.data.data[0].memoStr.split(",");
    }

    tempList.push(accountIds[0] + ":" + memoContent);

    const _postResult = await global.postInfoResponse(
      env.SERVER_URL + env.UPDATE_SINGLE_COLLECTION_PREFIX,
      { query: { swapId: memoSwapId }, update: { memoStr: String(tempList) } }
    );
    if (_postResult.data.result) {
      // setCollectionMessageDlgView(false);
    }

    setMemoList(tempList);
    setMemoContent("");
  };

  const keyMemoChange = (e) => {
    if (e.key == "Enter") {
      handleSendMemo();
    }
  };

  const handleClickMessage = async (swapId) => {
    setCollectionMessageDlgView(true);
    setMemoSwapId(swapId);

    const singleCollection = await global.getInfoResponse(
      env.SERVER_URL + env.GET_SINGLE_COLLECTION_PREFIX + `?swapId=${swapId}`
    );

    if (singleCollection.data.result) {
      setMemoActive(accountIds[0] == singleCollection.data.data[0].accountId);
      setMemoList(singleCollection.data.data[0].memoStr.split(","));
    }
  };

  const onCloseCollectionMessageDlg = async () => {
    setCollectionMessageDlgView(false);
  };

  const handleHbarChange = (prop) => (event) => {
    console.log(event.target.value);
    setOfferHbar(event.target.value);
  };

  const dispatch = useDispatch();
  const [hidden, setHidden] = React.useState("");
  const [open, setOpen] = React.useState(true);
  const [searchValue, setSearchValue] = useState("");

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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

      if (dispFromValue === FROM_WALLET && accountIds?.length > 0) {
        getWalletNftData(null, accountIds[0], [], e.target.value);
      } else if (dispFromValue === FROM_ACTIVE) {
        getDbCollectionData(0, [], e.target.value);
      } else if (dispFromValue === FROM_OFFERS) {
        getSwapOfferInfo([], e.target.value);
      } else if (dispFromValue === FROM_CLAIM) {
        getClaimCollectionInfo([], e.target.value);
      }
    }
  };

  //=============================================================================================

  const drawerWidth = 240;

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      right: "30px",
      top: "-30px",
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
      <div className="swap-container">
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
            className={`disp-page-tab`}
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
              icon={<SwapHorizIcon className="PreviousIcon" />}
              aria-label="PREVIOUS"
              tabIndex="2"
            />
            <Tab
              className={dispTabValue == 3 ? "active" : ""}
              icon={<div className="ClaimIcon" />}
              aria-label="CLAIM"
              value="3"
            ></Tab>
            {claimCount && (
              <StyledBadge
                color="secondary"
                badgeContent={claimCount}
              ></StyledBadge>
            )}
            <Tab
              className={dispTabValue == 4 ? "active" : ""}
              icon={<div class="RedirectIcon" />}
              aria-label="REDIRECT"
              value="4"
            ></Tab>
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

        <div ref={containerRef} className="swap-wrapper">
          <div className="swap-page-header">
            <h1 className="page-title">
              {dispFromValue === FROM_ACTIVE
                ? "NFT SWAP"
                : dispFromValue === FROM_WALLET
                ? "WALLET"
                : dispFromValue === FROM_OFFERS
                ? "OFFERS"
                : "CLAIM"}
            </h1>
          </div>
          {dispFromValue === FROM_ACTIVE && (
            <div className="page-description">
              <CheckCircleIcon />
              <p>Easy, Fast & Secure!</p>
            </div>
          )}

          <div class={`search-sort-bar ${hidden}`} style={{ margin: `5px ${nftCardMargin}px` }}>
            <div className="vertical-navigation">
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
              {accountIds?.length > 0 && dispFromValue === FROM_WALLET && (
                <div className="list-button-wrapper">
                  <Button onClick={() => onClickListNfts()}>LIST</Button>
                </div>
              )}
              <RefreshIcon
                className="refresh-data-button"
                onClick={() => onClickRefreshData()}
              />
            </div>
          </div>

          {dispFromValue === FROM_ACTIVE && (
            <div className="active-nft-wrapper">
              {dbCollectionInfo.length > 0 &&
                dbCollectionInfo.map((item_, index_) => {
                  return (
                    <ListedCollectionCard
                      collectionInfo={item_}
                      cardMargin={nftCardMargin}
                      collectionType={COLLECTION_TYPE_1}
                      onClickSwapOfferButton={onClickSwapOfferButton}
                    />
                  );
                })}
              {dbCollectionInfo.length === 0 && <h1>No NFTs to display!</h1>}
            </div>
          )}
          {dispFromValue === FROM_WALLET && (
            <div className="wallet-nft-wrapper">
              {walletNftInfo.length > 0 &&
                walletNftInfo.map((item_, index_) => {
                  return (
                    <WalletNftCard
                      singleNftInfo={item_}
                      nftCardMargin={nftCardMargin}
                      selectWalletNft={selectWalletNft}
                    />
                  );
                })}
              {!accountIds && <h1>Connect Wallet!</h1>}
              {accountIds?.length > 0 && walletNftInfo.length === 0 && (
                <h1>No NFTs to display!</h1>
              )}
            </div>
          )}
          {dispFromValue === FROM_OFFERS && (
            <div className="swap-offer-wrapper">
              {accountIds?.length > 0 &&
                swapOfferInfo.length > 0 &&
                swapOfferInfo.map((item_, index_) => {
                  return (
                    <div
                      className="single-swap-offer"
                      style={{ margin: `5px ${swapOfferCardMargin}px` }}
                    >
                      {/* {item_.collectionOneInfo.accountId !== accountIds[0] && (
                        <h1>Pending</h1>
                      )} */}
                      <div>
                        <ListedCollectionCard
                          collectionInfo={item_.collectionOneInfo}
                          cardMargin={0}
                          collectionType={COLLECTION_TYPE_3}
                          onClickSwapOfferButton={onClickSwapOfferButton}
                          swapId={item_.collectionTwoInfo.swapId}
                        />

                        <ListedCollectionCard
                          collectionInfo={item_.collectionTwoInfo}
                          cardMargin={0}
                          collectionType={COLLECTION_TYPE_3}
                          onClickSwapOfferButton={onClickSwapOfferButton}
                          swapId={item_.collectionTwoInfo.swapId}
                        />
                      </div>
                      {
                        <div class="offer-button-wrapper">
                          <SwapVerticalCircleIcon
                            className="offer-svg"
                            onClick={() => onClickApproveOfferBtn(item_)}
                          />
                          <Button
                            className="swap-button"
                            onClick={() =>
                              onClickSwapOfferButton(
                                item_.collectionTwoInfo.swapId,
                                COLLECTION_TYPE_3
                              )
                            }
                          >
                            <MessageIcon />
                          </Button>
                          <Button
                            className="delete-offer-button"
                            onClick={() => onClickDeleteOfferBtn(item_)}
                          >
                            Delete Offer
                          </Button>
                        </div>
                      }
                    </div>
                  );
                })}
              {!accountIds && <h1>Connect Wallet!</h1>}
              {accountIds?.length > 0 && swapOfferInfo.length === 0 && (
                <h1>No offers to display!</h1>
              )}
            </div>
          )}
          {dispFromValue === FROM_CLAIM && (
            <div className="swap-claim-wrapper">
              {accountIds?.length > 0 &&
                claimCollectionInfo.length > 0 &&
                claimCollectionInfo.map((item_, index_) => {
                  return (
                    <ListedCollectionCard
                      collectionInfo={item_}
                      cardMargin={nftCardMargin}
                      collectionType={COLLECTION_TYPE_4}
                      onClickSwapOfferButton={onClickClaimCollectionButton}
                    />
                  );
                })}
              {!accountIds && <h1>Connect Wallet!</h1>}
              {accountIds?.length > 0 && claimCollectionInfo.length === 0 && (
                <h1>No NFTs to display!</h1>
              )}
            </div>
          )}
        </div>
      </div>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => (loadingView ? theme.zIndex.drawer + 1 : -1),
          backgroundColor: "#000",
        }}
        open={loadingView}
      >
        <img alt="" src={require("../../assets/imgs/loading.gif")} />
      </Backdrop>

      <Dialog
        className="collection-message-dialog"
        open={collectionMessageDlgView}
        onClose={onCloseCollectionMessageDlg}
        scroll="body"
      >
        <div class="message-content">
          {memoList &&
            memoList.length > 0 &&
            memoList.map((item, index) => {
              return item ? (
                <div>
                  <p style={{ color: "gray" }}>{item.split(":")[0]}</p>
                  <p style={{ marginLeft: "10px" }}>{item.split(":")[1]}</p>
                </div>
              ) : (
                <div></div>
              );
            })}
        </div>
        <div className="chatting-input-wrapper">
          <Textarea
            className="collection-memo"
            onChange={handleMemoChange}
            onKeyUp={keyMemoChange}
            value={memoContent}
            // disabled={!memoActive}
            placeholder="Write here"
          ></Textarea>
          <SendIcon onClick={() => handleSendMemo()} />
          <p style={{ color: "red" }}>
            You are {accountIds?.length ? accountIds[0] : "Unknown"}
          </p>
        </div>
      </Dialog>

      <Dialog
        className="my-nft-collection-view-dialog"
        fullScreen={true}
        open={myCollectionDlgView}
        onClose={onCloseMyCollectionDlg}
        scroll="body"
      >
        <div className="collection-wrapper">
          <div className="collection-header">
            {swapCollection1.offerType > 0 && (
              <Input
                id="standard-adornment-amount"
                onChange={handleHbarChange()}
                placeholder="HBAR"
              />
            )}
            {(swapCollection1.offerType != 0 || walletNftInfo.length > 0) && (
              <div className="list-button-wrapper">
                <Button
                  onClick={() => confirmOffer(swapCollection1.offerType, 0)}
                >
                  CONFIRM
                </Button>
              </div>
            )}
          </div>
          <div className="nft-collection-wrapper">
            {walletNftInfo.length > 0 &&
              swapCollection1.offerType != 1 &&
              walletNftInfo.map((item_, index_) => {
                return (
                  <WalletNftCard
                    singleNftInfo={item_}
                    nftCardMargin={nftCardMargin}
                    selectWalletNft={selectWalletNft}
                  />
                );
              })}
            {accountIds?.length > 0 &&
              swapCollection1.offerType != 1 &&
              walletNftInfo.length === 0 && (
                <h1>You don't have any NFT(s) to swap</h1>
              )}
          </div>
        </div>
        <div className="footer-wrapper">
          <img src={require("assets/imgs/navigation/logo.png")}></img>
          <Button onClick={onCloseMyCollectionDlg}>
            <CloseIcon />
          </Button>
        </div>
      </Dialog>

      <Dialog
        className="collection-swap-dialog"
        open={collectionSwapDlgView}
        onClose={onCloseCollectionSwapDlg}
        scroll="body"
      >
        <div className="collection-wrapper offer">
          <ListedCollectionCard
            collectionInfo={swapCollection1}
            cardMargin={10}
            collectionType={COLLECTION_TYPE_3}
          />
          <ListedCollectionCard
            collectionInfo={swapCollection2}
            cardMargin={10}
            collectionType={COLLECTION_TYPE_3}
          />
          <Button className="swap-button" onClick={onClickSwapRequest}>
            <SwapHorizIcon />
          </Button>
        </div>
      </Dialog>

      <Dialog
        className="list-new-dialog"
        open={listCollectionDialogView}
        onClose={() => {
          setListCollectionDialogView(false);
        }}
      >
        <OfferNftCard
          tickedNftInfo={tickedNftInfo}
          cardMargin={10}
          onConfirmList={(offerType) => listSelectedNft(offerType, 1)}
        ></OfferNftCard>
      </Dialog>

      <Dialog
        open={firstPopUpDlgView}
        onClose={() => setFirstPopUpDlgView(false)}
      >
        <PenguDialog
          titleText={penguDialogTitleStr}
          contentText={penguDialogContentStr}
          agreeBtnStr={penguDialogAgreeBtnStr}
          dialogType={penguDialogType}
          onClickDialogAgreeBtn={() => setFirstPopUpDlgView(false)}
          onClickDialogCloseBtn={() => {}}
        />
      </Dialog>
      <audio ref={audioPlayer} src={NotificationSound} />
      <ToastContainer autoClose={3000} draggableDirection="x" />
    </>
  );
}

export default Swap;
