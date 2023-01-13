import React from "react";
import "./style.scss";

const PenguAlert = ({ titleText, alertText }) => {
    return (
        <div className="alert-container">
            <div className="alert-wrapper">                
                <p className="title-text">{titleText}</p>
                <p className="alert-text">{alertText}</p>
                <img className="status-img" alt="..." src={require("assets/img/alert-success-img.png")} />
                <img className="penguin-img" alt="..." src={require("assets/img/alert-penguin-img.png")} />
            </div>
        </div>
    );
}

export default PenguAlert;