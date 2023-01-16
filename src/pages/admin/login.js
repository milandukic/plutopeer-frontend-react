import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Modal } from '@mui/material';
import { useHistory } from 'react-router-dom';

import HashPackConnectModal from '../../components/HashPackConnectModal.js';
import { useHashConnect } from '../../assets/api/HashConnectAPIProvider.tsx';

function Login() {
    let history = useHistory();

    const [walletConnectModalViewFlag, setWalletConnectModalViewFlag] = useState(false);

    const { walletData, installedExtensions, connect, disconnect } = useHashConnect();
    const { accountIds } = walletData;

    const onClickWalletConnectModalClose = () => {
        setWalletConnectModalViewFlag(false);
    }

    const onClickOpenConnectModal = () => {
        setWalletConnectModalViewFlag(true);
        console.log('onClickOpenConnectModal log - 1 : ', walletData);
    }

    const onClickDisconnectHashPack = () => {
        disconnect();
        setWalletConnectModalViewFlag(false);
    }

    const onClickCopyPairingStr = () => {
        navigator.clipboard.writeText(walletData.pairingString);
    };

    const onClickConnectHashPack = () => {
        console.log('onClickConnectHashPack log - 1');
        if (installedExtensions) {
            connect();
            setWalletConnectModalViewFlag(false);
        } else {
            alert(
                'Please install hashconnect wallet extension first. from chrome web store.'
            );
        }
    };

    useEffect(() => {
        console.log('account id changed!');
        if (accountIds?.length > 0 && (accountIds[0] == "0.0.1099395" || accountIds[0] =="0.0.1466791")) {
            console.log('Wallet connected!');
            history.push('/main');
        }
    }, [accountIds]);

    return (
        <>
            <Box sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <img alt='...' src={require('../../assets/imgs/deragods_logo.png')}
                    style={{
                        marginTop: '20vh',
                        marginBottom: '5vh',
                        width: '300px',
                    }} />
                <Button onClick={() => onClickOpenConnectModal()}
                    variant='outlined'
                    sx={{
                        borderRadius: '16px',
                        border: '3px solid #6000ff',
                        fontFamily: 'Bebas Neue, Balsamiq Sans',
                        fontSize: '42px',
                        color: 'white',
                        '&:hover': {
                            border: '3px solid #6000ff',
                        },
                        '&:focus' : {
                            border: '3px solid #6000ff',
                            outline: 'none',
                        },
                    }}>
                    {accountIds?.length > 0 ? accountIds[0] : 'SIGN'}
                </Button>
            </Box>
            <Modal
                open={walletConnectModalViewFlag}
                onClose={() => onClickWalletConnectModalClose()}
                centered={true}
            >
                <HashPackConnectModal
                    pairingString={walletData.pairingString}
                    connectedAccount={accountIds}
                    onClickConnectHashPack={onClickConnectHashPack}
                    onClickCopyPairingStr={onClickCopyPairingStr}
                    onClickDisconnectHashPack={onClickDisconnectHashPack}
                />
            </Modal>
        </>
    );
}

export default Login;