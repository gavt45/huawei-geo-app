import React from 'react';
import RNLocation from 'react-native-location';


RNLocation.configure({
    distanceFilter: 0,
    interval: 100
});

export default class Geolocation {
    Geolocation(){}

    /* Example location returned
                    {
                      speed: -1,
                      longitude: -0.1337,
                      latitude: 51.50998,
                      accuracy: 5,
                      heading: -1,
                      altitude: 0,
                      altitudeAccuracy: -1
                      floor: 0
                      timestamp: 1446007304457.029,
                      fromMockProvider: false
                    }
                    */
    async subscribeToUpdates(locFunc) {
        let permission = await RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
                detail: "fine",
                rationale: {
                    title: "We need to access your location",
                    message: "We use your location to show where you are on the map",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel"
                }
            }
        })

        while (!permission) {
            permission = await RNLocation.requestPermission({
                ios: "whenInUse",
                android: {
                    detail: "fine",
                    rationale: {
                        title: "We need to access your location",
                        message: "We use your location to show where you are on the map",
                        buttonPositive: "OK",
                        buttonNegative: "Cancel"
                    }
                }
            })
        }

        this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
            locFunc(locations[0]);
        });

        console.log("returning ", this.locationSubscription, " from subscribeToUpdates");

        return this.locationSubscription;
    }

    // async permissionHandle() {
    //     let permission = await RNLocation.requestPermission({
    //         ios: "whenInUse",
    //         android: {
    //             detail: "fine",
    //             rationale: {
    //                 title: "We need to access your location",
    //                 message: "We use your location to show where you are on the map",
    //                 buttonPositive: "OK",
    //                 buttonNegative: "Cancel"
    //             }
    //         }
    //     })
    //     let location;
    //     if (!permission) {
    //         permission = await RNLocation.requestPermission({
    //             ios: "whenInUse",
    //             android: {
    //                 detail: "fine",
    //                 rationale: {
    //                     title: "We need to access your location",
    //                     message: "We use your location to show where you are on the map",
    //                     buttonPositive: "OK",
    //                     buttonNegative: "Cancel"
    //                 }
    //             }
    //         })
    //         location = await RNLocation.getLatestLocation({timeout: 100})
    //         console.log(location, location.longitude, location.latitude,
    //             location.timestamp)
    //     } else {
    //         location = await RNLocation.getLatestLocation({timeout: 100})
    //         console.log(location, location.longitude, location.latitude,
    //             location.timestamp)
    //     }
    //
    //     return location;
    // }
};
