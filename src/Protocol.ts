export interface Connector {
    position: number;
}

export interface Capability {
    max: number
    min?: number
}

export interface Joint {
    capabilities: {
        position: Capability;
        speed: Capability;
        torque: Capability;
    };
    position: number;
    torque: number;
    velocity: number;
}

export interface Data {
    ID: number;
    connectors?: {
        [key: string]: Connector;
    };
    joints?: {
        [key: string]: Joint;
    };
}