import React from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export default class GeolocationExample extends React.Component<
    {},
    $FlowFixMeState,
    > {
    state = {
        initialPosition: 'unknown',
        lastPosition: 'unknown',
    };

    watchID: ?number = null;

    componentDidMount() {
        Geolocation.getCurrentPosition(
            position => {
                const initialPosition = JSON.stringify(position);
                this.setState({initialPosition});
            },
            error => Alert.alert('Error', JSON.stringify(error)),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1},
        );
        this.watchID = Geolocation.watchPosition(position => {
            const lastPosition = JSON.stringify(position);
            this.setState({lastPosition});
        });

        //добавили мы
        this.watch = setInterval(() => {
            console.log("Trying to get pos!");
            console.log(this.state.lastPosition);
            Geolocation.getCurrentPosition(
                position => {
                    const lastPosition = JSON.stringify(position);
                    this.setState({lastPosition});
                },
                // error => Alert.alert('Error', JSON.stringify(error)),
                {enableHighAccuracy: true, timeout: 20000, maximumAge: 1},
            );
        }, 2000);
    }

    componentWillUnmount() {
        this.watchID != null && Geolocation.clearWatch(this.watchID);
    }

    render() {
        return (
            <View>
                <Text>
                    <Text style={styles.title}>Initial position: </Text>
                    {this.state.initialPosition}
                </Text>
                <Text>
                    <Text style={styles.title}>Current position: </Text>
                    {this.state.lastPosition}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontWeight: '500',
    },
});
