import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert,Modal} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, ListItem, CheckBox, Body,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import { saveProductInfo,getUser,searchParcelAddress,postData } from 'api';
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

class AddMapStop extends Component {
constructor(props) {
    super(props); 

     db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
          // console.log('item:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),comment VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),apt_number VARCHAR(100),building_img VARCHAR(255),process_status VARCHAR(10),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255),shipper_number VARCHAR(255),person_name VARCHAR(100))',
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
      netStatus:0,
      showShipperNo:true,
      shipper_number:'',
      apt_unit_number:'',
      driverKitAlert:false,
      door_knocker_pad_title:'Have you taken canpar door knocker pad?',
      apt_pkg_pic:null,
      current_lat:'',
      current_lon:'',
      sequence_number:'',
      nearby:'',
      nearbytitle:'',
    };

  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }




    componentDidMount = () => {

      _storeData('last_point_after_deleivery',null);

       const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
        
    this.setState({
        barcodes:'',
        customer_name:'',
        address:'',
        city:'',
        province:'',
        subpremise:'',
        postal_code:'',
        email_address:'',
        phone_number:'',
        street_address:null,
        searchText:'Search',
        street_address:null,
        is_exception_case:false,
        exception_case_pics:null,
        netStatus:0,
        shipper_number:'',
        apt_unit_number:'',
        current_lat:'',
        current_lon:'',
        sequence_number:'',
        nearby:'',
        nearbytitle:'',
      });



          _retrieveData('companyId')
        .then((res) => {
          if(res != null){
            this.setState({company_id:res});
              if(this.state.company_id == 1) {
              _retrieveData('door_knocker_pad')
              .then((res) => {
                if(res == 'no'){
                  this.setState({driverKitAlert:true})
                }
              });
            }
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
              date:res.date,
              door_knocker_pad_title:res.door_knocker_pad_title,
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

  updateKitAns() {
    this.setState({driverKitAlert:false});
    _storeData('door_knocker_pad','yes').then();
    var postdata = { company_id:this.state.company_id,door_knocker_kit_answer:'yes'};
     postData(postdata,'update_door_knocker_kit_answer').then((res) => {
      // console.log(res);
      if(res.type == 1) {
          _showSuccessMessage(res.message);
      } else {
        _showErrorMessage(res.message);
      }
    }).catch(error => {
      this.setState({isloading:false});
        _showErrorMessage(error.message);      
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

onChangedAptUnit(text){

  if (/^\d+$/.test(text) || text === '') { 
    this.setState({ odometer_reading:text }) 
  }

  let newText = '';
    let numbers = '0123456789.';
    let truetext = false;
    for (var i=0; i < text.length; i++) {
        if(numbers.indexOf(text[i]) > -1 ) {
            newText = newText + text[i];

            truetext = true;
            
        }
        else {
            
            truetext = false;
            if(newText != '.'){
             _showErrorMessage('please enter numbers only');
            }
            
        }
    }

    if(truetext || text === '' ){
      this.setState({ apt_unit_number: newText });
    }
  
  
}
  
  async saveData() {
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


    if(this.state.barcodes == null || this.state.barcodes == ''){
        _showErrorMessage('Please Scan or enter parcel before submit');
        this.setState({ isloading: false });
        return false;
      }

      if(this.state.customer_name == null || this.state.customer_name == ''){
        _showErrorMessage('Customer Name field is requried');
        this.setState({ isloading: false });
        return false;
      }


     if(this.state.address == '' || this.state.address == null){
        if(this.GooglePlacesRef.getAddressText() == '' || this.GooglePlacesRef.getAddressText() == null){
          _showErrorMessage('Address field is requried');
          this.setState({ isloading: false });
          return false;
        } else {
          // console.log(this.GooglePlacesRef.getAddressText());
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

        if(this.state.is_exception_case && this.state.exception_case_pics == null) {
           _showErrorMessage('Exception case pic is required');
           this.setState({ isloading: false });
            return false;
        }

        await this.addNewPoint(this.state.current_lat,this.state.current_lon,this.state.address);
        // this.setState({ isloading: false });
        //     return false;

        let is_exception_case = null;
        let exception_case_pics = '';
        if(this.state.is_exception_case){
          is_exception_case = 'yes';
          formdata.append('is_exception_case', 'yes');
          let uri = this.state.exception_case_pics;
          if(uri) {
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
          formdata.append('exception_case_pics', image);
          exception_case_pics = uri;
          } else {
              _showErrorMessage('Exception case pic is required');
              this.setState({ isloading: false });
              return false;
          }
        }

        if(this.state.apt_unit_number){
          let uri = this.state.apt_pkg_pic;
          if(uri) {
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
          formdata.append('apt_pkg_pic', image);
          } else {
              _showErrorMessage('Parcel photo is required');
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
    let shipper_number = this.state.shipper_number;
    let sequence_number = this.state.sequence_number;
    let nearby = this.state.nearby;
    let nearbytitle = this.state.nearbytitle;


    formdata.append('company_id', company_id);
    formdata.append('customer_name', customer_name);
    formdata.append('address', address);
    formdata.append('city', city);
    formdata.append('province', province);
    formdata.append('postal_code', postal_code); 
    formdata.append('email_address', email);
    formdata.append('phone_number', phone);
    formdata.append('barcode', barcode);
    formdata.append('street_address', street_addresss);
    // formdata.append('shipper_number', this.state.shipper_number);
    formdata.append('apt_unit_number', this.state.apt_unit_number);
    formdata.append('sequence_number', sequence_number);
    formdata.append('nearby', nearby);
    formdata.append('nearbytitle', nearbytitle);
    formdata.append('is_custom_stop', 'yes');


  let check_internet = 0;
  let sync_status = 'offline';

NetInfo.fetch().then(state => {
    if(state.isConnected == false) {
       this.setState({
        isloading: false,
      });
      _showErrorMessage('Your phone not connect with internet. Please try again');
      return false;
    } else {
        check_internet = 1;
        sync_status = 'online';
      //_showSuccessMessage('Your are Online');


        saveProductInfo(formdata).then((res) => {
          // console.log(res);
      this.setState({ isloading: false });

         if(res.type == 1) {
            _retrieveData('PendingStops_').then((ts) => {
                if(ts > 0 && ts != null) {
                _storeData('PendingStops_',ts + 1).then();
                }
            });
            _retrieveData('totalpack_').then((ts) => {
                if(ts > 0 && ts != null) {
                _storeData('totalpack_',ts + 1).then();
                }
            }); 
            _retrieveData('totalStops_').then((ts) => {
                if(ts > 0 && ts != null) {
                _storeData('totalStops_',ts + 1).then();
                }
            }); 
          // console.log(res.data);
              this.GooglePlacesRef.setAddressText('');
              db.transaction(function (tx) {
                tx.executeSql(
                  'INSERT INTO table_stops (customer_name, company_id, address, city, province,postal_code,email_address,phone_number,barcode,street_address,stop_id,sync_status,is_exception_case,exception_case_pics,customer_address,delivery_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                  [customer_name, company_id, street_addresss, city, province,postal_code,email,phone,barcode,street_addresss,res.data.stop_id,sync_status,is_exception_case,exception_case_pics,res.data.full_address,'active'],
                  (tx, results) => {
                    // console.log('Results', results.rowsAffected);
                    if (results.rowsAffected > 0) {
                    } else alert('Registration Failed');
                      }
                    );
                });
              _showSuccessMessage(res.message );
              this.props.navigation.navigate('MAP')
        } else {
          _showErrorMessage(res.message);
        }
    }).catch(error => {
      this.setState({isloading:false});
      console.log(error.message);
      if(error.message == 'Network request failed') {
        this.dataSaveOffline(address,street_addresss);
      } else {
        _showErrorMessage(error.message);  
      }        
    });
    }
  });
  };

  distance(lat1, lon1, lat2, lon2, unit) {
    // console.log(lat1, lon1, lat2, lon2, unit);
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 }
  if (unit=="N") { dist = dist * 0.8684 }
  return dist
}

CheckforSameNearBy(stations,sequence){
      
    var Objarray = [];

    for (var i = 0; i < stations.length; i++) {
      // console.log(stations[i].nearby);

      if(stations[i].nearby != '' && stations[i].nearby == sequence){

        Objarray.push(stations[i].nearby);
      }

    }

   return Objarray;

}

async addNewPoint(lat,lon,getaddress){
  
  await _retrieveData('updatedwaypoints2')
        .then((res) => {
          if(res != null){
            console.log(res);
            var data = res;

            var distarray = []
            // console.log(lat,lon);
            for (var i = 0; i < data.length; i++) {
              if(data[i].sequence != 0)
              {
                var dist = this.distance(lat, lon, data[i].latitude, data[i].longitude, "K");              

                distarray.push({dist:dist,sequence: data[i].sequence,nearby: data[i].nearby})
              }
            } 

            distarray.sort(function (a, b) {
                return a.dist - b.dist;
            })

            var lowest = Number.POSITIVE_INFINITY;
            var highest = Number.NEGATIVE_INFINITY;
            var tmp;
            var sequence;

            // console.log(distarray);

            for (var i=distarray.length-1; i>=0; i--) {
                tmp = distarray[i].dist;
                
                if (tmp < lowest) 
                  {

                    if(distarray[i].nearby != ''){
                      
                      sequence = distarray[i].nearby
                    }
                    else{
                      sequence = distarray[i].sequence
                    }
                    lowest = tmp;
                  }

                  
              
            }

            var checkNewrBy = this.CheckforSameNearBy(data,sequence);
            // console.log(checkNewrBy.length);
            var total = checkNewrBy.length+1;
            // if(checkNewrBy.length == 0){

            //     total = 1;
            // }
            
            

            var letter = ((total + 9).toString(36).toUpperCase());
            var newObj = {address:"address 6",lat:lat, lng:lon,sequence:data.length,status:'active',nearby:sequence,nearbytitle:sequence+letter };
             
            this.setState({sequence_number:data.length,nearby:sequence,nearbytitle:sequence+letter});
            console.log(newObj);
          }
        });
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
          
let customer_address = street_addresss+","+city+","+province+","+postal_code;
    db.transaction((tx) => {
      tx.executeSql(
         'SELECT barcode FROM table_stops where barcode = ?',
        [barcode],
        (tx, resultss) => {
          if(resultss.rows.length == 0) {    
            this.GooglePlacesRef.setAddressText('');
            db.transaction(function (tx) {
            tx.executeSql(
              'INSERT INTO table_stops (customer_name, company_id, address, city, province,postal_code,email_address,phone_number,barcode,street_address,stop_id,sync_status,is_exception_case,exception_case_pics,customer_address,delivery_status,shipper_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
              [customer_name, company_id, address, city, province,postal_code,email,phone,barcode,street_addresss,0,sync_status,is_exception_case,exception_case_pics,customer_address,'active',shipper_number],
              (tx, results) => {
                // console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                  // console.log('ffffff');
                  _this.setState({ isloading: false });
                  _retrieveData('PendingStops_').then((ts) => {
                        if(ts > 0 && ts != null) {
                        _storeData('PendingStops_',ts + 1).then();
                        }
                  });
                  _retrieveData('totalpack_').then((ts) => {
                        if(ts > 0 && ts != null) {
                        _storeData('totalpack_',ts + 1).then();
                        }
                  }); 
                  _retrieveData('totalStops_').then((ts) => {
                        if(ts > 0 && ts != null) {
                        _storeData('totalStops_',ts + 1).then();
                        }
                  }); 
                   _showSuccessMessage('Parcel has been added successfully . Data is saved in offline');
                  _this.props.navigation.navigate('ScanParcel');
                } else alert('Registration Failed');
                  }
                );
            });
            } else {
              // console.log('dddddddddd');
              this.setState({ isloading: false });
              _showErrorMessage('This parcel is already added, Please try different barcode');
            }
    });
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
                'This Bar code is not Parcel code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

    findAddress = () => {
     NetInfo.fetch().then(state => {
      if(state.isConnected == false) {
        return false;
       } else {


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
     });
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
              this.setState({ exception_case_pics: response.uri});
            }
          });
   }

  takeParcelPhoto = () => {
        const options = {
          title: 'PARCEL PHOTO',
          mediaType: 'photo',
          maxWidth:500,
          maxHeight:500
        };
          ImagePicker.launchCamera(options, response => {

            if (response.uri) {
              this.setState({ apt_pkg_pic: response.uri});
            }
          });
   }

  removePlaceImage() {
    this.setState({ exception_case_pics: null});
  }

  removeParcelImage() {
    this.setState({ apt_pkg_pic: null});
  }

  refreshPage() {
    this.props.navigation.push('LoadMain');
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
      
      <Container>
         <Modal animationType="slide" transparent={true} visible={this.state.driverKitAlert}>
        <View style={styles1.centeredView}>
          <View style={styles1.modalView}>
            <View style={{alignSelf:'center',padding:10}}>
            <Text style={{fontSize:18, fontWeight:'bold'}}>ALERT</Text>
            </View>
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:10}}>
              <Text style={{fontSize:15, fontWeight:'bold',color: 'red'}}>{this.state.door_knocker_pad_title}</Text>
            </View>  
            <View style={{ flexDirection: 'row',alignSelf:'center', padding:15}}>
              <Button 
                style={{ height: 30, width:'30%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.updateKitAns()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>YES</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

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
      (<Content>
         
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
            <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 1 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>{this.state.company_name || 'CANPAR'}</Text>
            <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
        </View>
          <View style={{paddingLeft:10,paddingRight:10}}>
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
            <View>
              <View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
                <Button small onPress={() => this.scanCode()}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
                <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>SCAN PARCEL</Text>
                <Icon name='scan' />
                </Button>
              </View>
              <View style={{ marginTop: 10, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View>    
              <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter Parcel Code Here</Label>
                  <Item>
                        <Input placeholder="Enter Parcel Code" value={this.state.barcodes} onChangeText={(barcodes) => this.setState({ barcodes: barcodes })}/>
                        <TouchableOpacity onPress={() => this.findAddress()}>
                    <Icon  type="FontAwesome" name='search' style={{ color: '#00c2f3'}}/>
                  </TouchableOpacity>
                  </Item>
                </Item>
              </Form>
          </View>

          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
          </View>

            <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Customer Name</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon  type="FontAwesome" name='user' style={{ color: '#00c2f3'}}/>
                      <Input placeholder="Enter Customer Name" value={this.state.customer_name} onChangeText={(customer_name) => this.setState({ customer_name: customer_name })}/>
                    </Item>

                  </Item>

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
                         this.setState({ address: details.formatted_address,street_address:null,subpremise:'',current_lat:details.geometry.location.lat,current_lon:details.geometry.location.lng });

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
                        key: 'zxczxczc',
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
                  <Input placeholder="Apt/Unit" value={this.state.apt_unit_number} keyboardType = 'numeric' onChangeText={(apt_unit_number) => this.onChangedAptUnit(apt_unit_number)}/>
                </Item>
              </Item>
              {this.state.apt_unit_number ? (<View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:10}}>
              <Button small onPress={() => this.takeParcelPhoto()}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE PARCEL PHOTO </Text>
              <Icon name='camera' />
              </Button>
            </View>):null}
              {this.state.apt_unit_number && this.state.apt_pkg_pic != null ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20 }}>
              <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                {this.state.apt_pkg_pic ? (<Image style={{ height: 200 }} source={{ uri: this.state.apt_pkg_pic }}/>):null}
                {this.state.apt_pkg_pic ? (<TouchableOpacity onPress={() => this.removeParcelImage()}
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

                  <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Email</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon type="FontAwesome" name='envelope' style={{ color: '#00c2f3'}}/>
                      <Input placeholder="Enter Customer Email" value={this.state.email_address} onChangeText={(email_address) => this.setState({ email_address: email_address })}/>
                    </Item>
                  </Item>

                   <Item stackedLabel>
                    <Label style={{ fontWeight: 'bold' }}>Phone</Label>
                    <Item style={{ borderBottomColor: '#00c2f3'}}>
                      <Icon type="FontAwesome" name='phone' style={{ color: '#00c2f3'}}/>
                      <Input maxLength={10} placeholder="Enter Customer Phone" keyboardType = 'numeric' value={this.state.phone_number} onChangeText={(phone_number) => this.setState({ phone_number: phone_number })}/>
                    </Item>
                  </Item>
                </Form>
                

            {this.state.is_exception_case ? (<View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
              <Button small onPress={() => this.takePhoto()}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
              <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>TAKE PHOTO </Text>
              <Icon name='camera' />
              </Button>
            </View>):null}

            {this.state.exception_case_pics ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20 }}>
              <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                {this.state.exception_case_pics ? (<Image style={{ height: 200 }} source={{ uri: this.state.exception_case_pics }}/>):null}
                {this.state.exception_case_pics ? (<TouchableOpacity onPress={() => this.removePlaceImage()}
                                  style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                  <Icon type="FontAwesome" name='times'  style={{ color: '#F9CCBE'}}/>
                </TouchableOpacity>):null}
              </View>
            </View>):null}
             </View>
         
          <View style={{ flexDirection: 'row', marginTop: 5,justifyContent:'space-between'}}>
              <Button style={{ height: 50, width:'48%',marginTop: 20, backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.saveData()} disabled={this.state.isloading?true:false}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Submit</Text>
              </Button>
             
              <Button style={{ height: 50, width:'48%',marginTop: 20, backgroundColor: 'white', borderColor:'#00c2f3', borderWidth:1, justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.props.navigation.navigate('MAP')}>
                    <Text style={{ textAlign: 'center', color: 'black', fontSize: 22 }}>Cancel</Text>
              </Button>
          </View>
          </View>
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


const styles1 = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    borderColor: '#00c2f3',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
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
export default connect(mapStateToProps,matchDispatchToProps)(AddMapStop);