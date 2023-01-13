import React, { useState } from "react";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import "./style.scss";
import * as env from "../../env";


const NftCard = ({ singleNftInfo, nftCardMargin, onClickSendRequest }) => {
    // console.log("NftCard log - 1 : ", singleNftInfo);
    return (
        <div className="nft-card-wrapper"
            style={{ margin: `5px ${nftCardMargin}px`, borderColor: singleNftInfo.staked ? "#1b9700" : "#ebef64" }}
            onClick={() => onClickSendRequest(singleNftInfo.tokenId, singleNftInfo.serialNum)}>
            <img className="nft-image" alt="..." src={singleNftInfo.imgUrl}></img>
            {
                singleNftInfo.tokenId === env.ULTRA_SLICE_ID &&
                <p className="ultra-bar">Ultra Slice</p>
            }
            {
                !singleNftInfo.staked &&
                singleNftInfo.ticked &&
                <CheckCircleOutlineIcon />
            }
            {
                !singleNftInfo.staked &&
                !singleNftInfo.ticked &&
                <RadioButtonUncheckedIcon />
            }
            {
                singleNftInfo.staked &&
                <div className="staked-date">
                    {/* <p>{`${singleNftInfo.stakedDays} day${singleNftInfo.stakedDays > 1 ? "s" : ""} baking`}</p> */}
                    <p>Baking</p>
                </div>
            }
        </div >
    );
}

export default NftCard;