import {Body, Button, Container, Content, Header, Icon, Left, Right, Title, Item, Input} from "native-base";
import {StyleSheet, Text, View} from "react-native";
import React, {useContext, Component} from "react";
import AppContext from "../../components/AppContext";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from '@react-navigation/native';

export default function MainScreen({navigation}) {
    let appContext = useContext(AppContext);
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
                <Item regular>
                    <Input>
                        UUID: {appContext.uuid}
                    </Input>
                </Item>
                <Button full rounded dark
                        style={{marginTop: 10}}
                        onPress={() => navigation.navigate("Sensors data")}>
                    <Text style={{
                        color: '#e3e3e3'
                    }}>Check sensors</Text>
                </Button>
                <Item regular style={{marginTop: 20}}>
                    <Input placeholder="http://192.168.1.62:8000/" onChangeText={(text) => {appContext.setUri(text)}} />
                </Item>
                <Button full rounded success
                        style={{marginTop: 20}}
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
                <Button full rounded sucess
                        style={{marginTop: 10}}
                        onPress={appContext.permissionHandle}>
                    <Text style={{
                        color: '#e3e3e3'
                    }}>Log geoposition</Text>
                </Button>

            </Content>
        </Container>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
