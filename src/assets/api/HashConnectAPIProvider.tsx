import { HashConnect, HashConnectTypes, MessageTypes } from "hashconnect";
import React, { useEffect, useState } from "react";
import {
  AccountId,
  TokenId,
  NftId,
  Hbar,
  TransferTransaction,
  AccountAllowanceApproveTransaction,
  Timestamp,
  ScheduleCreateTransaction,
  TokenAssociateTransaction,
  TransactionId,
} from "@hashgraph/sdk";
import * as env from "../../env.js";
import * as global from "../../global.js";

//Type declarations
interface SaveData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData: HashConnectTypes.WalletMetadata | null;
  pairedAccounts: string[];
  netWork?: string;
  id?: string;
  accountIds?: string[];
}

type Networks = "testnet" | "mainnet" | "previewnet";

interface PropsType {
  children: React.ReactNode;
  hashConnect: HashConnect;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  debug?: boolean;
}

export interface HashConnectProviderAPI {
  connect: () => void;
  disconnect: () => void;
  tokenTransfer: () => void;
  walletData: SaveData;
  netWork: Networks;
  metaData?: HashConnectTypes.AppMetadata;
  installedExtensions: HashConnectTypes.WalletMetadata | null;
}

// const availableExtensions: HashConnectTypes.WalletMetadata[] = [];

const INITIAL_SAVE_DATA: SaveData = {
  topic: "",
  pairingString: "",
  privateKey: "",
  pairedAccounts: [],
  pairedWalletData: null,
};

let APP_CONFIG: HashConnectTypes.AppMetadata = {
  name: "Deragods-Raffles",
  description: "Deragods-Raffles",
  icon: "https://absolute.url/to/icon.png",
};

const loadLocalData = (): null | SaveData => {
  let foundData = localStorage.getItem("hashConnectData");
  if (foundData) {
    const saveData: SaveData = JSON.parse(foundData);
    // setSaveData(saveData);
    return saveData;
  } else return null;
};

export const HashConnectAPIContext =
  React.createContext<HashConnectProviderAPI>({
    connect: () => null,
    disconnect: () => null,
    tokenTransfer: () => null,
    walletData: INITIAL_SAVE_DATA,
    netWork: env.NETWORK_TYPE,
    installedExtensions: null,
  });

export default function HashConnectProvider({
  children,
  hashConnect,
  metaData,
  netWork,
  debug,
}: PropsType) {
  //Saving Wallet Details in Ustate
  const [saveData, SetSaveData] = useState<SaveData>(INITIAL_SAVE_DATA);
  const [installedExtensions, setInstalledExtensions] =
    useState<HashConnectTypes.WalletMetadata | null>(null);

  //? Initialize the package in mount
  const initializeHashConnect = async () => {
    // console.log("initializeHashConnect");

    const saveData = INITIAL_SAVE_DATA;
    const localData = loadLocalData();
    // console.log("Glinton HashConnect Test >>>>> localData :", localData);
    try {
      if (!localData) {
        if (debug) console.log("===Local data not found.=====");

        //first init and store the private for later
        // console.log("Glinton HashConnect Test >>>>> APP_CONFIG :", APP_CONFIG);
        let initData = await hashConnect.init(APP_CONFIG);
        saveData.privateKey = initData.privKey;
        // console.log("initData privkey", saveData.privateKey);

        //then connect, storing the new topic for later
        const state = await hashConnect.connect();
        saveData.topic = state.topic;

        //generate a pairing string, which you can display and generate a QR code from
        saveData.pairingString = hashConnect.generatePairingString(
          state,
          netWork,
          false
        );

        //find any supported local wallets
        hashConnect.findLocalWallets();
      } else {
        console.log("====Local data found====", localData);

        console.log("====localData to save1====");

        await SetSaveData((prevData) => ({ ...prevData, ...localData }));

        await hashConnect.init(APP_CONFIG, localData.privateKey);
        await hashConnect.connect(localData.topic, localData.pairedWalletData!);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      if (localData) {
        SetSaveData((prevData) => ({ ...prevData, ...localData }));
      } else {
        console.log("************************ saveData 1 : ", saveData);
        SetSaveData((prevData) => ({ ...prevData, ...saveData }));
      }
      if (debug) console.log("====Wallet details updated to state====");
    }
  };

  const saveDataInLocalStorage = async (data: MessageTypes.ApprovePairing) => {
    if (debug)
      console.info("===============Saving to localstorage::=============");
    console.log("************************ saveData 3 : ", saveData);
    console.log("************************ data : ", data);
    const { metadata, ...restData } = data;
    SetSaveData((prevSaveData) => {
      prevSaveData.pairedWalletData = metadata;
      return { ...prevSaveData, ...restData };
    });
    data["privateKey"] = saveData.privateKey;
    data["pairingString"] = saveData.pairingString;
    data["pairedWalletData"] = metadata;
    console.log("************************ hashConnectData : ", data);
    let dataToSave = JSON.stringify(data);
    localStorage.setItem("hashConnectData", dataToSave);
  };

  // const additionalAccountResponseEventHandler = (
  //   data: MessageTypes.AdditionalAccountResponse
  // ) => {
  //   // if (debug) console.debug("=====additionalAccountResponseEvent======", data);
  //   // Do a thing
  // };

  const foundExtensionEventHandler = (
    data: HashConnectTypes.WalletMetadata
  ) => {
    if (debug) console.debug("====foundExtensionEvent====", data);
    // Do a thing
    setInstalledExtensions(data);
  };

  const pairingEventHandler = (data: MessageTypes.ApprovePairing) => {
    if (debug) console.log("====pairingEvent:::Wallet connected=====", data);
    console.log("************************ saveData 2 : ", saveData);
    // Save Data to localStorage
    saveDataInLocalStorage(data);
  };

  useEffect(() => {
    initializeAll();
  }, []);

  const initializeAll = () => {
    //Intialize the setup
    initializeHashConnect();

    // Attach event handlers
    // hashConnect.additionalAccountResponseEvent.on(
    //   additionalAccountResponseEventHandler
    // );
    hashConnect.foundExtensionEvent.on(foundExtensionEventHandler);
    hashConnect.pairingEvent.on(pairingEventHandler);

    return () => {
      // Detach existing handlers
      // hashConnect.additionalAccountResponseEvent.off(
      //   additionalAccountResponseEventHandler
      // );
      hashConnect.foundExtensionEvent.off(foundExtensionEventHandler);
      hashConnect.pairingEvent.off(pairingEventHandler);
    };
  };

  const connect = () => {
    if (installedExtensions) {
      if (debug) console.log("Pairing String::", saveData.pairingString);
      // console.log("Glinton HashConnect Test >>>>> saveData.pairingString :", saveData.pairingString);
      hashConnect.connectToLocalWallet(saveData.pairingString);
    } else {
      // if (debug) console.log("====No Extension is not in browser====");
      return "wallet not installed";
    }
  };

  const disconnect = async () => {
    // console.log("Glinton log >>>>> disconnect function called!");
    await SetSaveData(INITIAL_SAVE_DATA);
    // await SetInfo([]);
    let foundData = localStorage.getItem("hashConnectData");
    if (foundData) localStorage.removeItem("hashConnectData");
    initializeAll();
  };

  const associateToken = async (tokenId_a) => {
    console.log("associateToken log - 1 : ", tokenId_a);

    const accountId = saveData.accountIds[0];
    const provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      accountId
    );
    const signer = hashConnect.getSigner(provider);
    const tokenId = TokenId.fromString(tokenId_a);

    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId]);
    if (!associateTx) return false;
    const associateFreeze = await associateTx.freezeWithSigner(signer);
    if (!associateFreeze) return false;
    const associateSign = await associateFreeze.signWithSigner(signer);
    if (!associateSign) return false;
    const associateSubmit = await associateSign.executeWithSigner(signer);
    if (!associateSubmit) return false;
    const associateRx = await provider.getTransactionReceipt(
      associateSubmit.transactionId
    );

    console.log("associateToken log - 2 : ", associateRx);

    if (associateRx.status._code === 22) return true;

    return false;
  };

  const sendHbarAndNftToTreasury = async (amount_, tokenId_, serialNum_) => {
    console.log(
      "************************ sendHbarAndNftToTreasury 0 : ",
      amount_,
      tokenId_,
      serialNum_
    );

    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_RAFFLE);
    const _nft = new NftId(TokenId.fromString(tokenId_), serialNum_);
    let allowanceTx = new AccountAllowanceApproveTransaction()
      .approveHbarAllowance(_accountId, _treasuryId, amount_)
      .approveTokenNftAllowance(_nft, _accountId, _treasuryId);

    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const sendHbarToTreasury = async (amount_) => {


    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_RAFFLE);

    console.log("************************ sendHbarAndNftToTreasury 0 : ", amount_);

    const allowanceTx =
      new AccountAllowanceApproveTransaction().approveHbarAllowance(
        _accountId,
        _treasuryId,
        amount_
      );
    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );

    console.log(
      "************************ sendHbarToTreasury 1 : ",
      _accountId,
      _treasuryId,
      amount_
    );

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const sendTokenToTreasury = async (tokenSelId, amount_) => {
    // console.log("************************ sendHbarAndNftToTreasury 0 : ");

    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_RAFFLE);

    let allowanceTx;

    if (tokenSelId == -1)
      //Hbar
      allowanceTx =
        new AccountAllowanceApproveTransaction().approveHbarAllowance(
          _accountId,
          _treasuryId,
          amount_
        );
    else {
      const tokenInfo = await global.getInfoResponse(
        `https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/${tokenSelId}`
      );
      let decimals = 8;
      if (tokenInfo) decimals = tokenInfo["data"]["decimals"];
      const sendBal = parseFloat(amount_) * 10 ** decimals;

      console.log("sendTokenToTreasury:sendBal", sendBal);
      allowanceTx =
        new AccountAllowanceApproveTransaction().approveTokenAllowance(
          tokenSelId,
          _accountId,
          _treasuryId,
          sendBal
        );
    }

    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );

    console.log(
      "************************ sendHbarToTreasury 1 : ",
      _accountId,
      _treasuryId,
      amount_
    );

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const receiveHbar = async (_amount) => {
    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_RAFFLE);

    const sendBal = new Hbar(_amount); // Spender must generate the TX ID or be the client
    const allowanceTx = new TransferTransaction()
      .addApprovedHbarTransfer(_treasuryId, sendBal.negated())
      .addHbarTransfer(_accountId, sendBal);

    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );
    console.log("************************ receiveHbar 1 : ", allowanceRx);

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const receiveNft = async (tokenId_, serialNum_) => {
    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_RAFFLE);
    const _nft = new NftId(TokenId.fromString(tokenId_), parseInt(serialNum_));

    const allowanceTx = new TransferTransaction().addApprovedNftTransfer(
      _nft,
      _treasuryId,
      _accountId
    );
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );
    console.log("************************ receiveNft 1 : ", allowanceRx);

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const receiveMultipleAndHbarNfts = async (nftInfo_, offerHbar_) => {
    console.log(
      "************************ receiveMultipleAndHbarNfts 0 : ",
      nftInfo_,
      offerHbar_
    );
    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_SWAP);

    const allowanceTx = new TransferTransaction();
    for (let i = 0; i < nftInfo_.length; i++) {
      const _nft = new NftId(
        TokenId.fromString(nftInfo_[i].tokenId),
        parseInt(nftInfo_[i].serialNum)
      );
      allowanceTx.addApprovedNftTransfer(_nft, _treasuryId, _accountId);
    }

    if (offerHbar_) {
      const sendBal = new Hbar(offerHbar_); // Spender must generate the TX ID or be the client
      allowanceTx
        .addApprovedHbarTransfer(_treasuryId, sendBal.negated())
        .addHbarTransfer(_accountId, sendBal);
    }

    console.log(
      "************************ receiveMultipleAndHbarNfts-1 : ",
      allowanceTx
    );

    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );
    console.log(
      "************************ receiveMultipleAndHbarNfts 1 : ",
      allowanceRx
    );

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  const sendHbarAndMultiNftsToTreasury = async (nftInfo_, amount_) => {
    const _accountId = saveData.accountIds[0];
    const _provider = hashConnect.getProvider(
      netWork,
      saveData.topic,
      _accountId
    );
    const _signer = hashConnect.getSigner(_provider);
    const _treasuryId = AccountId.fromString(env.TREASURY_ID_SWAP);

    let allowanceTx =
      new AccountAllowanceApproveTransaction().approveHbarAllowance(
        _accountId,
        _treasuryId,
        amount_
      );

    for (let i = 0; i < nftInfo_.length; i++) {
      const _nft = new NftId(
        TokenId.fromString(nftInfo_[i].tokenId),
        parseInt(nftInfo_[i].serialNum)
      );
      allowanceTx.approveTokenNftAllowance(_nft, _accountId, _treasuryId);
    }
    if (!allowanceTx) return false;
    const allowanceFreeze = await allowanceTx.freezeWithSigner(_signer);
    if (!allowanceFreeze) return false;
    const allowanceSign = await allowanceFreeze.signWithSigner(_signer);
    if (!allowanceSign) return false;
    const allowanceSubmit = await allowanceSign.executeWithSigner(_signer);
    if (!allowanceSubmit) return false;
    const allowanceRx = await _provider.getTransactionReceipt(
      allowanceSubmit.transactionId
    );

    if (allowanceRx.status._code === 22) return true;

    return false;
  };

  // const nftScheduledSend = async () => {
  //   console.log("nftScheduledSend log - 1");
  //   const _accountId = saveData.accountIds[0];
  //   const _provider = hashConnect.getProvider(netWork, saveData.topic, _accountId);
  //   const _signer = hashConnect.getSigner(_provider);
  //   const _treasuryId = AccountId.fromString(env.TREASURY_ID);

  //   //Create a transaction to schedule
  //   const transaction = new TransferTransaction()
  //     .addHbarTransfer(_treasuryId, new Hbar(-0.01))
  //     .addHbarTransfer(_accountId, new Hbar(0.01))
  //     .addNftTransfer(TokenId.fromString("0.0.1331454"), 717, _accountId, _treasuryId);

  //   //Schedule a transaction
  //   const scheduleTransaction = new ScheduleCreateTransaction().setScheduledTransaction(transaction);
  //   const transactionFreeze = await scheduleTransaction.freezeWithSigner(_signer);
  //   const transactionSign = await transactionFreeze.signWithSigner(_signer);
  //   const transactionSubmit = await transactionSign.executeWithSigner(_signer);

  //   console.log("nftScheduledSend log - 2 : ", transactionSubmit);

  //   // //Get the receipt of the transaction
  //   const receipt = await _provider.getTransactionReceipt(transactionSubmit.transactionId);

  //   console.log("nftScheduledSend log - 3 : ", receipt);

  //   //Get the schedule ID
  //   const scheduleId = receipt.scheduleId;
  //   console.log("The schedule ID is " + scheduleId);

  //   // //Get the scheduled transaction ID
  //   // const scheduledTxId = receipt.scheduledTransactionId;
  //   // console.log("The scheduled transaction ID is " + scheduledTxId);
  // }

  return (
    <HashConnectAPIContext.Provider
      value={{
        walletData: saveData,
        installedExtensions,
        connect,
        disconnect,
        associateToken,
        sendHbarAndNftToTreasury,
        sendHbarToTreasury,
        sendTokenToTreasury,
        receiveHbar,
        receiveNft,
        sendHbarAndMultiNftsToTreasury,
        receiveMultipleAndHbarNfts,
      }}
    >
      {children}
    </HashConnectAPIContext.Provider>
  );
}

const defaultProps: Partial<PropsType> = {
  metaData: {
    name: "Deragods-Raffles",
    description: "Deragods-Raffles",
    icon: "https://absolute.url/to/icon.png",
  },
  netWork: env.NETWORK_TYPE,
  debug: false,
};

HashConnectProvider.defaultProps = defaultProps;

export function useHashConnect() {
  const value = React.useContext(HashConnectAPIContext);
  return value;
}
