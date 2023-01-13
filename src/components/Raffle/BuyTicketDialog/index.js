import React, { useState } from "react";
import {
    Button,
    Input
} from "reactstrap";
import "./style.scss";

const BuyTicketDialog = ({ ticketData, onClickDialogAgreeBtn, onClickDialogCloseBtn }) => {
    const [ticketCount, setTicketCount] = useState(1);
    // console.log("BuyTicketDialog log - 1 : ", ticketData);
    return (
        <div className="buyticket-dialog-container">
            <div className="buyticket-dialog-wrapper">
                <div className="dialog-title">
                    <p>Buy Ticket</p>
                </div>
                <div className="dialog-content">
                    <p className="current-entry">{`Current entries: ${ticketData.soldCount}/${ticketData.totalCount}`}</p>
                    <p>{`Your entries: ${ticketData.myEntry}`}</p>
                    <div className="d-flex row m-0">
                        <p>Number of entries to buy:</p>
                        <Input
                            type="number"
                            value={ticketCount}
                            onChange={(e) => { setTicketCount(e.target.value) }}
                            placeholder="ticket Count"
                        />
                    </div>
                </div>
                <div className="dialog-control">
                    <Button className="btn-accept" onClick={() => onClickDialogAgreeBtn(ticketCount)}>Confirm</Button>
                    {/* <Button className="btn-cancel" onClick={onClickDialogCloseBtn}>Cancel</Button> */}
                </div>
            </div>
        </div>
    );
}

export default BuyTicketDialog;