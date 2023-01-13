import React from "react";
import "./style.scss";

const Loading = () => {
    return (
        <div className="loading-container">
            <div className="loading-wrapper">
                <img className="penguin-img-1" alt="..." src={require("assets/img/loading-1.png")} />
                <img className="penguin-img-2" alt="..." src={require("assets/img/loading-2.png")} />
                <img className="penguin-img-3" alt="..." src={require("assets/img/loading-3.png")} />
                <img className="penguin-img-4" alt="..." src={require("assets/img/loading-4.png")} />
                <img className="penguin-img-5" alt="..." src={require("assets/img/loading-5.png")} />
                <img className="penguin-img-6" alt="..." src={require("assets/img/loading-6.png")} />
                <img className="penguin-img-7" alt="..." src={require("assets/img/loading-7.png")} />
                <img className="penguin-img-8" alt="..." src={require("assets/img/loading-8.png")} />
                <img className="ice-img" alt="..." src={require("assets/img/loading-ice.png")} />
                <p className="notice-msg">Loading will take some time, so please be patient. Refreshing the page may cause issues.  Thank you.</p>
            </div>
        </div>
    );
}

export default Loading;