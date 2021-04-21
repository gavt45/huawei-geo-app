import {Body, Button, Container, Content, Header, Icon, Left, Right, Title, List, ListItem} from "native-base";
import {Text, View} from "react-native";
import React from "react";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from '@react-navigation/native';
import AccelerometerData from "../components/AccelerometerData.js";
import BarometerData from "../components/BarometerData.js";
import MagnetometerData from "../components/MagnetometerData.js";
import GyroscopeData from "../components/GyroscopeData";
import GPS from "../components/GpsData";

const sensorCards = [GPS, AccelerometerData, BarometerData, MagnetometerData, GyroscopeData];

export default function ExpoTestScreen({navigation}) {
    var listItems = sensorCards.map((sensorCard) =>
        <ListItem>
            <Body>
                {React.createElement(sensorCard)}
            </Body>
        </ListItem>
    )
    return (
        <Container>
            <Header>
                <Left>
                    <Button
                        transparent
                        onPress={() => navigation.openDrawer()}
                    >
                        <Icon name='menu'/>
                    </Button>
                </Left>
                <Body>
                    <Title>
                        Detailed sensors output
                    </Title>
                </Body>
                <Right/>
            </Header>
            <Content padder>
                <Text>
                    Here would be detailed data!
                </Text>
                <List>
                    {listItems}
                </List>
            </Content>
        </Container>
    );
}