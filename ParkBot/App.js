import React from 'react';
import { 
  StyleSheet, Text,
  View, AppState,
  ToastAndroid,
  BackHandler
} from 'react-native';

import Geocoder from 'react-native-geocoding'; // yarn add
import PushNotification from'react-native-push-notification'; // yarn add
import BackgroundTimer from 'react-native-background-timer'; // yarn add
import FetchLocation from './components/FetchLocations';  // Button
import LoadingView from './components/Loading';  // Loading View

import keys from './components/ApiKeys';

/**
 * Starts when the app launches
 * Dosent care if its in background or foreground
 */
const intervalId = BackgroundTimer.setInterval(() => {
  console.log('tic');
}, 200);

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function(token) {
    console.log(token);
  },

  onNotification: function(notification) {
    setTimeout(() => {
      if (!notification['foreground']) {
        ToastAndroid.show("Closing app", ToastAndroid.SHORT);
        BackgroundTimer.clearInterval(intervalId);
        BackHandler.exitApp();
      }
    }, 1);
    PushNotification.localNotificationSchedule({
      title: 'Notification with my name',
      message: notification['name'],
      date: new Date(Date.now() + (60 * 1000))
    });
  },

  // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
  senderID: keys.firebaseSenderId,
});


export default class App extends React.Component {
  /**
   * Sets the app to a loading state
   */
  constructor(props) {
    super(props);

    // Binding to accses "this"
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
    this.getCurrentAddress = this.getCurrentAddress.bind(this);
    this.state = {
      isLoading: true,
      userLocation: {
        longitude: 'Not loaded',
        latitude: 'Not loaded'
      },
      dontParkHere: null,
    }
  }

  sendNotification() {
    if (this.state.dontParkHere[0]) {
      PushNotification.localNotification({
        title: 'Coordinates',
        message: 'Lat: ' + this.state.userLocation.latitude + ", Lng: " + this.state.userLocation.longitude,
        date: new Date(Date.now() + (60 * 1000))
      });
    } else {
      PushNotification.localNotification({
        title: 'Coordinates',
        message: 'NO DATA FOUND',
        date: new Date(Date.now() + (60 * 1000))
      });
    }
  }

  // Foreground
  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.getUserLocationHandler();
  }

  // Background
  componentWillMount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appppState) { // import BackgroundTimer from 'react-native-background-timer'; // yarn add
    if (appppState  === 'background') {
      // TODO: Handle background things
      console.log("App state is now in background");
    }
  }

    /**
   * Uses geolocation when a button is pressed
   * TODO:
   * Save the whole pos.coords in this.state.userLocation.
   * Only look up pos in maps when speed is 0 ????
   * 
   * @returns Object coordinates of the current position
   */
  getUserLocationHandler = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      console.log(pos.coords);
      this.setState({
        userLocation: pos.coords
      });
    }, err => console.log(err));  
  }

    /**
   * Uses Geocoder (npm install --save react-native-geocoding)
   *      to get the adress from getUserLocationHandler()'s
   *                        coordinates
   * 
   * @param float lat    Current  latitude
   * @param float lng    Current  longitude
   * 
   * @returns Object    The adress of the given location
   * 56.1598974  15.5822963 = Arklimästaregatan || lat = mindre || long = högre
   */
  getCurrentAddress = () => {
    Geocoder.init(keys.googlePlaces);
    // this.state.userLocation.latitude, this.state.userLocation.longitude

    // Converts the 
    let lat = parseFloat(this.state.userLocation.latitude).toFixed(4);
    let lng = parseFloat(this.state.userLocation.longitude).toFixed(4);

    Geocoder.from(lng, lat)
    .then(json => {
        let addressComponent = json.results[0];
      console.log(addressComponent);
    })
    .catch(error => console.warn(error));
  }

  /**
   * Fetches the gatusopningsschema from custom build API
   * On fail logs the error and retrys to fetch the data
   * 
   * @returns Object    Karlskrona kommuns gatusopningsschema
   * @returns Object    changes this.state.isLoading value to false
   */
  async getRegister() {
    try {
      let response = await fetch(
        'http://10.0.2.2:1337/get/current/cleaned'
      );
      let jsonResponse = await response.json();
      console.log(jsonResponse);
      this.setState({
        dontParkHere: jsonResponse
      });
      this.setState({ isLoading: false });
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
        <FetchLocation onGetLocation={this.sendNotification} />
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
