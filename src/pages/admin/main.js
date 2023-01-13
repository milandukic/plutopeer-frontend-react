import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, Modal, Input } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useHistory } from "react-router-dom";

import HashPackConnectModal from "../../components/HashPackConnectModal.js";
import { useHashConnect } from "../../assets/api/HashConnectAPIProvider.tsx";

import * as global from "../../global";
import * as env from "../../env";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const INFO_TEXT_STYLE = {
  fontFamily: "Bebas Neue, Balsamiq Sans",
  fontSize: "18px",
  color: "white",
  margin: "0 0 5px",
};

const DEFAULT_LINE_STYLE = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  margin: "10px 0",
};

const DEFAULT_INPUT_STYLE = {
  width: "140px",
  marginLeft: "20px",
  padding: "2px 10px",
  borderRadius: "12px",
  border: "3px solid #6000ff",
  color: "gray",
  fontSize: "18px",
  "&:after": {
    display: "none",
  },
};

const DEFAULT_TEXT_STYLE = {
  width: "420px",
  fontFamily: "Bebas Neue, Balsamiq Sans",
  fontSize: "24px",
  color: "white",
  margin: 0,
  textAlign: "right",
};

const DEFAULT_BUTTON_STYLE = {
  marginLeft: "20px",
  borderRadius: "5px",
  backgroundColor: "green",
  "&:hover": {
    backgroundColor: "green",
  },
  "&:focus": {
    outline: "none",
    backgroundColor: "green",
  },
};

function Main() {
  let history = useHistory();

  const [walletConnectModalViewFlag, setWalletConnectModalViewFlag] =
    useState(false);

  const { walletData, installedExtensions, connect, disconnect } =
    useHashConnect();
  const { accountIds } = walletData;

  const onClickWalletConnectModalClose = () => {
    setWalletConnectModalViewFlag(false);
  };

  const onClickOpenConnectModal = () => {
    setWalletConnectModalViewFlag(true);
    console.log("onClickOpenConnectModal log - 1 : ", walletData);
  };

  const onClickDisconnectHashPack = () => {
    disconnect();
    setWalletConnectModalViewFlag(false);
  };

  const onClickCopyPairingStr = () => {
    navigator.clipboard.writeText(walletData.pairingString);
  };

  const onClickConnectHashPack = () => {
    console.log("onClickConnectHashPack log - 1");
    if (installedExtensions) {
      connect();
      setWalletConnectModalViewFlag(false);
    } else {
      alert(
        "Please install hashconnect wallet extension first. from chrome web store."
      );
    }
  };

  useEffect(() => {
    console.log("account id changed!");
    if (!accountIds || accountIds[0] != "0.0.1466791") {
      history.push("/admin");
    }
  }, [accountIds]);

  const [blackTokenId, setBlackTokenId] = useState("");
  const [htsTokenId, setHTSTokenId] = useState("");
  const [hotTokenId, setHotTokenId] = useState("");
  const [raffleLink, setRaffleLink] = useState("");
  const [raffleDiscount, setRaffleDiscount] = useState("");

  const handleButtonClick = async (type) => {
    switch (type) {
      case "black":
        if (!blackTokenId) {
          console.log(type, blackTokenId);
          toast.warning("Input token id to add blacklist");
          return;
        }

        const blackInfo = await global.getInfoResponse(
          `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${blackTokenId}`
        );
        if (!blackInfo?.data) {
          toast.warning("This token doesn't exist");
          return;
        }

        const addBlackResult = await global.postInfoResponse(
          env.SERVER_URL + env.ADD_ONE_TO_ADMIN,
          { tokenId: blackTokenId }
        );

        console.log(addBlackResult);
        if (addBlackResult.data.result)
          toast.success("New token added to hts list");
        else toast.warning("Error, may be token alreday added to hts list");
        break;
      case "hts":
        if (!htsTokenId) {
          console.log(type, htsTokenId);
          toast.warning("Input token id to add hts");
          return;
        }

        const htsInfo = await global.getInfoResponse(
          `https://mainnet-public.mirrornode.hedera.com/api/v1/balances?account.id=${accountIds[0]}`
        );
        console.log(htsInfo);

        if (
          !htsInfo?.data ||
          htsInfo.data.balances.length <= 0 ||
          !htsInfo.data.balances[0].tokens.find(
            (item, index) => item.token_id == htsTokenId
          )
        ) {
          toast.warning("This token doesn't exist in your wallet");
          return;
        }

        const addHtsResult = await global.postInfoResponse(
          env.SERVER_URL + env.ADD_ONE_TO_ADMIN,
          { tokenId: htsTokenId, type: "hts" }
        );

        if (addHtsResult.data.result)
          toast.success("New token added to hts list");
        else toast.warning("Error, may be token alreday added to hts list");
        break;
      case "hot":
        if (!hotTokenId) {
          console.log(type, hotTokenId);
          toast.warning("Input token id to add blacklist");
          return;
        }

        const hotInfo = await global.getInfoResponse(
          `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${hotTokenId}`
        );
        if (!hotInfo?.data) {
          toast.warning("This token doesn't exist");
          return;
        }

        const addHotResult = await global.postInfoResponse(
          env.SERVER_URL + env.ADD_ONE_TO_ADMIN,
          { tokenId: raffleLink, type: "hot" }
        );

        console.log(addHotResult);
        if (addHotResult.data.result)
          toast.success("New token added to hot list");
        else
          toast.warning("Error, may be token alreday added to discount list");
        break;
      case "discount":
        if (!raffleLink || !raffleDiscount) {
          toast.warning("Input link or discount");
          return;
        }

        const addDiscountResult = await global.postInfoResponse(
          env.SERVER_URL + env.ADD_ONE_TO_ADMIN,
          { tokenId: raffleLink, type: "discount", value: raffleDiscount }
        );

        console.log(addDiscountResult);
        if (addDiscountResult.data.result)
          toast.success("New data added to discount list");
        else
        toast.success("New data updated to existing discount list");
        break;
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          alt="..."
          src={require("../../assets/imgs/deragods_logo.png")}
          style={{
            marginTop: "20vh",
            marginBottom: "5vh",
            width: "300px",
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
          }}
        >
          <Box sx={DEFAULT_LINE_STYLE}>
            <p style={DEFAULT_TEXT_STYLE}>BLACKLIST COLLECTION:</p>
            <Input
              placeholder="tokenid"
              sx={DEFAULT_INPUT_STYLE}
              value={blackTokenId}
              onChange={(e) => setBlackTokenId(e.target.value)}
            />
            <Button
              variant="contained"
              sx={DEFAULT_BUTTON_STYLE}
              onClick={() => handleButtonClick("black")}
            >
              <DoneIcon />
            </Button>
          </Box>
          <Box sx={DEFAULT_LINE_STYLE}>
            <p style={DEFAULT_TEXT_STYLE}>ADD HTS TOKEN:</p>
            <Input
              placeholder="tokenid"
              sx={DEFAULT_INPUT_STYLE}
              value={htsTokenId}
              onChange={(e) => setHTSTokenId(e.target.value)}
            />
            <Button
              variant="contained"
              sx={DEFAULT_BUTTON_STYLE}
              onClick={() => handleButtonClick("hts")}
            >
              <DoneIcon />
            </Button>
          </Box>
          <Box sx={DEFAULT_LINE_STYLE}>
            <p style={DEFAULT_TEXT_STYLE}>SET COLLECTION AS HOT FOR 24H:</p>
            <Input
              placeholder="tokenid"
              sx={DEFAULT_INPUT_STYLE}
              value={hotTokenId}
              onChange={(e) => setHotTokenId(e.target.value)}
            />
            <Button
              variant="contained"
              sx={DEFAULT_BUTTON_STYLE}
              onClick={() => handleButtonClick("hot")}
            >
              <DoneIcon />
            </Button>
          </Box>
          <Box sx={DEFAULT_LINE_STYLE}>
            <p style={DEFAULT_TEXT_STYLE}>SET RAFFLE DISCOUNT:</p>
            <Input
              placeholder="rafflelink"
              sx={DEFAULT_INPUT_STYLE}
              value={raffleLink}
              onChange={(e) => setRaffleLink(e.target.value)}
            />
            <Input
              placeholder="discount"
              sx={DEFAULT_INPUT_STYLE}
              value={raffleDiscount}
              onChange={(e) => setRaffleDiscount(e.target.value)}
            />
            <Button
              variant="contained"
              sx={DEFAULT_BUTTON_STYLE}
              onClick={() => handleButtonClick("discount")}
            >
              <DoneIcon />
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            left: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p style={INFO_TEXT_STYLE}>ONLINE USER NOW: 35</p>
          <p style={INFO_TEXT_STYLE}>WEEKLY VISITS: 650</p>
          <p style={INFO_TEXT_STYLE}>MONTHLY VISITS: 2500</p>
        </Box>
        <Button
          onClick={() => onClickOpenConnectModal()}
          variant="outlined"
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            borderRadius: "12px",
            border: "3px solid #6000ff",
            fontFamily: "Bebas Neue, Balsamiq Sans",
            fontSize: "16px",
            color: "white",
            "&:hover": {
              border: "3px solid #6000ff",
            },
            "&:focus": {
              border: "3px solid #6000ff",
              outline: "none",
            },
          }}
        >
          {accountIds?.length > 0 ? accountIds[0] : "SIGN"}
        </Button>
      </Box>
      <Modal
        open={walletConnectModalViewFlag}
        onClose={() => onClickWalletConnectModalClose()}
        centered={true}
      >
        <HashPackConnectModal
          pairingString={walletData.pairingString}
          connectedAccount={accountIds}
          onClickConnectHashPack={onClickConnectHashPack}
          onClickCopyPairingStr={onClickCopyPairingStr}
          onClickDisconnectHashPack={onClickDisconnectHashPack}
        />
      </Modal>
      <ToastContainer autoClose={3000} draggableDirection="x" />
    </>
  );
}

export default Main;
