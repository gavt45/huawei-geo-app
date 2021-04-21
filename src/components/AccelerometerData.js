import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Card, CardItem, Body, Button, Content} from 'native-base';
import {Accelerometer} from 'expo-sensors';


export default function AccelerometerData() {
    const [data, setData] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const [subscription, setSubscription] = useState(null);

    const _slow = () => {
        Accelerometer.setUpdateInterval(1000);
    };

    const _fast = () => {
        Accelerometer.setUpdateInterval(16);
    };

    const _subscribe = () => {
        setSubscription(
            Accelerometer.addListener(accelerometerData => {
                setData(accelerometerData);
            })
        );
    };

    const _unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    useEffect(() => {
        _subscribe();
        return () => _unsubscribe();
    }, []);

    const {x, y, z} = data;
    return (
        <Card>
            <CardItem header bordered>
                <Text>Accelerometer data</Text>
            </CardItem>
            <CardItem bordered>
                <Body>
                    <Text>Accelerometer: (in Gs where 1 G = 9.81 m s^-2)</Text>
                    <Text>
                        x: {x.toFixed(3)} y: {y.toFixed(3)} z: {z.toFixed(3)}
                    </Text>
                    <Button block danger rounded onPress={subscription ? _unsubscribe : _subscribe}
                            style={{marginTop: 10}}>
                        <Text>{subscription ? 'On' : 'Off'}</Text>
                    </Button>
                    <Button block rounded onPress={_slow} style={{marginTop: 10}}>
                        <Text>Slow</Text>
                    </Button>
                    <Button block rounded onPress={_fast} style={{marginTop: 10}}>
                        <Text>Fast</Text>
                    </Button>
                </Body>
            </CardItem>
        </Card>
    );
}