import React from "react";
import { Button } from "reactstrap";
import "./style.scss";

const PenguDialog = ({ titleText, contentText, agreeBtnStr, dialogType, onClickDialogAgreeBtn, onClickDialogCloseBtn }) => {
    return (
        <div className="pengu-dialog-container">
            <div className="pengu-dialog-wrapper">
                <div className="dialog-title">
                    <p>{titleText}</p>
                </div>
                <div className="dialog-content">
                    <div dangerouslySetInnerHTML={{ __html: contentText }} />
                </div>
                <div className="dialog-control">
                    <img src= {require("assets/imgs/navigation/logo.png")}></img>
                    <Button className="btn-accept" onClick={() => onClickDialogAgreeBtn(dialogType)}>{agreeBtnStr}</Button>
                    {/* <Button className="btn-cancel" onClick={onClickDialogCloseBtn}>Cancel</Button> */}
                </div>
            </div>
        </div>
    );
}

export default PenguDialog;