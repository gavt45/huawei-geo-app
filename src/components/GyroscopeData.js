import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Gyroscope} from 'expo-sensors';
import {Body, Button, Card, CardItem} from "native-base";

export default function GyroscopeData() {
    const [data, setData] = useState({
        x: 0,
        y: 0,
        z: 0,
    });
    const [subscription, setSubscription] = useState(null);

    const _slow = () => {
        Gyroscope.setUpdateInterval(1000);
    };

    const _fast = () => {
        Gyroscope.setUpdateInterval(16);
    };

    const _subscribe = () => {
        setSubscription(
            Gyroscope.addListener(gyroscopeData => {
                setData(gyroscopeData);
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
                <Text>Gyroscope data</Text>
            </CardItem>
            <CardItem bordered>
                <Body>
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