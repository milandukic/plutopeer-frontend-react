import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItemText from "@mui/material/ListItemText";
import { Button } from "reactstrap";
import Modal from "@mui/material/Modal";
import * as global from "../../global";
import "./style.scss";

import HsahPackConnectModal from "components/HashPackConnectModal";
import { useHashConnect } from "../../assets/api/HashConnectAPIProvider.tsx";
import { useDispatch } from "react-redux";
import { isTypeOnlyImportOrExportDeclaration } from "typescript";
import { updateTokenPrices } from "../../store/apislice";

const mobileWidth = 870;

function MainNavbar(props) {
  console.log("MainNavbar***********", props);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [navbarVisible, setNavbarVisible] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const [walletConnectModalViewFlag, setWalletConnectModalViewFlag] =
    useState(false);
  const { walletData, installedExtensions, connect, disconnect } =
    useHashConnect();
  const { accountIds } = walletData;
  const dispatch = useDispatch();

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth]);

  const initData = async () => {
    const prices = await global.getInfoResponse(
      "https://api-lb.hashpack.app/prices"
    );
    if (!prices?.data?.prices) return;
    dispatch(updateTokenPrices(prices.data.prices));
  };

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

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setNavbarVisible({ ...navbarVisible, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      className="main-nav-list-wrapper"
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              alert("Coming soon...");
            }}
            className="list-button"
          >
            <img alt="..." src={require("assets/imgs/stake-icon.png")} />
            <ListItemText primary="stake" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              alert("Coming soon...");
            }}
            className="list-button"
          >
            <img alt="..." src={require("assets/imgs/portal-icon.png")} />
            <ListItemText primary="portal" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/raffle" className="list-button ">
            <img
              alt="..."
              src={require("assets/imgs/navigation/raffle-icon.png")}
            />
            <ListItemText primary="raffles" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              alert("Coming soon...");
            }}
            className="list-button"
          >
            <img alt="..." src={require("assets/imgs/dao-icon.png")} />
            <ListItemText primary="dao" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton             onClick={() => {
              alert("Coming soon...");
            }} className="list-button">
            <img alt="..." src={require("assets/imgs/swap-icon.png")} />
            <ListItemText primary="NFT swap" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              alert("Coming soon...");
            }}
            className="list-button"
          >
            <img alt="..." src={require("assets/imgs/loan-icon.png")} />
            <ListItemText primary="loans" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div className="main-nav-container">
      <div className="main-background"></div>
      <div className="main-nav-wrapper">
        <div className="nav-links">
          <Button
            className="main-nav-link"
            onClick={() => {
              alert("Coming soon...");
            }}
          >
            <img alt="..." src={require("assets/imgs/navigation/box.png")} />
          </Button>
        </div>
        <div className="nav-buttons">
          {windowWidth >= mobileWidth && (
            <div className="page-link-buttons">
              <Button
                className="main-nav-button"
                onClick={() => {
                  alert("Coming soon...");
                }}
              >
                <img alt="..." src={require("assets/imgs/stake-icon.png")} />
                <p>stake</p>
              </Button>
              <Button
                className="main-nav-button"
                onClick={() => {
                  alert("Coming soon...");
                }}
              >
                <img alt="..." src={require("assets/imgs/portal-icon.png")} />
                <p>portal</p>
              </Button>
              <Button href="/raffle" className="main-nav-button pl-32">
                <img
                  alt="..."
                  src={require("assets/imgs/navigation/raffle-icon.png")}
                  style={{ padding: "2px" }}
                />
                <p>raffles</p>
              </Button>
              <Button
                className="main-nav-button"
                onClick={() => {
                  alert("Coming soon...");
                }}
              >
                <img alt="..." src={require("assets/imgs/dao-icon.png")} />
                <p>dao</p>
              </Button>
              {/* <Button href="/swap" className="main-nav-button"> */}
              <Button href="/nftswapbeta" className="main-nav-button">
                <img alt="..." src={require("assets/imgs/swap-icon.png")} />
                <p>NFT swap</p>
              </Button>
              <Button
                className="main-nav-button"
                onClick={() => {
                  alert("Coming soon...");
                }}
              >
                <img alt="..." src={require("assets/imgs/loan-icon.png")} />
                <p>loans</p>
              </Button>
            </div>
          )}
          <Button
            className="wallet-connect-button"
            onClick={() => onClickOpenConnectModal()}
          >
            {!accountIds && (
              <img
                alt="..."
                src={require("assets/imgs/wallet-connect-icon.png")}
              />
            )}
            <p>{accountIds?.length > 0 ? accountIds[0] : "SIGN IN"}</p>
          </Button>
          {windowWidth < mobileWidth && (
            <React.Fragment key={"right"}>
              <Button
                className="menu-button"
                onClick={toggleDrawer("right", true)}
              >
                <MenuIcon />
              </Button>
              <Drawer
                anchor={"right"}
                open={navbarVisible["right"]}
                onClose={toggleDrawer("right", false)}
              >
                {list("right")}
              </Drawer>
            </React.Fragment>
          )}
        </div>
      </div>
      <Modal
        open={walletConnectModalViewFlag}
        onClose={() => onClickWalletConnectModalClose()}
        centered={true}
        className="hashpack-connect-modal"
      >
        <HsahPackConnectModal
          pairingString={walletData.pairingString}
          connectedAccount={accountIds}
          onClickConnectHashPack={onClickConnectHashPack}
          onClickCopyPairingStr={onClickCopyPairingStr}
          onClickDisconnectHashPack={onClickDisconnectHashPack}
        />
      </Modal>
    </div>
  );
}

export default MainNavbar;
