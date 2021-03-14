import {Body, Button, Container, Content, Header, Icon, Left, Right, Title} from "native-base";
import {Text, View} from "react-native";
import React,{useContext} from "react";
import AppContext from "../../components/AppContext";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from '@react-navigation/native';

export default function MainScreen({navigation}) {
    const appContext = useContext(AppContext);

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
                        Header
                    </Title>
                </Body>
                <Right/>
            </Header>
            <Content padder>
                <Text>
                    Lorem ipsum...
                </Text>
                <Button full rounded dark
                        style={{marginTop: 10}}
                        onPress={() => navigation.navigate("Sensors data")}>
                    <Text style={{
                        color: '#e3e3e3'
                    }}>Check sensors</Text>
                </Button>

                <Button full rounded success
                        style={{marginTop: 10}}
                        onPress={() => appContext.startFgService(appContext)}>
                    <Text style={{
                        color: '#e3e3e3'
                    }}>START bg data collection</Text>
                </Button>

                <Button full rounded warning
                        style={{marginTop: 10}}
                        onPress={() => appContext.stopFgService(appContext)}>
                    <Text style={{
                        color: '#e3e3e3'
                    }}>STOP bg data collection</Text>
                </Button>
            </Content>
        </Container>
);
}