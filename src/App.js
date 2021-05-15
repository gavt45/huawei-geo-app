import {StatusBar} from 'expo-status-bar';
import React, {Component, useContext, useState} from 'react';
import {Container, Content, Header, Title, Body, Left, Right, Button, Icon} from 'native-base';
import {AsyncStorage, StyleSheet, Text, View} from 'react-native';
import MainScreen from "./screens/MainScreen/index.js";
import ExpoTestScreen from "./screens/ExpoTestScreen.js";
import {NavigationContainer} from "@react-navigation/native";
import {createDrawerNavigator} from "@react-navigation/drawer";
import ForegroundService from 'react-native-foreground-service';
import Geolocation from "./components/GpsData.js";
import AppContext from './components/AppContext';

import {
    accelerometer,
    gyroscope,
    magnetometer,
    setUpdateIntervalForType,
    SensorTypes
} from "react-native-sensors";

import uuid from 'react-native-uuid';


setUpdateIntervalForType(SensorTypes.accelerometer, 100); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 100); // defaults to 100ms

const Drawer = createDrawerNavigator();

const geolocation = new Geolocation();

async function setUri(URI){
    try {
        await AsyncStorage.setItem(
            '@MySuperStore:server-uri',
            URI
        );
    } catch (error) {
        console.error("Error saving data to storage: ",error);
    }
}

async function getUri(){
    try {
        const value = await AsyncStorage.getItem('@MySuperStore:server-uri');
        if (value !== null) {
            // We have data!!
            return value;
        }
    } catch (error) {
        console.error("Error fetching data from storage: ",error);
    }
    return null;
}

async function setUUID(uid){
    try {
        await AsyncStorage.setItem(
            '@MySuperStore:uuid',
            uid
        );
    } catch (error) {
        console.error("Error saving data to storage: ",error);
    }
}

async function getUUID(){
    try {
        const value = await AsyncStorage.getItem('@MySuperStore:uuid');
        if (value !== null) {
            // We have data!!
            return value;
        }
    } catch (error) {
        console.error("Error fetching data from storage: ",error);
    }
    return null;
}

async function storeData(sensorStorage, x, y, z, timestamp, type, deviceId, SEND_CNT){
    // console.log("sensor storage: ", sensorStorage.length);
    const URI = await getUri();
    // console.log("URI in store data: ",URI);

    // console.log("Storage: ", {timestamp, x,y,z});
    sensorStorage = [...sensorStorage, {timestamp, x,y,z}];
    // console.log("new sensor storage: ", sensorStorage);

    if (sensorStorage.length >= SEND_CNT){
        console.log("sending data!",sensorStorage.length);
        fetch(URI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: type,
                deviceId: deviceId,
                measurements: sensorStorage
            })
        })
        return [];
    }
    return sensorStorage;
}

async function subscribeToServices(appCtx) {
    console.log("BG service is working!");
    var sensorStorage = {
        accel: [],
        magnetometer: [],
        geo: []
    };

    appCtx.subscription = accelerometer.subscribe(async ({ x, y, z, timestamp }) =>
        {
            // console.log("accel: ", sensorStorage,x,y,z,timestamp);
            sensorStorage.accel = await storeData(sensorStorage.accel, x, y, z, timestamp, 'accelerometer', await getUUID(), 10);
        }
    );

    appCtx.magnSubscription = magnetometer.subscribe(async ({ x, y, z, timestamp }) =>
        {
            // console.log("accel: ", sensorStorage,x,y,z,timestamp);
            sensorStorage.magnetometer = await storeData(sensorStorage.magnetometer, x, y, z, timestamp, 'magnetometer', await getUUID(), 10);
        }
    );

    appCtx.geoSubscription = await geolocation.subscribeToUpdates(async (location) => {
            console.log("get location update: ", location);
            sensorStorage.geo = await storeData(sensorStorage.geo,
                                                location.longitude,
                                                location.latitude,
                                                location.altitude,
                                                location.timestamp,
                                                'gps',
                                                await getUUID(),
                                                5)
        }
    );

    console.log("Waiting for service to stop!");
}

async function unsubscribe(appCtx){
    console.log("Unsubscribing!");
    if (appCtx.subscription) appCtx.subscription.unsubscribe();
    if (appCtx.magnSubscription) appCtx.magnSubscription.unsubscribe();
    console.log(appCtx.geoSubscription);
    appCtx.geoSubscription();
}

function setCtxUuid(appCtx, uuid) {
    appCtx.uuid = uuid;
}


async function startFgService(appCtx) {
    if (!appCtx.fgServiceRunning) {
        appCtx.fgServiceRunning = true;
        await ForegroundService.startService(appCtx.fgServiceNotificationConfig);
        await ForegroundService.runTask({
            taskName: appCtx.fgServiceTaskName,
            delay: 0
        });
    }else {
        console.log("Service is already running!");
    }
}
async function stopFgService(appCtx) {
    if (appCtx.fgServiceRunning) {
        console.log("Stopping service!");
        await unsubscribe(appCtx);
        await ForegroundService.stopService();
        await ForegroundService.stopServiceAll();
        appCtx.fgServiceRunning = false;
    }
}

export default class App extends Component {
    constructor(props) {
        super(props);
        this.appSettings = null;
        this.state = { isLoading: true }
        this.timerId = null;
    }

    async componentDidMount() {
        await setUri("http://ass/");

        this.appSettings = {
            fgServiceRunning: false,
            fgServiceNotificationConfig: null,
            uuid: null,
            fgServiceTaskName: "bgSensors",
            shit: "some shit",
            setUri,
            getUri,
            getUUID,
            setCtxUuid,
            startFgService,
            stopFgService,
            subscribeToServices,
            unsubscribe,
        };

        console.log("Set app settings: ", this.appSettings);

        // register task with a given name and function
        let foregroundTask = async (data) => {
            console.log("Task data: ", data);
            await subscribeToServices(this.appSettings);
        }
        console.log("Task name: ", this.appSettings.fgServiceTaskName);
        ForegroundService.registerForegroundTask(this.appSettings.fgServiceTaskName, foregroundTask);
        console.log("Registered task!");
// then later, start service, and send tasks

        this.appSettings.fgServiceNotificationConfig = {
            id: 3,
            title: 'Service',
            message: `blah message`,
            visibility: 'public',
            importance: 'low',
            number: String(1)
        };

        // check if device uuid set
        if ((await getUUID()) == null){
            let new_uuid = uuid.v4();
            console.log("Setting new device UUID: ", new_uuid);
            await setUUID(new_uuid);
        }

        this.appSettings.uuid = await getUUID();

        console.log("Setting app state!");
        this.setState({isLoading: false});
        // this.timerId = setInterval(() => Geolocation.permissionHandle(), 3000);
        console.log("OK!");
    }
    // componentWillUnmount() {
    //     if (this.timerId) {
    //         clearInterval(this.timerId);
    //     }
    // }

    render() {
        return (
            this.state.isLoading ?
                <Container>
                    <Content padder>
                        <Text>
                            LOADING app!
                        </Text>
                    </Content>
                </Container>
            :
                <AppContext.Provider value={this.appSettings}>
                    <NavigationContainer>
                        <Drawer.Navigator initialRouteName="Home">
                            <Drawer.Screen name="Home" component={MainScreen}/>
                            <Drawer.Screen name="Sensors data" component={ExpoTestScreen}/>
                        </Drawer.Navigator>
                    </NavigationContainer>
                </AppContext.Provider>
            // <Container padder>
            //     <Text>ASS</Text>
            // </Container>
        );
    }
};
