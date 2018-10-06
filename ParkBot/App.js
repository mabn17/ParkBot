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

PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
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


export default class App extends React.Component {
  /**
   * Sets the app to a loading state
   */
  constructor(props) {
    super(props);

    // Binding to accses "this"
   // this.isParkingAllowed = this.isParkingAllowed.bind(this);
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
    }
  }

  /**
   * Starts when the app launches
   * Dosent care if its in background or foreground
 */
  intervalId = () => BackgroundTimer.setInterval(() => {
    if (this.state.checkIntervals) {
      this.getUserLocationHandler(); 
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

  // Foreground
  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.intervalId();
    // this.getUserLocationHandler();
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
     * Geocoder (npm install --save react-native-geocoding)
     * 
     * @returns Object    The adress of the given location
   */
  getCurrentAddress = async () => {
    Geocoder.init(keys.googlePlaces);
    // this.state.userLocation.latitude, this.state.userLocation.longitude

    // Converts the 
    let lat = parseFloat(this.state.userLocation.latitude).toFixed(4);
    let lng = parseFloat(this.state.userLocation.longitude).toFixed(4);

    /* Geocoder.from(lng, lat)
    .then(json => {
      let addressComponent = json.results[0]["address_components"];
      console.log(addressComponent);
    })
    .catch(error => console.warn(error)); */
    Geocoder.from(lng, lat)
    .then(json => {
      let addressComponent = json.results[0]["address_components"][1]["short_name"];
      return addressComponent;
    }).then((addressComponent) => {
      if (this.getRegister(addressComponent).length) {
        this.sendNotification();
      } else {
        console.log("IM HERE");
        this.sendNotification();
      }
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
