import React from "react";
import { Button } from "reactstrap";
import "./style.scss";

const MainFooter = () => {
    return (
        <div className="footer-container">
            <div className="footer-wrapper">
                <div className="info-wrapper">
                    <Button href="https://www.plutopeer.com/" target="_blank">
                        <img alt="..." src={require("assets/imgs/navigation/powered_mark.png")} />
                    </Button>
                    <p className="ml-3">©2023</p>
                    <a className="ml-1" href="https://dapp.deragods.com">app.deragods.com</a>
                </div>
                <div className="social-link-buttons">
                    <Button href="https://discord.com/invite/w5ReGR4FuF"  target="_blank">
                        <img alt="..." src={require("assets/imgs/discord-icon.png")} />
                    </Button>
                    <Button title="Share" href="https://twitter.com/DeragodsNFT"  target="_blank">
                        <img alt="..." src={require("assets/imgs/twitter-icon.png")} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default MainFooter;