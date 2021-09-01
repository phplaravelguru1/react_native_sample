import React, { Component } from 'react';
import { StyleSheet,View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView,Alert, Dimensions, Platform,Modal,TextInput} from 'react-native';
import { Picker,Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon,Switch } from 'native-base';
import { image, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_retrieveData,_storeData } from 'assets';
import { saveLocation ,getUser,getData,postData,postDataWithPic,getDataAwsRecog} from 'api';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../CustomHeader';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import { checkVersion } from "react-native-check-version";
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
import { RNCamera } from 'react-native-camera';
import styless from './styles';
import ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
class DriverKitStart extends Component {

constructor(props) {
    super(props);
      db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),notes VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),apt_number VARCHAR(100),building_img VARCHAR(255),process_status VARCHAR(10),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255),,shipper_number VARCHAR(255),person_name VARCHAR(100))',
              []
            );
        }
      );
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_retaildrop');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_rtw');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_settlement');
    });
    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_inspection');
    });

    db.transaction(function (txn) {
        txn.executeSql('DELETE FROM table_pickups');
    });
    this.state = {
      location:'',
      longitude:null,
      latitude:null,
      user_avtar:'',
      showPage: true,
      cid: 0,
      versionModal:false,
      KitQuestionList:[],
      qr_code:'',
      answer:[],
      questionIds:[],
      totalQuestionIds:[],
      placePic:null,
      isloading:false,
      battery_level: '',
      app_version:null,
      vehicle_plate:null,
      allFunc:true,
      notes:'',
      rtwAlert:false,
      rtwList:[],
      rtw_message:'Please return these packages to warehouse.',
      rtw_warehouse:'',
      rtw_date:'',
      kitAlert:false,
      kit_alert_msg:'',
      fuel_card_number:null,
      is_block_profile:false,
      header_title:null,
      locationAttempt:0,
      imageScanAttempt:0,
      gps_long:'',
      gps_lat:''
    };
  }




  componentDidMount = () => {

    _storeData('store_distance_time',null);
    _storeData('last_point_after_deleivery',null);

    DeviceInfo.getBatteryLevel().then((batteryLevel) => {
         this.setState({battery_level:batteryLevel});
      });
    this.getCurrentPosition();
    this.checkUpdateNeeded();
      _storeData('startday',0).then();
        const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            
      _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });

        getData('block_driver_profile').then((res) => {
          if(res.type == 1 && res.data.is_profile_block == 'yes') {
            this.setState({date:res.data.date,header_title:res.data.header_title,is_block_profile:true})
          } else {
            this.setState({is_block_profile:false})
          }

        });


        getData('kit_questions_list').then((res) => {
          console.log(res);
          if(res.type == 1){
            this.setState({KitQuestionList:res.data.KitQuestionList});
            res.data.KitQuestionList.map((ress, i) => {
              console.log(ress.question_for);
            if(ress.question_for == 'both' || ress.question_for == 'start') {
              console.log("eeeeeee");
              if(!this.state.totalQuestionIds.includes(ress.id)){
                  this.setState({ totalQuestionIds: [...this.state.totalQuestionIds, ress.id] });
               }
            }
            });
          }
        })
.catch(function(err) {
    // Error: response error, request timeout or runtime error
    _showErrorMessage(err.message);
    console.log('promise error oppppp! ', err.message);
});

        // getData('rtw_safezone_parcel')
        // .then((res) => {
        //   console.log(res);
        //   if(res.type == 1){
        //     this.setState({
        //       rtwAlert:true,
        //       rtwList:res.data.packages_list,
        //       rtw_company:res.data.company_name,
        //       vehicle_plate_number:res.data.vehicle_plate_number,
        //       rtw_warehouse:res.data.rtw_warehouse,
        //       rtw_date:res.data.rtw_date,
        //       rtw_message:res.data.rtw_message,
        //       vehicle_number:res.data.vehicle_number,
        //     });
        //   } else {
        //     this.setState({rtwAlert:false});
        //   }
        // });

          this.setState({app_version:DeviceInfo.getVersion()});
          });
      this.getLocationPermissions();
  };

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

  checkDriverProfile () {
              this.setState({isloading:true});
       getData('block_driver_profile').then((res) => {
          if(res.type == 1 && res.data.is_profile_block == 'yes') {
              this.setState({isloading:false,date:res.data.date,header_title:res.data.header_title,is_block_profile:true})
          } else {
            this.setState({isloading:false,is_block_profile:false})
          }

        });
  }

  checkUpdateNeeded = async () => {
    const version = await checkVersion();
    console.log("Got version info:", version.version);
    console.log("Old version info:", DeviceInfo.getVersion());
    if (version.version > DeviceInfo.getVersion()) {
      this.setState({versionModal:true});
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
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
      //setLocationStatus('You are Here');

      //getting the Longitude from the location json
      const currentLongitude = 
        JSON.stringify(position.coords.longitude);

      //getting the Latitude from the location json
      const currentLatitude = 
        JSON.stringify(position.coords.latitude);

      //Setting Longitude state
      this.setCurrentLongitude(currentLongitude);
      
      //Setting Longitude state
      this.setCurrentLatitude(currentLatitude);
      var postdata = { latitude: currentLatitude,longitude:currentLongitude };
      // saveLocation(postdata)
      //   .then((res) => {
      //     console.log(res);
      //   });
    },
    (error) => {
      this.getCurrentPosition2();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 7000 }
  );
}


setCurrentLongitude(longitude){
  let longitude_ = parseFloat(longitude).toFixed(4);
  this.setState({
    gps_long: longitude_,
  });
} 

setCurrentLatitude(latitude){
  let latitude_ = parseFloat(latitude).toFixed(4);
  this.setState({
    gps_lat: latitude_,
  });
}

setLocationStatus(error){
  _showErrorMessage(error);
}

      onScannerSuccess = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
            if (data) {
              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
              this.setState({ qr_code: barcode,isShowScanner: false,isloading: false });
                setTimeout(function(){
                _this.findQrCode();
                }, 1000);

              }
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid Bar Code',
                'This Bar code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

  findQrCode () {
    this.setState({ isloading: true });
    var postdata = { qr_code:this.state.qr_code,is_day:'start'};
     postData(postdata,'scan_kit_qr_code').then((res) => {
      if(res.type == 1) {
          this.setState({isloading: false,allFunc:false });
          _showSuccessMessage(res.message);
      } else if(res.type == 5) {
          _showSuccessMessage(res.message);
          this.props.navigation.navigate('HomeMain');
      } else {
        this.setState({ qr_code: '',isloading: false,allFunc:true });
        _showErrorMessage(res.message);
      }
    });
  }


  addAns (id,val) {
     this.setState({
      answer: {
     ...this.state.answer,
         [id]: val
      },
  });

     if(!this.state.questionIds.includes(id)){
        this.setState({ questionIds: [...this.state.questionIds, id] });
     }
  }

  takePhoto = () => {
  const options = {
    title: 'PLACE PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  //ImagePicker.launchImageLibrary(options, response => {
  ImagePicker.launchCamera(options, response => {
    if (response.uri) {
        this.getDataAwsRecogApi(response.uri);
    }
  });
}


     getDataAwsRecogApi = (uri) => {
    const _this = this;
    const formdata = new FormData();
        formdata.append('pic_type', 'kit');
          if(uri) {
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
          formdata.append('pic', image);
          } else {
              _showErrorMessage('Photo is required');
              this.setState({ isloading: false });
              return false;
          }

      this.setState({isloading: true});
     getDataAwsRecog(formdata).then((res) => {
      console.log(res);
      if(res.type == 1) {
        this.setState({ placePic: uri,isloading:false});
        _showSuccessMessage(res.message);
      } else {
        this.setState({ placePic: null,isloading:false});
        _showErrorMessage(res.message);
      }
         }).catch(error => {
          if(error.message == 'timeout' && this.state.imageScanAttempt == 0) {
          this.setState({imageScanAttempt:1,isloading:false});
          _showErrorMessage('Request timeout please try again');
          return false;
        } else if(error.message == 'timeout' && this.state.imageScanAttempt == 1) {
          this.setState({ placePic: uri,isloading:false});
        } else {
          this.setState({isloading:false});
          console.log(error);
          _showErrorMessage(error.message);
        }
      
    });

  };

removePlaceImage() {
  this.setState({ placePic: null});
}

saveData = () => {
  if(this.state.qr_code == '') {
    _showErrorMessage('Please scan qr code first');
    return false;
  }

  if(this.state.questionIds.length < this.state.totalQuestionIds.length) {
    _showErrorMessage('Please answer all the questions');
    return false;
  }

  if(this.state.notes != '' && this.state.notes.length < 25){
    _showErrorMessage('Minimum 25 characters required in notes field. Please enter valid notes');
    return false;
  }
    
  let currentLongitude = this.state.gps_long;
    let currentLatitude = this.state.gps_lat;

     if(this.state.gps_long == '' || this.state.gps_lat == '') {
      Geolocation.getCurrentPosition((position) => {
          
          currentLongitude = JSON.stringify(position.coords.longitude);
          currentLatitude = JSON.stringify(position.coords.latitude);

          this.setState({
          gps_long: currentLongitude,
          gps_lat: currentLatitude
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


      if(currentLongitude == '' || currentLongitude == null) {
        if(this.state.locationAttempt == 0) {
          this.setState({locationAttempt:1});
          _showErrorMessage('Location not Found please try again');
          return false;
        }
      }
  const formdata = new FormData();
  const _this = this;

  if(this.state.answer[7] == 'no') {
    _storeData('door_knocker_pad','no').then();
  }

  formdata.append('gps_long', currentLongitude);
  formdata.append('gps_lat', currentLatitude);
  formdata.append('question_answer', JSON.stringify(this.state.answer));
  formdata.append('kit_qr_code', this.state.qr_code);
  formdata.append('battery_level', this.state.battery_level);
  formdata.append('app_version', this.state.app_version);
  formdata.append('notes', this.state.notes);
  formdata.append('fuel_card_number', this.state.fuel_card_number);
  
    let uri = this.state.placePic;
    if(uri) {
      let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
      let image = {
        uri:  uri,
        name: filename,
        type: "image/png",
      };
    formdata.append('kit_photo', image);
    } else {
     _showErrorMessage('Kit Photo is required');
      return false;
    }

    if(this.state.fuel_card_number == null || this.state.fuel_card_number == ''){
    _showErrorMessage('Fuel card number is required');
    return false;
  }

  if(this.state.fuel_card_number.length < 5){
    _showErrorMessage('Please enter last 5 digit');
    return false;
  }

    console.log(formdata);
    
    this.setState({isloading: true});
    postDataWithPic(formdata,'start_day_driver_kit').then((res) => {
      console.log(res);
    this.setState({isloading: false});
    if(res.type == 1) {
       _showSuccessMessage(res.message);
       this.props.navigation.navigate('HomeMain');
    } else if(res.type == 2) {
       _showSuccessMessage(res.message);
       this.setState({kit_alert_msg:res.message,date:res.data.date,vehicle_plate:res.data.vehicle_plate,kitAlert:true});
    } else {
      _showErrorMessage(res.message);
    }
     
  }).catch(error => {
    // console.log(error);
      _showErrorMessage(error.message);  
    });
        
   
 
};

  rtwPackagesList() {
    return (
    <View>
            {this.state.rtwList.map((res, i) => {
            return (
            <Card key={i+'_a'}>
              <CardItem key={i+'_b'} style={{backgroundColor:'red'}}>
                <Body key={i+'_c'}>
                  <View key={i+'_d'} style={{flexDirection:'row',justifyContent:'space-between'}}>
                   <Text key={i+'_g'} style={{fontWeight:'bold', width:'50%',paddingLeft:5,color:"#fff"}}>
                    {res.customer_name}
                    </Text>
                    <Text key={i+'_m'} style={{fontWeight:'bold', width:'50%',alignSelf:'flex-end',color:"#fff",right:-10,textAlign:'right'}}>
                    {res.barcode}
                    </Text>
                  </View>
                  <View key={i+'_h'} style={{paddingLeft:5}}>
                    <Text key={i+'_i'} style={{fontWeight:'bold',color:"#fff"}}>
                    {res.customer_address}
                    </Text>
                  </View>
                </Body>
              </CardItem>
            </Card>
            );
          })
        }
        </View>
    )    
  } 


  blockReasonList() {
    var que = 1;
    return (
      <View>
            {this.state.blockReason.map((res, i) => {
            return (
                <Text style={{color: 'red', fontSize: 16,fontWeight:'bold',marginLeft:15}}>{que++}. {res.reason_msg}</Text>
            );
          })
        }
        </View>
    )    
  }

 refreshPage() {
    this.props.navigation.push('DriverKitStart');
  }

  hideKitAlert() {
    this.setState({kitAlert: false});
    this.props.navigation.push('DriverKitStart')
  }

  onChangedLitter(text){
  let newText = '';
    let numbers = '0123456789.';
    let truetext = false;
    for (var i=0; i < text.length; i++) {
        if(numbers.indexOf(text[i]) > -1 ) {
            newText = newText + text[i]
            truetext = true;
        }
        else {
            truetext = false;
            if(newText != '.'){
              this.setState({ fuel_card_number: '' });
             _showErrorMessage('Please enter number only');
            }
        }
    }

    if(truetext || text === '' ){
      this.setState({ fuel_card_number: newText });
    }
}



  render() {
    var que = 1;
    const {
      container,
      headerLogo,
      headerView,
      backButton,
      backSection,
      backIcon,
      nextIcon,
      backText,
      mainContainer,
      itemLabel,
      itemValue,
      itemValueIn,
      itemSection,
      checkbox,
      checkboxIn,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub
    } = styless;
    return (
     
      <Container>
      <Modal animationType="slide" transparent={true} visible={this.state.is_block_profile}>
         <View style={{justifyContent: "center",alignItems: "center",marginTop: 30}}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>BLOCKED PROFILE</Text>
            <Text style={{fontSize: 15,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.header_title}</Text>
            </View>
            
            
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'35%',alignSelf:'center', backgroundColor: 'red', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.checkDriverProfile()}>
                <Icon style={{color:'#fff',fontSize: 40,fontWeight:'bold',textAlign: 'center'}} name='sync' />
              </Button>
              </View>
              {this.state.isloading && (
              <Loader />
          )}
          </View>
        </View>
      </Modal>
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
      <Modal animationType="slide" transparent={true} visible={this.state.kitAlert}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>KIT BLOCKED</Text>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.kit_alert_msg}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Vehicle Number #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_plate}</Text>
            </View>
          <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Date #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.date}</Text>
            </View>
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'45%',alignSelf:'center', backgroundColor: 'red', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.hideKitAlert()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>OK</Text>
              </Button>
              </View>
          </View>
        </View>
      </Modal>
      <Modal animationType="slide" transparent={true} visible={this.state.rtwAlert}>
         <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:18, fontWeight:'bold',textAlign:'center',color:'red'}}>RTW PARCEL ALERT</Text>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center',fontWeight:'bold'}}>{this.state.rtw_message}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Date:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_date}</Text>
            </View>
            
            {this.state.vehicle_plate_number != '' ? (<View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>License Plate #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_plate_number}</Text>
            </View>):null}
            {this.state.vehicle_number != '' ? (<View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Vehicle #:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.vehicle_number}</Text>
            </View>):null}
            
            <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Company:</Text>
              <Text style={{fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtw_company}</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyContent:'space-between'}}>
              <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Total Packages:</Text>
              <Text style={{ fontSize: 16,fontWeight:'bold',paddingLeft:5 }}>{this.state.rtwList.length}</Text>
            </View>
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 12,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.rtw_warehouse}</Text>
            </View>
            <ScrollView style={{height:290}}>
            {this.rtwPackagesList()}
            </ScrollView>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent:'center',marginTop:15}}>
              <Button 
                style={{ height: 50, width:'45%',alignSelf:'center', backgroundColor: 'red', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.setState({rtwAlert:false})}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>OK</Text>
              </Button>
              </View>
          </View>
        </View>
      </Modal>
      { (this.state.isShowScanner) ?
      (<Content padder>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyContent: 'center'}}>
              <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>SCAN DRIVER KIT</Text>
            </View>
            <View style={{flexDirection:'row', justifyContent:'space-between',marginLeft: 20, marginRight: 20}}>
              <Text style={{color:'black',fontSize:18,}}>Flash Light</Text>
              <Switch onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                value={this.props.flashstatus == 'torch'?true:false} /> 
            </View> 
          <View style={{flexDirection:'row',paddingTop:15}}>
          <QRCodeScanner
            cameraStyle={{ height: 280, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }}
            onRead={ (e) => this.onScannerSuccess(e) }
                reactivate={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                showMarker={true}
                reactivateTimeout={7000}
            />
            </View>
      </Content>
      ):null
      }
       { (!this.state.isShowScanner) ?
      ( <Content>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
            <View style={backSection}>
            <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>START DAY DRIVER KIT</Text>
            <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
        </View>
            <View style={{paddingLeft:10,paddingRight:10}}>
           {this.state.qr_code != '' ?
           (<View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
            <Button small rounded onPress={() => this.setState({isShowScanner: true})} style={{backgroundColor: '#00c2f3',width:200,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>KIT SCANNED</Text>
            <Icon name='scan' />
          </Button>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center'}}>Please scan driver kit first</Text>
           </View>):
           (<View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
            <Button small rounded onPress={() => this.setState({isShowScanner: true})} style={{backgroundColor: '#00c2f3',width:200,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>SCAN KIT</Text>
            <Icon name='scan' />
          </Button>
            <Text style={{fontSize: 12,textAlign:'center',alignSelf:'center'}}>Please scan driver kit first</Text>
           </View>)}
            <View style={{borderWidth:1,color:'grey',width:150,alignSelf:'center'}}>
            </View>
            {!this.state.allFunc?(<View>
              <View style={{flexDirection: 'row',marginTop:10}}>
              <Text style={{color:'#054b8b',fontWeight:'bold',fontSize:16,fontStyle:'italic'}}>Please give answers of questions for kit and take photo of kit also:-</Text>
              </View>
              <View style={{height:10}}></View>

              {this.state.KitQuestionList.map((res, i) => {

                return (
                  res.question_for == 'both' || res.question_for == 'start'?
                  (<View style={{flexDirection: 'row'}}>
                    <Text style={[itemLabel,{marginTop:0,fontSize:15,fontWeight:'bold',paddingLeft:1,width:'65%'}]}>{que++}.{res.question}</Text>
                    <View style={{flexDirection: 'row', width:'15%',marginTop:0}}>
                      <CheckBox disabled={this.state.allFunc} value={this.state.answer[res.id] === 'yes'?true:false} onValueChange={() => this.addAns(res.id,'yes')} style={checkbox} />
                      <Text style={itemValue}>{res.answer[0] || Yes}</Text>
                      <View style={{marginLeft: 8}}></View>
                      <CheckBox disabled={this.state.allFunc} value={this.state.answer[res.id] === 'no'?true:false} onValueChange={() => this.addAns(res.id,'no')} style={checkbox} />
                      <Text style={itemValue}>{res.answer[1] || No}</Text>
                    </View>  
                    <View style={{height:12}}></View>
                  </View>):null
                );
                })
              }

            <View style={{height:10}}></View>
            <View>
            <TextInput editable={!this.state.allFunc} multiline = {true} numberOfLines = {3} placeholder="Notes"  style={{fontSize:14, paddingTop:5,justifyContent:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3' }} onChangeText={text => this.setState({notes:text})} value={this.state.notes}/>
            </View>

            <View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
              <Button small rounded onPress={() => this.takePhoto()} disabled={this.state.allFunc} style={{backgroundColor: '#00c2f3',width:200,alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE KIT PHOTO</Text>
              <Icon name='camera' style={{color:"#fff"}} />
              </Button>
           </View>

           

           {this.state.placePic ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20 }}>
              <View style={{ flexBasis: '100%', height: 170, marginBottom: 5 }}>
                {this.state.placePic ? (<Image style={{ height: 170,borderRadius:6 }} source={{ uri: this.state.placePic }}/>):null}
                {this.state.placePic ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: 2, right: 5, zIndex: 9 }}>
                  <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}
           <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Fuel Card Number</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon type="FontAwesome" name='cc-mastercard' style={{ color: '#00c2f3'}}/>
                      <Input minLength={5} maxLength={5} placeholder="Fuel Card Last 5 Digit" keyboardType = 'numeric' value={this.state.fuel_card_number} onChangeText={(text)=> this.onChangedLitter(text)} />
                    </Item>
                  </Item>


           <View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center'}}>
              <Button rounded style={{height: 45,marginTop: 20, backgroundColor: '#054b8b', alignSelf:'center',alignItems:'center',justifyContent:'center'}}
                    onPress={() => this.saveData()}>
                    <Text style={{ textAlign: 'center',width:200, color: '#fff', fontSize: 22,fontWeight:'bold' }}>SUBMIT</Text>
              </Button>
          </View>
          <View style={spaceDivider}></View>
          </View>):null}
          </View>
            </Content>
            ):null
      }
      {this.state.isloading && (
              <Loader />
          )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5
  },
  modalView: {
    width:'98%',
    backgroundColor: "white",
    borderRadius: 20,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth:2,
    borderColor:'red'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
    backSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',
    borderColor: '#00c2f3',
    borderWidth: 1,
    backgroundColor: '#00c2f3',
    marginTop: '4%'
  },
  backButton: {
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'center'
  }
});

function mapStateToProps(state){
  return{
    flashstatus : state.flashstatus
  };
}
function matchDispatchToProps(dispatch){
  return bindActionCreators({flashon: flashon, flashoff: flashoff}, dispatch)
}
export default connect(mapStateToProps,matchDispatchToProps)(DriverKitStart);