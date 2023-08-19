import {useState} from 'react'
import './App.css'
import {Button, Slider} from "@mui/material";
import {Lock, LockOpen} from '@mui/icons-material';
import {Data} from "./Protocol.ts"

function App() {
    const [bleData, setBleData] = useState<Data>();
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isLocked, setIsLocked] = useState<boolean>(false);

    const connect = async () => {
        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [{namePrefix: 'RoFI'}], optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
            });

            const server = await device.gatt?.connect();
            const service = await server?.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
            setCharacteristic(await service?.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8'));
            setIsConnected(true);
        } catch (e: any) {
            setError(e.message);
            console.log(e.message)
        }
    }

    const startNotifications = async () => {
        const decoder = new TextDecoder();

        setInterval(async () => {
            const value = await characteristic?.readValue();
            const decoded = decoder.decode(value!);
            const jsonValue: Data = JSON.parse(decoded);
            setBleData(jsonValue);
            console.log(jsonValue["ID"]);
            setSliderValue(jsonValue?.joints?.joint0?.position || 0);
        }, 1000);
    }

    return (<>
        <div>
            <button onClick={connect}>Connect</button>
        </div>

        <div>
            <button disabled={!isConnected} onClick={startNotifications}>Start notifications</button>
        </div>

        <div>
            {bleData ? bleData["ID"] : "No data"}
        </div>

        <div>
            {bleData?.joints?.joint0?.position || "Position not available"}
        </div>

        <div>
            {error && <p>{error}</p>}
        </div>

        <div style={{position: 'relative', textAlign: 'center'}}>
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
        </div>
    </>)
}

export default App
