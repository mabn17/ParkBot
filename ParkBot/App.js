import React from 'react';
import { 
  StyleSheet, Text,
  View, AppState,
  ToastAndroid,
  BackHandler,
} from 'react-native';

import Geocoder from 'react-native-geocoding'; // yarn add
import PushNotification from'react-native-push-notification'; // yarn add
import BackgroundTimer from 'react-native-background-timer'; // yarn add
import ActivityRecognition from 'react-native-activity-recognition'; // yarn add
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
        latitude: 'Not loaded',
        heading: null,
      },
      dontParkHere: null,
      inVehicle: false,
      street: null,
      activity: {},
    }
  }

  checkActivity = () => {
    ActivityRecognition.start(1000);

    this.setState({ activity: Global.myActivityVar });
    ActivityRecognition.stop();
  }

  intervalId = () => BackgroundTimer.setInterval(() => {
    if (this.state.checkIntervals) {
      this.getUserLocationHandler();
      this.checkActivity();
      if (this.state.inVehicle) {
        console.log("Waiting for person to be on foot");
        if ((this.state.activity.type == "WALKING" || this.state.activity.type == "STILL" ) && (this.state.activity.confidence >= 75)) {
          this.getCurrentAddress();
        }
      } else if ((this.state.activity.type == "IN_VEHICLE" || this.state.activity.type == "ON_BICYCLE") && (this.state.activity.confidence >= 50)) {
        console.log("Waiting for person to be on foot");        
        this.setState({ inVehicle: true });
      } else {
        console.log("Still waiting for driver");
      }
    }
  }, 5000);

  sendNotification() {
    this.setState({
      checkIntervals: false
    });

    if (this.state.dontParkHere[0]) {
      PushNotification.localNotification({
        title: 'Coordinates',
        message: 'Platsen du befinner dig på kommer att rengöras inom de närmsta 24 timmarna. Dubbelkolla gärna med gatusopningsregistret.',
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
    this.intervalId();
  }
  componentWillMount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appppState) {
    if (appppState  === 'background') {
      console.log("App state is now in background");
    }
  }

  getUserLocationHandler = () => {
    this.checkActivity();
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log(pos.coords);
      this.setState({
        userLocation: pos.coords
      });
    }, (err) => { 
      navigator.geolocation.getCurrentPosition((pos) => {
        console.log('Trying Again', pos.coords);
        this.setState({ userLocation: pos.coords });
      });
      }, { enableHighAccuracy: true, timeout: 3000, maximumAge: 3000 });
  }

  getCurrentAddress = async () => {
    Geocoder.init(keys.googlePlaces);
 
    let lat = parseFloat(this.state.userLocation.latitude);
    let lng = parseFloat(this.state.userLocation.longitude);

    //switch place
    Geocoder.from(lat, lng)
    .then(json => {
      let addressComponent = json.results[0]["address_components"][1]["short_name"];
      this.setState({ street: addressComponent });
      return addressComponent;
    }).then((addressComponent) => {
      let registerResponce = this.getRegister(addressComponent);
      return registerResponce;
    }).then((registerResponce) => {
      if (registerResponce.length >= 1) {
        this.sendNotification();
      } else {
        this.sendNotification();
      }
    })
    .catch(error => console.warn(error));
  }

  getRegister = async (currentStreet) => {
      currentStreet = currentStreet || null;
    try {
      let response = await fetch(
        keys.herokuUrl + currentStreet
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
        <Text>{this.state.activity.type} {this.state.activity.confidence}</Text>
        <Text>{this.state.userLocation.latitude} {this.state.userLocation.longitude}</Text>
        <Text>{this.state.street}</Text>
        <Text>  </Text>
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
