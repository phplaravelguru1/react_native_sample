import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert,Modal} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, ListItem, CheckBox, Body,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import { saveProductInfo,getData,getUser,searchParcelAddress,postData,getDataTextract,getDataAwsRecog,create_rescue_route } from 'api';
import CustomHeader from '../../CustomHeader';
import Geolocation from 'react-native-geolocation-service';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });

import NetInfo from "@react-native-community/netinfo";

class LoadMain extends Component {
constructor(props) {
    super(props);

     db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
          console.log('item:', res.rows.length);
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
      mannul_parcel:true,
      imageScanAttempt:0,
      is_photo_btn:true,
      total_packages:0,
      total_stops:0,
      scanParcel:0,
      VerifyPackageCount:0,
      VerifyPackages:[],
      isSubmit:true,
      totalTime:'',
      actualTime:'',
      totalDistance:'',
      };

  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }




    componentDidMount = () => {
      console.log("___________m_________");
       const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
        this._getStopcount();
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
        mannul_parcel:true,
        is_photo_btn:true,
        apt_pkg_pic:null
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

  _getStopcount(){
    console.log("come-----------------")
    getData('rescue_load_count')
        .then((res) => {
          if(res.type == 1){
           this.setState({
            total_stops:res.data.total_stops,
            total_packages:res.data.total_packages,
            VerifyPackages:res.data.VerifyPackages,
            VerifyPackageCount:res.data.VerifyPackages.length
          });
           this.getTimeDistance(res.data.RoutingPackages)
           if(res.data.total_packages == res.data.VerifyPackages.length) {
            this.setState({isSubmit:false});
           }
          }
        }).catch(error => {
      this.setState({isloading:false});
        _showErrorMessage(error.message);      
    });
    

  }

  _verifyPackage(){
    this.setState({ isloading: true });
     var postdata = { barcode:this.state.barcodes};
    postData(postdata,'rescue_load_verify')
        .then((res) => {
          console.log(res);
          if(res.type == 1) {
            this.setState({
             VerifyPackageCount:res.data.VerifyPackages,isloading: false
            });
            this._getStopcount();
          } else {
            _showErrorMessage(res.message); 
            this.setState({ isloading: false });
          }
          
        }).catch(error => {
        _showErrorMessage(error.message); 
        this.setState({ isloading: false });     
    });
  }

  _verifyPackage2(barcode){
    this.setState({ isloading: true });
     var postdata = { barcode:barcode};
    postData(postdata,'rescue_load_verify')
        .then((res) => {
          console.log(res);
          if(res.type == 1) {
            this.setState({
             VerifyPackageCount:res.data.VerifyPackages,isloading: false
            });
            this._getStopcount();
          } else {
            _showErrorMessage(res.message); 
            this.setState({ isloading: false });
          }
          
        }).catch(error => {
        _showErrorMessage(error.message); 
        this.setState({ isloading: false });     
    });
  }

  getTimeDistance(data){

    var url = 'https://wse.ls.hereapi.com/2/findsequence.json?apiKey=wSg9ZNFX0A6AGmgaH7Euid5UQM2yFgtubg1_FfO-iIg&start='+data[0].latitude+','+data[0].longitude+'&improveFor=distance&mode=fastest;car;traffic:disabled;&';
      
      var count = 0;
      var string = url;
      for (const key of data) {
          // console.log(count)
          if(count != 0){
          
            string+= 'destination'+count+'='+key.barcode+';'+key.latitude+','+key.longitude+'&'
          }

          count++;
      }
      this.sequenceWaypoints(string,data);

  }

async sequenceWaypoints(url,data){

 await fetch(url,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }       
  })
  .then((response) => response.json())
  .then((res) => {
  if(res.results != null){
    const markersData = [];

    const _this = this; 
    
  
    var route_distance = parseFloat(res.results[0].distance/1000).toFixed(2)+' KM';

    var additional = data.length*3;
    var combaine = res.results[0].time/60;

    var time = parseFloat(additional+combaine).toFixed(2);
    var route_time = this.timeConvert(time);
    var actual_route_time = this.timeConvert(combaine);

    this.setState({totalTime:route_time,actualTime:actual_route_time,totalDistance:route_distance});

    _showSuccessMessage('Time and distance has been updated');
          
  }
  else 
  {
     _showErrorMessage(res.errors[0]);
     this.setState({ isloading: false });
    
  }
 
  })
  
}
timeConvert(n) {

var minutes = n;
var hours = (minutes / 60);
var rminutes = Math.floor(minutes);
var rhours = Math.floor(hours);
var minutes2 = (hours - rhours) * 60;


return rhours + " HRS " + Math.floor(minutes2) + " MIN";
}



  createRoute(){

    this.setState({ isloading: true });
    const _this = this; 
    Geolocation.getCurrentPosition((position) => {

          var startlatitude = position.coords.latitude;
          var startlongitude = position.coords.longitude;
        
            let data =  {start_point_lat:startlatitude,start_point_long:startlongitude,route_distance:this.state.totalDistance,route_time:this.state.totalTime,actual_route_time:this.state.actualTime}

              create_rescue_route(data).then(res => {
                if(res.type == 1) {
                  _storeData('is_route_created','yes').then();
                  _showSuccessMessage(res.message);
                   _this.props.navigation.navigate('REMAP')
                   this.setState({ isloading: false });
                  } else {

                    this.setState({ isloading: false });
                   _showErrorMessage(res.message);
                }
              })

            },
            (error) => {
              _showErrorMessage(error.message+" Please try again");
            },
            {
        enableHighAccuracy: false,
        timeout: 15000
      });

    

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
      console.log(res);
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
  

    onScannerSuccess = e => {
    const _this = this;
    const { data } = e;
      this.setState({
          barcode: '',
          isloading: true
        }, () => {
            if (data) {
              var postdata = { barcode: String(data) };
              var barcode = String(data);
              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
              this.setState({isloading: false});
                _this._verifyPackage2(String(data));

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


  refreshPage() {
    this.props.navigation.push('LoadMain');
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
      VerifyPackages,isSubmit,total_packages,scanParcel,total_stops,VerifyPackageCount} = this.state;
     
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
        <View style={{height:130}}>
          <QRCodeScanner
            markerStyle={{height: 120,width: 290}}
            cameraStyle={{ height: 120, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }}
            onRead={ (e) => this.onScannerSuccess(e) }
                reactivate={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                showMarker={true}
                reactivateTimeout={7000}
            />
          </View>

          <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter Parcel Code Here</Label>
                  <Item>
                        <Input placeholder="Enter Parcel Code" value={this.state.barcodes} onChangeText={(barcodes) => this.setState({ barcodes: barcodes })}/>
                        <TouchableOpacity onPress={() => this._verifyPackage()}>
                    <Icon  type="FontAwesome" name='search' style={{ color: '#00c2f3'}}/>
                  </TouchableOpacity>
                  </Item>
                </Item>
              </Form>


          <View style={{flex:1}}>
          <View style={{alignItems: 'center',height:25,marginTop:6,backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>{VerifyPackageCount} off {total_packages} Packages Scanned </Text>
          </View>
          <View style={{backgroundColor: '#cbf2fc'}}>
            <View style={{alignItems: 'center',justifyContent:'space-between', marginTop:6,width:'99%',flexDirection:'row'}}>
              <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginLeft:2}}>STOPS : {total_stops}</Text>
              <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginRight:10}}>PACKAGES : {total_packages}</Text>
            </View>
          </View>

          <View style={{backgroundColor:'#e5f8fd', alignItems: 'center',width:'99%',flexDirection:'row'}}>
            <Text style={{fontWeight:'bold', fontSize: 14,alignSelf:'center',marginLeft:2,paddingTop:8,paddingBottom:8,width:'18%'}}>S.NO</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginRight:10,paddingTop:8,paddingBottom:8,width:'60%'}}>BARCODE</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center',marginRight:10,paddingTop:8,paddingBottom:8,width:'18%'}}>STATUS</Text>
          </View>
          <View style={{borderWidth:1,borderColor:'#cedfe4'}}>
          </View>

          {this.state.VerifyPackages.map((res, i) => {
            return (
              <View>
          <View style={{alignItems: 'center',backgroundColor: '#e5f8fd',width:'99%',flexDirection:'row'}}>
            <Text style={{fontWeight:'bold', fontSize: 14,marginLeft:1,paddingTop:8,paddingBottom:8,width:'20%'}}>PKG # {que++}</Text>
            <Text style={{fontWeight:'bold', fontSize: 14,textAlign:'center',paddingTop:8,paddingBottom:8,width:'60%',alignSelf:'center'}}>{res.barcode}</Text>
            <Icon type="FontAwesome" name='check-circle' style={{ color: 'green',marginLeft:20}}/>
          </View>
          <View style={{borderWidth:1,borderColor:'#cedfe4'}}>
          </View>
          </View>
          ) 
          }) }

          {this.state.VerifyPackages.length == 0 && <View style={{alignItems:'center'}}><Text style={{textAlign:'center',fontWeight:'bold'}}>No Parcel Scanned</Text></View>}

          </View>
             
             
        </View>
         
           <View style={{ flexDirection: 'row',flex:1,alignSelf:'center'}}>
              <Button style={{ height: 35, width:'95%',marginTop: 10,marginBottom:10, backgroundColor: isSubmit?'#81a4c4':'#054b8b', justifyContent: 'center',}}
                    onPress={() => this.createRoute()} disabled={isSubmit?true:false}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>SCANNING COMPLETE</Text>
              </Button>
          </View>
         
          

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
export default connect(mapStateToProps,matchDispatchToProps)(LoadMain);