import {useState} from 'react'
import './App.css'

function App() {
    const [bleData, setBleData] = useState<object>();
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

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
            const jsonValue = JSON.parse(decoded);
            setBleData(jsonValue);
            console.log(jsonValue["joints"]);
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
            {// @ts-ignore
                bleData && bleData["ID"] && <h1>{bleData["ID"]}</h1>}
        </div>

        <div>
            {error && <p>{error}</p>}
        </div>
    </>)
}

export default App
