import React from 'react';
import { 
  StyleSheet, Text,
  View, AppState,
  ToastAndroid,
  BackHandler,
  PermissionsAndroid
} from 'react-native';

import Geocoder from 'react-native-geocoding'; // yarn add
import PushNotification from'react-native-push-notification'; // yarn add
import BackgroundTimer from 'react-native-background-timer'; // yarn add
import ActivityRecognition from 'react-native-activity-recognition';
import FetchLocation from './components/FetchLocations';  // Button
import LoadingView from './components/Loading';  // Loading View
import Global from './components/Global';

import keys from './components/ApiKeys';

PushNotification.configure({
  onRegister: function(token) {
    console.log(token);
  },

  onNotification: function(notification) {
    setTimeout(() => {
      if (!notification['foreground']) {
        ToastAndroid.show("Closing app", ToastAndroid.SHORT);
        BackHandler.exitApp();
      }
    }, 1);
    PushNotification.localNotificationSchedule({
      title: 'Notification with my name',
      message: notification['name'],
      date: new Date(Date.now() + (60 * 1000))
    });
  },

  senderID: keys.firebaseSenderId,
});

// ONLY LOGS WHILE IN BG?? AND ONES??
this.unsubscribe = ActivityRecognition.subscribe(detectedActivities => {
  console.log(detectedActivities.sorted[0]);
  Global.myActivityVar = detectedActivities.sorted[0];
});

/* ActivityRecognition.start(1000); */

/* ActivityRecognition.stop()
this.unsubscribe(); */

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.checkActivity = this.checkActivity.bind(this);
    this.intervalId = this.intervalId.bind(this);
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
    this.getCurrentAddress = this.getCurrentAddress.bind(this);
  
    this.state = {
      isLoading: true,
      checkIntervals: true,
      userLocation: {
        longitude: 'Not loaded',
        latitude: 'Not loaded'
      },
      dontParkHere: null,
      activity: {},
    }
  }

  checkActivity = () => {
    const detectionIntervalMillis = 1000;
    const test = ActivityRecognition.start(detectionIntervalMillis);
    console.log('NY', Global.myActivityVar);
    ActivityRecognition.stop();
  }

  intervalId = () => BackgroundTimer.setInterval(() => {
    if (this.state.checkIntervals) {
      this.checkActivity();
      // this.getUserLocationHandler();
    }
  }, 3000);

  sendNotification() {
    this.setState({
      checkIntervals: false
    });

    if (this.state.dontParkHere[0]) {
      PushNotification.localNotification({
        title: 'Coordinates',
        message: 'NEJ: Lat: ' + this.state.userLocation.latitude + ", Lng: " + this.state.userLocation.longitude,
        date: new Date(Date.now() + (60 * 1000))
      });
    } else {
      PushNotification.localNotification({
        title: 'Coordinates',
        message: 'Du kan parkera här',
        date: new Date(Date.now() + (60 * 1000))
      });
    }
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    // ActivityRecognition.stop();
    this.intervalId();
  }
  componentWillMount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appppState) {
    if (appppState  === 'background') {
      console.log("App state is now in background");
      // this.intervalId();
    }
  }


  // getCurrentPosition || watchPosition
  getUserLocationHandler = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log(pos.coords);
      this.setState({
        userLocation: pos.coords
      });
    }, (err) => { 
      navigator.geolocation.getCurrentPosition((pos) => {
        console.log("Trying again", pos.coords);
        this.setState({ userLocation: pos.coords });
      });
      }, { enableHighAccuracy: true, timeout: 3000, maximumAge: 3000 });
  }

  /* Geocoder.from(lng, lat)
    .then(json => {
      let addressComponent = json.results[0]["address_components"];
      console.log(addressComponent);
    })
    .catch(error => console.warn(error)); */
  getCurrentAddress = async () => {
    Geocoder.init(keys.googlePlaces);
 
    let lat = parseFloat(this.state.userLocation.latitude).toFixed(4);
    let lng = parseFloat(this.state.userLocation.longitude).toFixed(4);

    Geocoder.from(lng, lat)
    .then(json => {
      let addressComponent = json.results[0]["address_components"][1]["short_name"];
      return addressComponent;
    }).then((addressComponent) => {
      let thisISBS = this.getRegister(addressComponent);
      return thisISBS;
    }).then((thisISBS) => {
      if (thisISBS.length >= 1) {
        this.sendNotification();
      } else {
        console.log("IM HERE");
        this.sendNotification();
      }
    })
    .catch(error => console.warn(error));
  }

  getRegister = async (currentStreet) => {
      currentStreet = currentStreet || null;
    try {
      let response = await fetch(
        'http://10.0.2.2:1337/search/' + currentStreet
      );
      let jsonResponse = await response.json();
      console.log(jsonResponse);
      this.setState({
        dontParkHere: jsonResponse
      });
      this.setState({ isLoading: false });
      return jsonResponse;
    } catch (err) {
      console.log(err);
      this.getRegister();
    }
  }

  render() {
    if (this.state.isLoading) {
      this.getRegister();
      return(
        <LoadingView />
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>ParkBot Karlskrona</Text>
        <FetchLocation onGetLocation={this.getCurrentAddress} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: '#e73737',
  }
});
