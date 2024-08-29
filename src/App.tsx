import { useState } from 'react'
import './App.css'
import { Alert, Button, Slider, TextField } from "@mui/material";
import { Lock, LockOpen } from '@mui/icons-material';
import { CommandTypeRequest, DeviceCommandType, RofiRequest, RofiState, RofiStateType } from './protoc/rofi.ts';
import { Joints } from './joints.tsx';

function App() {
    const [charactState, setCharactState] = useState<BluetoothRemoteGATTCharacteristic>();
    const [statePacketData, setStatePacketData] = useState<RofiState | null>(null);

    const [charactReq, setCharactReq] = useState<BluetoothRemoteGATTCharacteristic>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isNotifying, setIsNotifying] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [updateRofiId, setUpdateRofiId] = useState<number>(0);

    async function connect() {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: 'RoFI' }], optionalServices: [0xA0F1]
            });
            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService(0xA0F1);
            setCharactState(await service?.getCharacteristic(0xD0F1));
            setCharactReq(await service?.getCharacteristic(0xD0F2));
            setIsConnected(true);
        } catch (e: Error | any) {
            setIsConnected(false);
            setErrorMsg(e?.message);
            console.log(e?.message)
        }
    }

    function onRofiStateChange(event: Event) {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        const { value } = characteristic;
        if (!value) {
            return;
        }
        const rofiState = RofiState.decode(new Uint8Array(value.buffer), value.byteLength);
        if (rofiState.type !== RofiStateType.STATE_SUCCESS) {
            console.log("Error: ", rofiState.errorMessage);
            setErrorMsg(`${rofiState.errorMessage} - packetId: ${rofiState.packetId}`);
            return
        }
        setStatePacketData(rofiState);
        console.log(`Received RoFI ID: ${rofiState?.rofiId} - packetId: ${rofiState?.packetId}`);
    }

    async function startNotifications() {
        charactState?.addEventListener('characteristicvaluechanged', onRofiStateChange);
        await charactState?.startNotifications();
        setIsNotifying(true);
    }

    async function stopNotifications() {
        await charactState?.stopNotifications();
        charactState?.removeEventListener('characteristicvaluechanged', onRofiStateChange);
        setIsNotifying(false);
    }

    async function sendRofiRequest(rofiRequestRaw: RofiRequest) {
        const rofiRequest = RofiRequest.create(rofiRequestRaw);
        const buffer = RofiRequest.encode(rofiRequest).finish();
        await charactReq?.writeValue(buffer);
    }

    async function updateRofiIdFunc(newId: number) {
        await sendRofiRequest({ packetId: 1, command: CommandTypeRequest.DEVICE, device: { command: DeviceCommandType.SET_ID, setId: newId } });
    }

    if (!navigator.bluetooth || !navigator.bluetooth.requestDevice) {
        return <Alert variant="filled" severity="error">Web Bluetooth is not available</Alert>;
    }

    if (!isConnected) {
        { errorMsg && <Alert variant="filled" severity="error">{errorMsg}</Alert> }
        return <Button variant="contained" onClick={connect}>Connect to RoFI</Button>;
    }

    return (<>

        {errorMsg && <Alert variant="filled" severity="error">{errorMsg}</Alert>}
        <Alert variant="filled" severity="info">{statePacketData ?
            `Connected to RoFI ID:${statePacketData.rofiId} - last packetId: ${statePacketData.packetId}` :
            "Connected"}
        </Alert>

        <Button variant="contained" onClick={startNotifications} disabled={isNotifying}>Start notifications</Button>

        <Button variant="contained" onClick={stopNotifications} disabled={!isNotifying}>Stop notifications</Button>

        {statePacketData &&
            <>
                <p>RoFI ID: {statePacketData.rofiId}</p>
                <p>Packet ID: {statePacketData.packetId}</p>

                <div>
                    {/* <input type="number" defaultValue={statePacketData.rofiId} onChange={(e) => updateRofiIdFunc(parseInt(e.target.value))} /> */}
                    <TextField
                        label="RoFI ID"
                        type="number"
                        value={updateRofiId}
                        onChange={(e) => setUpdateRofiId(parseInt(e.target.value))}
                        variant='filled'
                    />
                    {/* <button onClick={updateRofiIdFunc}>Set ID</button> */}
                    <Button variant="contained" onClick={() => updateRofiIdFunc(updateRofiId)}>Set ID</Button>
                </div>

                <Joints joints={statePacketData.stateData?.joints} sendRofiRequest={sendRofiRequest} />
            </>
        }






        {/* <div style={{ position: 'relative', textAlign: 'center' }}>
            <img src="/assets/RoFI.jpg" alt="RoFI" width="500" />
            <Button variant="contained" color="primary"
                onClick={() => {
                    setIsLocked(!isLocked);
                }}

                sx={{
                    position: 'absolute',
                    top: '68%',
                    left: '24%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {isLocked ? <Lock /> : <LockOpen />}
            </Button>
            <Slider
                min={0}
                max={100}
                value={
                    sliderValue
                }
                // onChange={(_, value) => {
                //     setSliderValue(value as number);
                // }}
                orientation={"vertical"}
                valueLabelDisplay="auto"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    height: '50%',
                }}
            />
        </div> */}
    </>)
}

export default App
