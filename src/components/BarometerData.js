import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Platform} from 'react-native';
import {Barometer} from 'expo-sensors';
import {Body, Button, Card, CardItem} from "native-base";

export default function BarometerData() {
    const [data, setData] = useState({});

    useEffect(() => {
        _toggle();
    }, []);

    useEffect(() => {
        return () => {
            _unsubscribe();
        };
    }, []);

    const _toggle = () => {
        if (this._subscription) {
            _unsubscribe();
        } else {
            _subscribe();
        }
    };

    const _subscribe = () => {
        this._subscription = Barometer.addListener(barometerData => {
            setData(barometerData);
        });
    };

    const _unsubscribe = () => {
        this._subscription && this._subscription.remove();
        this._subscription = null;
    };

    const {pressure = 0, relativeAltitude = 0} = data;

    return (
        <Card>
            <CardItem header bordered>
                <Text>Barometer data</Text>
            </CardItem>
            <CardItem bordered>
                <Body>
                    <Text>Barometer:</Text>
                    <Text>Pressure: {pressure * 100} Pa</Text>
                    <Text>
                        Relative Altitude:{' '}
                        {Platform.OS === 'ios' ? `${relativeAltitude} m` : `Only available on iOS`}
                    </Text>
                    <Button block danger rounded onPress={_toggle}
                            style={{marginTop: 10}}>
                        <Text>Toggle</Text>
                    </Button>
                </Body>
            </CardItem>
        </Card>
    );
}