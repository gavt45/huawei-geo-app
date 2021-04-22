import React from 'react';
import RNLocation from 'react-native-location';


RNLocation.configure({
    distanceFilter: 0
})
const Geolocation = {
    permissionHandle: async () => {

        let permission = await RNLocation.checkPermission({
            ios: 'whenInUse', // or 'always'
            android: {
                detail: 'coarse' // or 'fine'
            }
        });

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

        let location;

        if (!permission) {
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
            location = await RNLocation.getLatestLocation({timeout: 100})
            console.log(location, location.longitude, location.latitude,
                location.timestamp)
        } else {
            location = await RNLocation.getLatestLocation({timeout: 100})
            console.log(location, location.longitude, location.latitude,
                location.timestamp)
        }

    }
}
export default Geolocation;
