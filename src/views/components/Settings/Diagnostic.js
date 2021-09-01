import React, {Component } from 'react';
import { LogBox,View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,TextInput, Platform, Dimensions} from 'react-native';
import { Container,FlatlistContent, Header, Content, Form,Textarea, Item, Input, Label,Button, Toast, Icon, Accordion, Picker } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeData,_retrieveData } from 'assets';
import styles from './styles';
import { getData,postData } from 'api';
import CustomHeader from '../../CustomHeader';
import ImagePicker from 'react-native-image-picker'; 
import {Linking} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { measureConnectionSpeed } from 'react-native-network-bandwith-speed';
import Geolocation from 'react-native-geolocation-service';
class Diagnostic extends Component {
  constructor(props) {
     super(props);
  this.state = {
      isloading: false,
      user_avtar:null,
      current_password:null,
      new_password:null,
      confirm_password:null,
      user_avtar:'',
      showPassword:false,
      is_helpline:false,
      yard_address:'5825 Dixie, Mississauga, ON L4W4V7',
      yard_time:'',
      helplineDetails:[],
      app_version:null,
      build_number:null,
      system_name:null,
      netSpeed:null,
      phone_network:null,
      device_unique_id:null,
      device_manufacturer:null,
      device_brand:null,
      device_model:null,
      device_id:null,
      system_name:null,
      system_version:null,
      bundle_id:null,
      build_number:null,
      app_version:null,
      app_version_readable:null,
      device_name:null,
      user_agent:null,
      device_locale:null,
      device_country:null,
      device_timezone:null,
      app_instance_id:null,
      ba:null, 
      battery_level: '',
      gps_long:'',
      gps_lat:'',
      is_submit:0
    };
  }


componentDidMount = () => {
  const _this = this;
  this.interval = setInterval(() => this.checkDNetSpeed(), 5000);
  this.refreshCurrentScreen();
  DeviceInfo.getBatteryLevel().then((batteryLevel) => {
         this.setState({battery_level:batteryLevel});
      });
};

 componentWillUnmount(){
    clearInterval(this.interval);
  }

  checkDNetSpeed() {
    const {is_submit,netSpeed} = this.state;
      if(is_submit == 0 && netSpeed != null) {
        this.onSubmit();
      }
  }

  onSubmit() {
    
    let device_unique_id = this.state.device_unique_id;
    let device_manufacturer = this.state.device_manufacturer;
    let device_brand = this.state.device_brand;
    let device_model = this.state.device_model;
    let device_id = this.state.device_id;
    let system_name = this.state.system_name;
    let system_version = this.state.system_version;
    let bundle_id = this.state.bundle_id;
    let build_number = this.state.build_number;
    let app_version = this.state.app_version;
    let app_version_readable = this.state.app_version_readable;
    let device_name = this.state.device_name;
    let user_agent = this.state.user_agent;
    let device_locale = this.state.device_locale;
    let device_country = this.state.device_country;
    let device_timezone = this.state.device_timezone;
    let app_instance_id = this.state.app_instance_id;
    let battery_level = this.state.battery_level;
    let phone_network = this.state.phone_network;
    let data_speed = this.state.netSpeed;
    let gps_long = this.state.gps_long;
    let gps_lat = this.state.gps_lat;

    this.props.offLoder();

     if(this.state.gps_long == '' || this.state.gps_lat == '') {
      Geolocation.getCurrentPosition((position) => {
          
          gps_long = JSON.stringify(position.coords.longitude);
          gps_lat = JSON.stringify(position.coords.latitude);

          this.setState({
          gps_long: gps_long,
          gps_lat: gps_lat
          });
            },
            (error) => {
              this.setLocationStatus(error.message+" Please try again");
            },
            {
        enableHighAccuracy: false,
        timeout: 15000
      });
  }


      if(gps_long == '' || gps_long == null) {
        if(this.state.locationAttempt == 0) {
          this.setState({locationAttempt:1});
          //_showErrorMessage('Location not Found please try again');
          //return false;
        }
      }


    var postdata = { battery_level:battery_level,data_speed:data_speed,device_unique_id:device_unique_id,device_manufacturer:device_manufacturer,device_brand:device_brand,device_brand:device_brand,device_model:device_model,device_id:device_id,system_name:system_name,system_version:system_version,bundle_id:bundle_id,build_number:build_number,app_version:app_version,app_version_readable:app_version_readable,device_name:device_name,user_agent:user_agent,device_locale:device_locale,device_country:device_country,device_timezone:device_timezone,app_instance_id:app_instance_id,gps_lat:gps_lat,gps_long:gps_long,phone_network:phone_network};
    console.log(postdata);
    
    const _this = this;
    this.setState({ isloading: true });
    postData(postdata,'save_diagnostic').then((res) => {
      console.log(res);
      this.setState({is_submit:1});
    
    })
    .catch(function (error) {
      console.log(error);
      this.setState({ isloading: false });
      _showErrorMessage(error.message);
                
    });
  }


  getCurrentPosition2() {
  console.log("enter in location 2");
Geolocation.getCurrentPosition(
        (position) => {
          console.log(position);
          this.setState({
          gps_long: position.coords.longitude,
          gps_lat: position.coords.latitude
        });
        },
        (error) => {
          // See error code charts below.
          _showErrorMessage(error.message)
          // console.log(error.code, error.message);
        },
        { enableHighAccuracy: false, timeout: 15000 }
    );
}

  getCurrentPosition() {
  Geolocation.getCurrentPosition(
    //Will give you the current location
    (position) => {
          console.log(position);
          this.setState({
          gps_long: position.coords.longitude,
          gps_lat: position.coords.latitude
        });
        },
    (error) => {
      this.getCurrentPosition2();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 7000 }
  );
}


helplineScreen() {
    this.getHelplineNumbers();
    this.setState({is_helpline:true,is_diagnostic:false,mainPage:false});
   }

refreshCurrentScreen () {
    this.props.onLoder();
    this.getCurrentPosition();
    this.getNetworkBandwidth();
    DeviceInfo.getCarrier().then((phone_network) => {
         this.setState({phone_network:phone_network});
    });
    this.setState({is_submit:0,total_memory:DeviceInfo.getTotalMemory(), device_brand:DeviceInfo.getBrand(),device_model:DeviceInfo.getModel(),device_id:DeviceInfo.getDeviceId(),system_name:DeviceInfo.getSystemName(),system_version:DeviceInfo.getSystemVersion(),bundle_id:DeviceInfo.getBundleId(),build_number:DeviceInfo.getBuildNumber(),app_version:DeviceInfo.getVersion(),app_version_readable:DeviceInfo.getReadableVersion()});
  
}



   getNetworkBandwidth = async (): Promise<void> => {
  try {
    const networkSpeed: NetworkBandwidthTestResults = await measureConnectionSpeed();
      this.setState({netSpeed:networkSpeed.speed.toFixed(1)+' Mbps'})
   
    } catch (err) {
      console.log(err);  
    }
  }

  render() {
    const {
     backSection,
     backButton,
     backIcon,
     spaceDivider,
     labelVal,
     labelView,
     label
    } = styles;

    const {
      yard_address,
      yard_time,
      build_number,
      app_version,
      netSpeed,
      phone_network,
      device_brand,
      device_model,
      system_name,
      system_version,
      device_id,
      battery_level
    } = this.state;

    return (
      <View style={{paddingLeft:5,paddingRight:5}}>
              <View style={backSection}>
              <TouchableOpacity style={[backButton,{alignItems:'center'}]} onPress={() => this.props.backPage()}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 18,padding:10,textAlign:'center',right:5,alignItems:'center'}}>DIAGNOSTIC SECTION</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.refreshCurrentScreen()}>
            <Icon style={{color:'#fff',marginRight:20,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
            
          <View style={{marginTop:10, borderColor: '#00c2f3', borderWidth: 1,borderRadius:6}}>
              <View style={{height:10}}></View>
              <View style={labelView}>
                <Text style={label}>APP VERSION:</Text>
                
                <Text style={{fontSize: 16,flex: 1,fontWeight:'bold',color:'#054b8b', flexWrap: 'wrap',textAlign:'right'}}>{app_version} ({build_number}) {system_name}</Text>
              </View>
              <View style={{height:4}}></View>
              <View style={labelView}>
                <Text style={label}>DATA SPEED:</Text>
                <Text style={labelVal}>{netSpeed || null}</Text>
              </View>
              <View style={{height:4}}></View>
              <View style={labelView}>
                <Text style={label}>CARRIER:</Text>
                <Text style={labelVal}>{phone_network}</Text>
              </View>
              <View style={{height:4}}></View>
              <View style={labelView}>
                <Text style={label}>BRAND:</Text>
                <Text style={labelVal}>{device_brand || null}</Text>
              </View>

                

                <View style={{height:4}}></View>
                <View style={labelView}>
                <Text style={label}>MODEL:</Text>
                <Text style={labelVal}>{device_model || null}</Text>
                </View>

                 <View style={{height:4}}></View>
                <View style={labelView}>
                <Text style={label}>DEVICE ID:</Text>
                <Text style={labelVal}>{device_id || null}</Text>
                </View>

                <View style={{height:4}}></View>
                <View style={labelView}>
                <Text style={label}>SYSTEM NAME:</Text>
                <Text style={labelVal}>{system_name || null}</Text>
                </View>

                <View style={{height:4}}></View>
                <View style={labelView}>
                <Text style={label}>SYSTEM VERSION:</Text>
                <Text style={labelVal}>{system_version || null}</Text>
                </View>

                <View style={labelView}>
                <Text style={label}>BATTERY:</Text>
                <Text style={labelVal}>{Math.ceil(battery_level*100) || null}</Text>
                </View>

                
              <View style={{height:4}}></View>
          </View>
          </View>

         
         
         
    );
  }
}

export default Diagnostic;