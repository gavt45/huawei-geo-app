import {StatusBar} from 'expo-status-bar';
import React, {Component, useContext, useState} from 'react';
import {Container, Content, Header, Title, Body, Left, Right, Button, Icon} from 'native-base';
import {AsyncStorage, StyleSheet, Text, View} from 'react-native';
import MainScreen from "./screens/MainScreen/index.js";
import ExpoTestScreen from "./screens/ExpoTestScreen.js";
import {NavigationContainer} from "@react-navigation/native";
import {createDrawerNavigator} from "@react-navigation/drawer";
import ForegroundService from 'react-native-foreground-service';
import AppContext from './components/AppContext';

import {
    accelerometer,
    gyroscope,
    magnetometer,
    setUpdateIntervalForType,
    SensorTypes
} from "react-native-sensors";


setUpdateIntervalForType(SensorTypes.accelerometer, 1); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 1000); // defaults to 100ms

const Drawer = createDrawerNavigator();

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
        await ForegroundService.stopService();
        await ForegroundService.stopServiceAll();
        appCtx.fgServiceRunning = false;
    }
}
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

async function storeData(sensorStorage, x, y, z, timestamp){
    // console.log("sensor storage: ", sensorStorage.length);
    const URI = await getUri();
    // console.log("URI in store data: ",URI);

    // console.log("Storage: ", sensorStorage;);
    sensorStorage = [...sensorStorage,{timestamp, x,y,z}];
    // console.log("new sensor storage: ", sensorStorage);

    if (sensorStorage.length >= 200){
        console.log("sending data!",sensorStorage.length);
        fetch(URI, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'accelerometer',
                measurements: sensorStorage
            })
        })
        return [];
    }
    return sensorStorage;
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
        await ForegroundService.stopService();
        await ForegroundService.stopServiceAll();
        appCtx.fgServiceRunning = false;
    }
}
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

async function subscribeToServices(appCtx) {
    console.log("BG service is working!");
    var sensorStorage = {
        accel: [],
        magnetometer: []
    };
    appCtx.subscription = accelerometer.subscribe(async ({ x, y, z, timestamp }) =>
        {
            // console.log("accel: ", sensorStorage,x,y,z,timestamp);
            sensorStorage.accel = await storeData(sensorStorage.accel, x, y, z, timestamp);
        }
    );

    appCtx.magnSubscription = magnetometer.subscribe(({ x, y, z, timestamp }) =>
        console.log("Magnetometer: ", { x, y, z, timestamp })
    )
    console.log("Waiting for service to stop!");
}

function unsubscribe(appCtx){
    console.log("Unsubscribing!");
    appCtx.subscription.unsubscribe();
    appCtx.magnSubscription.unsubscribe();
}

export default class App extends Component {
    constructor() {
        super();
        this.appSettings = null;
        this.state = { isLoading: true }
    }

    async componentDidMount() {
        await setUri("http://ass/");

        this.appSettings = {
            fgServiceRunning: false,
            fgServiceNotificationConfig: null,
            fgServiceTaskName: "bgSensors",
            setUri,
            getUri,
            startFgService,
            stopFgService,
            subscribeToServices,
            unsubscribe
        };

        console.log("Set app settings: ", this.appSettings);

        // register task with a given name and function
        let foregroundTask = async (data) => {
            console.log("Task data: ", data);
            await subscribeToServices();
        }
        console.log("Task name: ", this.appSettings.fgServiceTaskName);
        ForegroundService.registerForegroundTask(this.appSettings.fgServiceTaskName, foregroundTask);
        console.log("Registered task!");
// then later, start service, and send tasks

        let notificationConfig = {
            id: 3,
            title: 'Service',
            message: `blah message`,
            visibility: 'public',
            importance: 'low',
            number: String(1)
        };

        // await ForegroundService.startService(notificationConfig);

        this.appSettings.fgServiceNotificationConfig = notificationConfig;

        console.log("Set notification config!");

        // await ForegroundService.runTask({
        //     taskName: appSettings.fgServiceTaskName,
        //     delay: 0
        // });
        this.setState({isLoading: false})
    }

    render() {
        return (
            this.state.isLoading ?
                <Container>
                    <Content padder>
                        <Text>
                            Lorem ipsum...
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
