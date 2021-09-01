import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, ListItem, CheckBox, Body,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import { saveProductInfo,getUser,searchParcelAddress,getCustomerdata,updateDeliveryAddress,updateStop } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
import NetInfo from "@react-native-community/netinfo";

class EditMapStop extends Component {
constructor(props) {
    super(props);

    db.transaction(function (txn) { 
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_loads'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_loads', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_loads(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),delivery_status VARCHAR(10),process_status VARCHAR(10),shipper_number VARCHAR(255),person_name VARCHAR(100))',
              []
            );
          }
        }
      );
    });

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),comment VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255))',
              []
            );
          }
        }
      );
    }); 


    this.state = {
      isloading: false,
      isShowScanner:false,
      barcodes:'',
      customer_name:'',
      address:'',
      city:'',
      province:'',
      postal_code:'',
      email_address:'',
      phone_number:'',
      comment:'',
      company_id:null,
      company_name:null,
      loadId:'',
      user_avtar:'',
      date:'',
      street_number:'',
      subpremise:'',
      route:'',
      searchText:'Search',
      street_address:null,
      is_exception_case:false,
      exception_case_pics:null, 
      showShipperNo:true,
      shipper_number:'',
      stop_id:'',
      latitude:'',
      longitude:'',
      parcel_photo:'',
      apt_unit_number:'',
    };


  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }




    componentDidMount = () => {
      //console.log(this.props.route)

       const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {

            
  
      _retrieveData('current_stop_id')
        .then((stop_id) => {
           var postdata = { stop_id:stop_id };
              getCustomerdata(postdata).then((res) => {
                if(res.type == 1) {
                  console.log(res);
                  this.setState({
                    isloading:false,
                    address:res.data.full_address,
                    searchText:res.data.full_address,
                    street_address:res.data.address,
                    city:res.data.city,
                    barcodes:res.data.barcode[0],
                    province:res.data.province,
                    postal_code:res.data.postal_code,
                    customer_name:res.data.customer_name,
                    date:res.data.date,
                    stop_unique_num:res.data.stop_unique_num,
                    company_name:res.data.company_name,
                    phone_number:res.data.phone_number,
                    email_address:res.data.email_address,
                    stop_id:stop_id,
                    apt_unit_number:res.data.apt_number,
                   
                  });
                }
              })
    });
      
      _retrieveData('companyId')
        .then((res) => {
          if(res != null){
            this.setState({company_id:res});
          }
        });

        _retrieveData('companyName')
        .then((res) => {
          if(res != null){
            this.setState({company_name:res})
          }
        }); 

         _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });
    });

      getUser()
          .then((res) => {
            this.setState({
              loadId: res.scanner_id,
              date:res.date
            });
        }); 
  };



    componentWillUnmount() {
    this._unsubscribe();
  }
    /*Remove Image from modal*/
  removeImage(_state) {
    this.setState({ [_state]: false});
  }


  removeParcel() {
    //const allbarcodes = this.state.barcodes.filter((item, i) => item !== code);
    this.setState({ barcodes: null });
  }

  scanCode() {

     this.setState({
          isShowScanner: true
      });
  }

  goToLoad() {
     this.setState({
            isShowScanner: false
        });
  }



   getAddress(data, details) {
    //details.formatted_address
       

        this.setState({ address: details.formatted_address });

        details.address_components.map((res, i) => {

          if(res.types[0] == 'locality'){
            this.setState({ city: res.long_name });
          }

          if(res.types[0] == 'administrative_area_level_1'){
            this.setState({ province: res.short_name });
          }

          if(res.types[0] == 'postal_code'){
            this.setState({ postal_code: res.short_name });
          }

          

        });
  }

  
  saveData = () => {
    this.setState({ isloading: true });
    const _this = this;
    const formdata = new FormData();
    let address = this.state.address;
    let street_addresss = '';

    if(this.state.street_address != null){
      street_addresss = this.state.street_address;
    } else { 
      if(this.state.subpremise != ''){
        street_addresss = this.state.subpremise+'-'+this.state.street_number+' '+this.state.route;
      } else {
        street_addresss = this.state.street_number+' '+this.state.route;
      }
    }

    console.log(this.state.street_address)
    if(this.state.barcodes == null || this.state.barcodes == ''){
        _showErrorMessage('Please Scan or enter parcel before submit');
        this.setState({ isloading: false });
        return false;
      }


     if(this.state.address == '' || this.state.address == null){
        if(this.GooglePlacesRef.getAddressText() == '' || this.GooglePlacesRef.getAddressText() == null){
          _showErrorMessage('Address field is requried');
          this.setState({ isloading: false });
          return false;
        } else {
          console.log(this.GooglePlacesRef.getAddressText());
          address = this.GooglePlacesRef.getAddressText();
          street_addresss = this.GooglePlacesRef.getAddressText();
            this.setState({ street_address: this.GooglePlacesRef.getAddressText(),address: this.GooglePlacesRef.getAddressText() });
        }
        
      }

      if(this.state.city == ''){
        _showErrorMessage('City field is requried');
        this.setState({ isloading: false });
        return false;
      }

      if(this.state.province == ''){
        _showErrorMessage('Province field is requried');
        this.setState({ isloading: false });
        return false;
      }


      if(this.state.postal_code == ''){
        _showErrorMessage('Postal code field is requried');
        this.setState({ isloading: false });
        return false;
      }

     let apt_unit_number = this.state.apt_unit_number;

      if(apt_unit_number == undefined){
        apt_unit_number = ''
      }

      if(this.state.apt_unit_number){
       if(this.state.parcel_photo == '' || this.state.parcel_photo == null) {
          _showErrorMessage('Parcel pic is requried');
          this.setState({ isloading: false });
          return false; 
        }
     }

    let company_id = this.state.company_id || 1;
    let customer_name = this.state.customer_name;
    let city = this.state.city;
    let province = this.state.province;
    let postal_code = this.state.postal_code;
    let email = this.state.email_address;
    let phone = this.state.phone_number;
    let barcode = this.state.barcodes;
    let stop_id = this.state.stop_id;
   

    let uri = this.state.parcel_photo;
    let image = {};
        if(uri) {
          let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
          image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        }
          console.log(image);

    // var postdata = { street_address:street_addresss, postal_code:postal_code,province:province,
  // city:city,stop_id:stop_id,apt_number:apt_unit_number,edit_address_pic:image};

    formdata.append('edit_address_pic', image);
    formdata.append('stop_id', stop_id);
    formdata.append('address', address);
    formdata.append('city', city);
    formdata.append('province', province);
    formdata.append('postal_code', postal_code); 
    formdata.append('barcode', barcode);
    formdata.append('street_address', street_addresss);
    formdata.append('apt_unit_number', apt_unit_number);


  // console.log(formdata);

  let check_internet = 0;
  let sync_status = 'offline';

        updateStop(formdata).then((res) => {
     
          this.setState({ isloading: false });
          console.log(res);
             if(res.type == 1) {
                  this.GooglePlacesRef.setAddressText('');
                  _this.props.navigation.navigate('MAP');
            } else {
              _showErrorMessage(res.message);
            }
        })
      
}
dataSaveOffline(address,street_addresss) {
  const _this = this;
  let company_id = this.state.company_id
  let customer_name = this.state.customer_name;
  let city = this.state.city;
  let province = this.state.province;
  let postal_code = this.state.postal_code;
  let email = this.state.email_address;
  let phone = this.state.phone_number;
  let barcode = this.state.barcodes;
  let shipper_number = this.state.shipper_number;
  let exception_case_pics = this.state.exception_case_pics;
  let check_internet = 0;
  let sync_status = 'offline';

  let is_exception_case = null;
  if(this.state.is_exception_case){
    is_exception_case = 'yes';
  }
          
  let customer_address = address+" "+city+" "+" "+province+" "+postal_code;
  db.transaction(function (tx) {
  tx.executeSql(
    'INSERT INTO table_stops (customer_name, company_id, address, city, province,postal_code,email_address,phone_number,barcode,street_address,stop_id,sync_status,is_exception_case,exception_case_pics,customer_address,delivery_status,shipper_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [customer_name, company_id, address, city, province,postal_code,email,phone,barcode,street_addresss,0,sync_status,is_exception_case,exception_case_pics,customer_address,'active',shipper_number],
    (tx, results) => {
    if (results.rowsAffected > 0) {
      console.log('stops==', results.rowsAffected);

      _retrieveData('totalStops_').then((rrrrr) => {
            if(rrrrr != null) {
              _storeData('totalStops_',rrrrr + 1).then();
            }
        });

      _retrieveData('totalpack_').then((er) => {
            if(er != null) {
              _storeData('totalpack_',er + 1).then();
            }
        });

        _this.props.navigation.navigate('CustomerDetail', { stopid: 0, barcode:barcode,company_name:'ICS'});
    } else {
      console.log("falied");
      }
    },
    (error) => {
    console.log(error);
    }
  );
});
}

    onScannerSuccess = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
          // console.log(data);
            if (data) {
              // call api to get vehicle number from 
              var postdata = { barcode: String(data) };
              //let images = this.state.barcodes;
              //images.push(String(data));

              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {

              this.setState({ barcodes: String(data) });
              this.setState({isShowScanner: false,isloading: false});
                setTimeout(function(){
                _this.findAddress();
                }, 2000);

              }
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid Bar Code',
                'This QR code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }


  //   renderParcel() {
  //   return (
  //       <View style={{padding:5}}>
  //       {
  //         this.state.barcodes.map((res, i) => {
  //           return (<View key={i} style={{padding:5}}><View key={i} style={{padding:12,flexDirection:'row',backgroundColor:'#F9CCBE',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
  //               <Text style={{fontWeight: '100'}}>{i + 1}.</Text>
  //               <Text style={{alignSelf: 'stretch', width:'90%'}}>{res}</Text>
  //               <TouchableOpacity onPress={() => this.removeParcel(res)}
  //                                 style={{ position: 'absolute', right: -5, zIndex: 9 }}>
  //                 <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
  //               </TouchableOpacity>
  //             </View></View>);
  //         })
  //       }
  //     </View>
  //   );
  // }


    findAddress = () => {
      console.log(this.state.company_id);
    if(this.state.company_id != 2) {
    this.setState({isloading:true});
    var postdata = { barcode:this.state.barcodes,company_id:this.state.company_id };
     searchParcelAddress(postdata).then((res) => {
      if(res.type == 1) {
        _showSuccessMessage(res.message);
        this.setState({
          showShipperNo:false,
          isloading:false,
          customer_name:res.data.customer_detail.customer_name,
          email_address:res.data.customer_detail.email_address,
          street_address:res.data.customer_detail.street_address,
          city:res.data.customer_detail.city,
          province:res.data.customer_detail.province,
          postal_code:res.data.customer_detail.postal_code,
          address:res.data.customer_detail.address,
          searchText:res.data.customer_detail.address,
        });
        this.GooglePlacesRef.setAddressText(res.data.customer_detail.street_address);
      } else {
        //_showErrorMessage(res.message);
        this.setState({
          showShipperNo:true,
          isloading:false,
          customer_name:'',
          address:'',
          city:'',
          province:'',
          postal_code:'',
          email_address:'',
          phone_number:'',
          street_address:null,
          searchText:'Search'
        });
      }
    });
     }
    }

    takePhoto = () => {
        const options = {
          title: 'PARCEL PHOTO',
          mediaType: 'photo',
          maxWidth:500,
          maxHeight:500
        };
          ImagePicker.launchCamera(options, response => {
            if (response.uri) {
              this.setState({ parcel_photo: response.uri});
            }
          });
   }

     removePlaceImage() {
    this.setState({ exception_case_pics: null});
    this.setState({ parcel_photo: null});
  }

  render() {
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
      itemValue1,
      itemSection,
      checkbox,
      checkbox1,
      nextSection,
      blockSection,
      blockText,
      itemMain,
      spaceDivider,
      nextText,
      nextButton,
      itemMainSub
    } = styles;

    const {
      checked,
      setChecked,
      garbage,
      cleaning,
      accessories,
      fuel_tank,
      oil_change,tire_pressure,brakes,
      no_evidence_flood_damage,
      body_panel_inspection,bumper_fascia_inspection,
      doors_hood_roof_inspection,
      doors_hood_alignment,
      power_sliding_door_operation,
      windshield_side_rear_window_glass_inspection,
      wiper_blade_inspection,
      exterior_lights_back_side_front,showShipperNo} = this.state;
     
    return (
      
      <Container style={{paddingLeft:5,paddingRight:5}}>
         
       { (this.state.isShowScanner) ?
      (<Content padder>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyContent: 'center'}}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems:'center'}} onPress={() => this.goToLoad()}>
                <Icon type="FontAwesome" name='angle-left' style={{ color: '#fff',marginLeft: 20,fontWeight: 100}}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>SCAN PARCEL CODE</Text>
              </TouchableOpacity>
            </View>
            <View style={{flexDirection:'row', justifyContent:'space-between',marginLeft: 20, marginRight: 20}}>
              <Text style={{color:'black',fontSize:18,}}>Flash Light</Text>
              <Switch onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                value={this.props.flashstatus == 'torch'?true:false} /> 
            </View>
          <View style={{flexDirection:'row',paddingTop:15}}>
          <QRCodeScanner
            markerStyle={{height: 120,width: 290}}
            cameraStyle={{ height: 220, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }}
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

     
       { (!this.state.isShowScanner && this.state.company_id) ?   
      (<Content padder>
         
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              <TouchableOpacity style={backButton} onPress={() => console.log()}>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>{this.state.company_name || 'CANPAR'}</Text>
              </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row',paddingTop:15}}>
          <View style={{flexDirection:'row',width:'50%'}}>
            <Text style={{fontSize:18,fontWeight:'bold'}}>Load:</Text>
            <Text style={{paddingLeft:10,fontSize:20}}>{this.state.loadId}</Text>
          </View>
            <View style={{flexDirection:'row-reverse',width:'50%'}}>
              <Text style={{fontSize:18,fontWeight:'bold'}}>{this.state.date}</Text>
            </View>
          </View>

          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
          </View>



            <View style={mainContainer}>
           
            <Form>
                  

                   <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Customer Address</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon type="FontAwesome" name='map-marker' style={{ color: '#00c2f3'}}/>

                      
                    <GooglePlacesAutocomplete
                      placeholder = {this.state.searchText}
                      minLength={5}
                      fetchDetails={true}
                      ref={(instance) => { this.GooglePlacesRef = instance }}
                     
                      onPress={(data, details = true) => {
                         this.setState({ address: details.formatted_address,street_address:null,subpremise:'' });
                         console.log(details);
                        details.address_components.map((res, i) => {
                          if(res.types[0] == 'locality'){
                            this.setState({ city: res.long_name });
                          }
                          if(res.types[0] == 'administrative_area_level_1'){
                            this.setState({ province: res.short_name });
                          }


                          if(res.types[1] == 'postal_code'){
                            this.setState({ postal_code: res.short_name });
                          }

                          
                          if(res.types[0] == 'postal_code'){
                            this.setState({ postal_code: res.short_name });
                          }

                          if(res.types[0] == 'street_number'){
                            this.setState({ street_number: res.short_name });
                          }

                          if(res.types[0] == 'route'){
                            this.setState({ route: res.short_name });
                          }

                          if(res.types[0] == 'subpremise'){
                            this.setState({ subpremise: res.short_name });
                          }
                        });
                      }}
                       query={{
                        key: 'cxzcxz',
                        language: 'en',
                        components: 'country:ca',
                        type: 'address'
                      }}
                    />
                    </Item>

                  </Item>
                  <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Apt/Unit</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='map-marker' style={{ color: '#00c2f3'}}/>
                  <Input placeholder="Apt/Unit" value={this.state.apt_unit_number} keyboardType = 'numeric' onChangeText={(apt_unit_number) => this.setState({ apt_unit_number: apt_unit_number })}/>
                </Item>
              </Item>
              {   this.state.apt_unit_number ? (<View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:10}}>
              <Button small onPress={() => this.takePhoto()}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE PARCEL PHOTO </Text>
              <Icon name='camera' />
              </Button>
            </View>):null}
 
            {this.state.parcel_photo ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20 }}>
              <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                {this.state.parcel_photo ? (<Image style={{ height: 200 }} source={{ uri: this.state.parcel_photo }}/>):null}
                {this.state.parcel_photo ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                  <Icon type="FontAwesome" name='times'  style={{ color: '#F9CCBE'}}/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}

                  <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}></Label>
                   
                  </Item>

                    <Label style={{ fontSize:15, fontWeight: 'bold',marginLeft:12,color:'#595959' }}>City/Province/Postal</Label>
                  <Item >
                    <Item style={{ borderBottomColor: '#00c2f3', width:'35%'}}>
                      <Input placeholder="City" value={this.state.city} onChangeText={(city) => this.setState({ city: city })}/>
                      </Item>

                      <Item style={{ borderBottomColor: '#00c2f3',width:'25%',marginLeft:15}}>
                      <Input style={{paddingLeft:10}} placeholder="Province" value={this.state.province} onChangeText={(province) => this.setState({ province: province })}/>
                      </Item>

                      <Item style={{ borderBottomColor: '#00c2f3',width:'25%',marginLeft:40}}>
                      <Input placeholder="Postal" value={this.state.postal_code} onChangeText={(postal_code) => this.setState({ postal_code: postal_code })}/>
                      </Item>
                  </Item>

                </Form>
                

              
             </View>
         
          <View style={{ flexDirection: 'row', marginTop: 15,justifyContent:'space-between'}}>
              <Button style={{ height: 50, width:'48%',marginTop: 20, backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.saveData()} disabled={this.state.isloading?true:false}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Update</Text>
              </Button>
             
              <Button style={{ height: 50, width:'48%',marginTop: 20, backgroundColor: 'white', borderColor:'#F9CCBE', borderWidth:1, justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.props.navigation.navigate('MAP')}>
                    <Text style={{ textAlign: 'center', color: 'black', fontSize: 22 }}>Cancel</Text>
              </Button>
          </View>
          <View style={spaceDivider}></View>
          <View style={spaceDivider}></View>

          </Content>):null
        }
        {this.state.isloading && (
              <Loader />
          )}
        </Container>


    );
  }
}

function mapStateToProps(state){
  return{
    flashstatus : state.flashstatus
  };
}
function matchDispatchToProps(dispatch){
  return bindActionCreators({flashon: flashon, flashoff: flashoff}, dispatch)
}
export default connect(mapStateToProps,matchDispatchToProps)(EditMapStop);