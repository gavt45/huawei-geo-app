import {StatusBar} from 'expo-status-bar';
import React, {Component, useState} from 'react';
import {Container, Content, Header, Title, Body, Left, Right, Button, Icon} from 'native-base';
import {StyleSheet, Text, View} from 'react-native';
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


setUpdateIntervalForType(SensorTypes.accelerometer, 1000); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 1000); // defaults to 100ms

const Drawer = createDrawerNavigator();

async function subscribeToServices() {
    console.log("BG service is working!");
    const subscription = accelerometer.subscribe(({ x, y, z, timestamp }) =>
        fetch('http://192.168.1.62:8000/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "accelerometer",
                timestamp: timestamp,
                x:x,
                y:y,
                z:z
            })
        })
    );

    const magnSubscription = magnetometer.subscribe(({ x, y, z, timestamp }) =>
        console.log("Magnetometer: ", { x, y, z, timestamp })
    )
    console.log("Waiting for service to stop!");
    while (await ForegroundService.isRunning()){}
    console.log("Unsubscribing!");
    subscription.unsubscribe();
    magnSubscription.unsubscribe();
}

export default class App extends Component {
    constructor() {
        super();
        this.appSettings = null;
        this.state = { isLoading: true }
    }

    async componentDidMount() {
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

        this.appSettings = {
            fgServiceRunning: false,
            fgServiceNotificationConfig: null,
            fgServiceTaskName: "bgSensors",
            startFgService,
            stopFgService
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
