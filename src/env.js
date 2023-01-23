// Testnet
// export const TREASURY_ID = "0.0.48625139";
// export const NETWORK_TYPE = "testnet";
// export const MIRROR_NET_URL = "https://testnet.mirrornode.hedera.com";
// export const GET_ACCOUNT_PREFIX = "/api/v1/accounts/";
// export const IPFS_URL = "https://hashpack.b-cdn.net/ipfs/";

// Mainnet
export const TREASURY_ID_RAFFLE = "0.0.1358339";
export const TREASURY_ID_SWAP = "0.0.1427590";
export const NETWORK_TYPE = "mainnet";
export const MIRROR_NET_URL = "https://mainnet-public.mirrornode.hedera.com";
export const GET_ACCOUNT_PREFIX = "/api/v1/accounts/";
export const IPFS_URL = "https://hashpack.b-cdn.net/ipfs/";
export const ZUSE_COLLECTION_URL =
  "https://hedera-nft-backend.herokuapp.com/api/collectionSearch?search=";

export const SERVER_URL = "https://app.deragods.com:3306/api";
export const SOCKET_URL = "wss://app.deragods.com:56112";
//export const SERVER_URL = "http://95.217.102.128/api";

// export const SERVER_URL = "http://31.187.74.174/api";
// export const SOCKET_URL = "ws://31.187.74.174:56112";

//31.187.74.174
// raffle
export const CREATE_TICKET_PREFIX = "/tickets/add_tickets";
export const RAFFLE_ASSOCIATE_CHECK_PREFIX = "/tickets/associate_check";
export const GET_PENDING_RAFFLE_PREFIX = "/tickets/get_pending_raffle";
export const GET_ALL_PREFIX = "/tickets/get_all";
export const BUY_TICKET_PREFIX = "/tickets/buy_ticket";
export const GET_ENTRY_COUNT_PREFIX = "/tickets/get_entry_count";
export const GETL_ALL_SOLD_INFO = "/tickets/get_all_sold_info";
export const GET_RAFFLE_HISTORY_PREFIX = "/tickets/get_raffle_history";
export const GET_WINS_HISTORY_PREFIX = "/tickets/get_wins_history";
export const GET_SINGLE_RAFFLE = "/tickets/get_single_raffle";
export const GET_WINS_HISTORY_COUNT = "/tickets/get_wins_history_count";
export const SEND_NFT_REQUEST_PREFIX = "/tickets/send_nft_request";
export const UPDATE_IF_RAFFLE_INFO_PREFIX = "/tickets/update_if_raffle_info";
export const UPDATE_WINS_HISTORY_PREFIX = "/tickets/update_wins_history";
export const GET_HBAR_INFO = "/tickets/get_habr_info";
export const GET_ADMIN_INFO_PREFIX = "/tickets/get_admin_info";
export const UPDATE_ADMIN_INFO = "/tickets/update_admin_info";
export const UPDATE_TICKET_INFO = "/tickets/update_ticket_info";
export const UPDATE_SCHEDULE_INFO = "/tickets/update_schedule_info";
export const GET_TIME = "/tickets/get_time";
// swap
export const SWAP_ASSOCIATE_CHECK_PREFIX = "/swap/associate_check";
export const LIST_NEW_NFTS_PREFIX = "/swap/list_new_nfts";
export const GET_COLLECTION_PREFIX = "/swap/get_collection";
export const GET_IF_COLLECTION_PREFIX = "/swap/get_if_collection";
export const GET_LISTED_NFT_PREFIX = "/swap/get_listed_nfts";
export const ADD_NEW_SWAP_OFFER_PREFIX = "/swap/add_new_swap_offer";
export const CHECK_NEW_OFFER_PREFIX = "/swap/check_new_offer";
export const GET_SWAP_OFFER_PREFIX = "/swap/get_swap_offer";
export const GET_SINGLE_COLLECTION_PREFIX = "/swap/get_single_collection";
export const UPDATE_SINGLE_COLLECTION_PREFIX = "/swap/update_single_collection";
export const APPROVE_SWAP_OFFER_PREFIX = "/swap/approve_swap_offer";
export const DELETE_SWAP_OFFER_PREFIX = "/swap/delete_swap_offer";
export const CLAIM_REQUEST_PREFIX = "/swap/claim_request";
export const DELETE_COLLECTION_PREFIX = "/swap/delete_collection";
//Modified by 3
export const CREATE_TICKET_PRICE = 10;
// export const CREATE_TICKET_PRICE = 0.01;
export const MS_MONTH_HOUR = 24 * 30;
export const MS_MONTH_USD = 3;
export const MS_POPUP_EXTEND = 24 * 3;
export const RAFFLE_DELAY_MINUTE = 30;
export const HOT_DELAY_HOUR = 24;

export const scheduleData = {
  isWeeklyFee: "You will pay $3/week in $HBAR after the first week expires.",
  isRenewFee: "The hosting fee will renew every seven days.",
  isDrawWhenSellout: "The raffle will draw when all the tickets sell out.",
  isDrawIfNotPay:
    "The raffle will also draw if you don't renew the weekly host.",
};

export const initSchedule = {
  isWeeklyFee: false,
  isRenewFee: false,
  isDrawWhenSellout: false,
  isDrawIfNotPay: false,
};

export const checkedSchedule = {
  isWeeklyFee: false,
  isRenewFee: true,
  isDrawWhenSellout: false,
  isDrawIfNotPay: false,
};
