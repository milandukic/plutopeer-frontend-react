import axios from "axios";
export const getInfoResponse = async (urlStr_) => {
  try {
    return await axios.get(urlStr_);
  } catch (error) {
    console.log(error);
  }
};

export const postInfoResponse = async (urlStr_, postData_) => {
  let _response = await axios
    .post(urlStr_, postData_)
    .catch((error) => console.log("Error: ", error));
  if (_response && _response.data) {
    // console.log(_response);
    return _response;
  }
};

export const getTokenPriceInfo = (token_id, tokenPrices) => {
  if (!tokenPrices) return;

  const findPriceItem = tokenPrices.find((price_item) => {
    if (
      price_item.id == token_id ||
      (token_id == -1 && price_item.symbol == "HBAR")
    )
      return true;
    return false;
  });

  let returnPriceItem = { ...findPriceItem };

  if (findPriceItem?.icon != null) {
    returnPriceItem.icon = String(returnPriceItem.icon)
      .replace("/images/", "https://wallet.hashpack.app/assets/")
      .toLowerCase();

    // returnPriceItem.icon = String(returnPriceItem.icon).substring(0, String(returnPriceItem.icon).length - 4) + ".svg";
  }

  return returnPriceItem;
};

export const getRequest = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    return { result: false, error: error.message };
  }
};

