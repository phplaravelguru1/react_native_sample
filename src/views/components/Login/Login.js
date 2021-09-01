import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView,Alert,Platform,Modal } from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser } from 'assets';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { checkVersion } from "react-native-check-version";
import { openDatabase } from 'react-native-sqlite-storage';
import PushNotification from "react-native-push-notification";
var db = openDatabase({ name: 'UserDatabase.db' });
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
const data = new FormData();
class Login extends Component {
  constructor(props){
    super(props);
     db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),comment VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),apt_number VARCHAR(100),building_img VARCHAR(255),process_status VARCHAR(10),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255),shipper_number VARCHAR(255),person_name VARCHAR(100))',
              []
            );
        }
      );
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_retaildrop');
    });
    db.transaction(function (txn) {
        txn.executeSql('DROP TABLE IF EXISTS table_rtw', []);
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_settlement');
    });
    db.transaction(function (txn) {
        txn.executeSql('DROP TABLE IF EXISTS table_inspection', []);
    });

    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_pickups');
    });
    this.state = {
      email: "",
      password: '',
      isloading: false,
      mac_address: '',
      versionModal:false,
      device_token:'',
      apn_device_token:''
    }
    // DeviceInfo.getMacAddress().then((mac) => {
    //   this.setState({mac_address:mac});
    // });
    // DeviceInfo.getUniqueId().then((mac) => {
    //     this.setState({mac_address:mac});
    // });
  }
  componentDidMount() {
    this.getLocationPermissions();
        PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister:(token) => {
        console.log( 'TOKEN:', token );
        this.setState({apn_device_token:token.token});
 if(Platform.OS == 'ios') {
       fetch('https://iid.googleapis.com/iid/v1:batchImport',{
    method: 'POST',
    headers: {
      "content-type": "application/json",
    "authorization": "Bearer AAAAEaKahDI:APA91bF3XH5P20mQffW5nEDplK0GAygUOcCJ6Ki5p08K2b4VZ4CKXPdCBQ-WyD8XCFPpB7DxDND1BDuiNIAzKWh4HfqywCFDfqqSricTjCqh8VzQQ-EdEyxrr4BTGNtMhyQ91ELz2FUy",
    "cache-control": "no-cache",
    "postman-token": "35478614-4b23-5f28-e499-ce2b7f489c3f"
    },
    body:JSON. stringify({"application": 'com.myself21.Trans8',"sandbox":false,"apns_tokens":[
                    token.token
                 ]})
  })
  .then((response) => response.json())
  .then((res) => {
    if(res.results[0].status == 'OK') {
              this.setState({device_token:res.results[0].registration_token});
            }
  })
  .catch(function (error) {
    console.log(error);
  });
    } else {
      this.setState({device_token:token.token});
    }
    },
    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
    },
    permissions: {
        alert: true,
        badge: true,
        sound: true
    },
    popInitialNotification: true,
    requestPermissions: true,
});
    this.checkUpdateNeeded();
     if(Platform.OS == 'ios') {
      this.setState({mac_address:DeviceInfo.getUniqueId()});
    } else {
      DeviceInfo.getMacAddress().then((mac) => {
      this.setState({mac_address:mac});
    });
    }
  }
  checkUpdateNeeded = async () => {
    const version = await checkVersion();
    console.log("Got version info:", version.version);
    console.log("Old version info:", DeviceInfo.getVersion());
    if (version.version > DeviceInfo.getVersion()) {
      this.setState({versionModal:false});
      // console.log(`App has a ${version.updateType} update pending.`);
      //  Alert.alert(
      //   'Update App',
      //   'Latest version available in app store please update your app',
      //   [
      //     { text: 'OK', onPress: () => console.log('OK Pressed') },
      //   ],
      //   { cancelable: false },
      // );
    }
}

  getLocationPermissions = async (): Promise<void> => {
  try {
    const granted = await request(
    Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    }),
  );
  return granted === RESULTS.GRANTED;
    } catch (err) {
      console.log(err);  
    }
  }

  
  loginSubmit = () => {
    // alert(this.state.device_token);
    const email = this.state.email;
    const password = this.state.password;
    var error = false;
    var msg = '';
    var _this = this;
    if(email.trim() == '')
    {
      msg += 'Please enter username.\n';
      var error = true;
    }
    if(password.length < 6)
    {
      msg += 'Please enter password.';
      var error = true;
    }
    if(!error) {
      //check email valid
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (reg.test(email) === false) {
        msg += 'Please enter valid email.';
        var error = true;
      }
    }
    if(error)
    {
      _showErrorMessage(msg);
    } else {
        this.setState({
          isloading: true,
        });
        var _this = this;
       console.log(data);
        data.append('email', email );
        data.append('password', password );
        data.append('mac_address', this.state.mac_address );
        data.append('device_token', this.state.device_token );
        data.append('apn_device_token', this.state.apn_device_token );
        data.append('is_using_rescue_app', 'yes');
        console.log(data);
        fetch(config.API_URL+'rescue_login',{
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body:data
        })
        .then((response) => response.json())
        .then((res) => {
          console.log(res);
          this.setState({
            isloading: false,
          });
          if(res.status == 1 && res.data.is_rescue_load_ready == 'yes')
          {
            let appState = {
              isLoggedIn: true,
              userInfo: res.data
            };
            _storeUser(appState).then((user) => {
              _this.props.navigation.replace("Splash");
            });
          }
          else if(res.status == 0)
          {
            _showErrorMessage(res.message, true)
          } 
          else if(res.data.is_rescue_load_ready == 'no')
          {
            _showErrorMessage('Rescue load not ready for you')
          } else {
            throw "Error";
          }
        })
        .catch(function (error) {
          _showErrorMessage(error.message);
          _this.setState({
            isloading: false,
          });
        });
    }
  }
  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
      <Modal animationType="slide" transparent={true} visible={this.state.versionModal}>
        <View style={{flex: 1,alignItems: "center",marginTop: 70,padding: 10, height:500}}>
          <View style={{backgroundColor: "white",borderRadius: 20,shadowColor: "#000",borderColor: '#F9CCBE',
borderWidth: 1,shadowOffset: {width: 0,height: 2},shadowOpacity: 0.25,shadowRadius: 3.84,elevation: 5}}>
            <View style={{alignSelf:'center',padding:10,height:80}}>
            <Text style={{fontSize:30, fontWeight:'bold', paddingTop:25}}>UPDATE APP</Text>
            </View>
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:10,height:100}}>
              <Text style={{fontSize:22,color: 'red',alignSelf:'center', textAlign:'center'}}>ALERT: UPDATE TO THE LATEST VERSION OF THE APP TO CONTINUE.</Text>
            </View>
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:10,height:20}}>
            </View>
          </View>
        </View>
      </Modal>
      <Container padder style={{backgroundColor: '#fff'}}>
          <View style={{ height: '100%', flexDirection: 'column' }}>
            <View style={{ backgroundColor: '#00C2F3', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 }}>
              <Image
                style={{ height: 100, width: 200, resizeMode: 'contain', alignSelf: 'center', position: 'relative', top: '85%' }}
                source={image.logo}
              />
            </View>
            <View style={{flex: 1}}>
              <View style={{ marginTop: 50, padding: 10}}>
                <Form>
                  <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Email</Label>
                    <Item style={{ borderBottomColor: '#00C2F3'}}>
                      <Icon type="FontAwesome" name='user' style={{ color: '#00C2F3'}}/>
                      <Input placeholder="Enter your email" onChangeText={(email) => this.setState({ email: email })}/>
                    </Item>
                  </Item>
                  <Item stackedLabel last>
                    <Label style={{ fontWeight: 'bold' }}>Password</Label>
                    <Item style={{ borderBottomColor: '#00C2F3'}}>
                      <Icon type="FontAwesome" name='lock' style={{ color: '#00C2F3'}} />
                      <Input onChangeText={(password) => this.setState({ password: password })} secureTextEntry={true} placeholder="....."/>
                    </Item>
                  </Item>
                  <Item style={{ justifyContent: 'flex-end', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => { this.props.navigation.replace('ForgotPassword') }}>
                      <Text>Forgot Password?</Text>
                    </TouchableOpacity>
                  </Item>
                </Form>
                <Button block style={{ width:"85%", height: 50, padding:15, marginTop: 20, backgroundColor: '#00C2F3', alignSelf: 'center' }}
                    onPress={() =>
                        this.loginSubmit()
                      }
                  >
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>LOGIN</Text>
                </Button>
                <TouchableOpacity style={{alignSelf: 'center', top:18}} onPress={() => { this.props.navigation.replace('SignUp') }}>
                      <Text style={{fontSize: 16,color:'#00C2F3',textDecorationLine: 'underline'}}>{"Don't have an account? Sign up"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </Container>
      {this.state.isloading && (
              <Loader />
          )}
      </SafeAreaView>
    );
  }
}
export default Login;