import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Platform,Alert,Modal} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon,Card,CardItem,Body,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll,_storeData, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import CheckBox from '@react-native-community/checkbox';
import { getData,searchParcel,searchParcelUseAddress } from 'api';
import CustomHeader from '../../CustomHeader';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import { measureConnectionSpeed } from 'react-native-network-bandwith-speed';
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });

class Delivery extends Component {
constructor(props) {
    super(props);

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_stops'",
        [],
        function (tx, res) {
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_stops', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_stops(id INTEGER PRIMARY KEY AUTOINCREMENT, barcode VARCHAR(20), stop_id INT(10), address VARCHAR(255), customer_name VARCHAR(255),company_id VARCHAR(255),street_address VARCHAR(255),city VARCHAR(255),province VARCHAR(255),postal_code VARCHAR(255),email_address VARCHAR(255),phone_number VARCHAR(255),sync_status VARCHAR(10),is_exception_case VARCHAR(10),exception_case_pics VARCHAR(255),customer_address VARCHAR(255),delivery_status VARCHAR(15),reason_id INT(10),comment VARCHAR(255),gps_long VARCHAR(255),gps_lat VARCHAR(255),place_img VARCHAR(255),signature_img TEXT,sign_by VARCHAR(255),door_knocker_pic VARCHAR(255),door_knocker_barcode VARCHAR(255),apt_number VARCHAR(100),process_status VARCHAR(10),pod_photo_3 VARCHAR(255),pod_photo_4 VARCHAR(255),pod_photo_5 VARCHAR(255),shipper_number VARCHAR(255),person_name VARCHAR(100))',
              []
            );
          }
        }
      );
    }); 

    this.state = {
      isloading: false,
      company_name:null,
      company_id:null,
      user_avtar:'',
      deliveryList:[],
      totalStops:0,
      completed:0,
      checkedItem:null,
      stopId:0,
      isShowScanner:false,
      barcode:'',
      not_delivered_count:0,
      return_count:0,
      totalpack:0,
      PendingStops:0,
      full_address:null,
      is_delivery:0,
      retail_drops:0,
      retail_drop_stops_count:0,
      door_knocker_count:0,
      dataProcess1: false,
      searchText:'Search stop use address',
      rtwOptionModal:false,
      is_pickup:'yes'
    };


  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }

    componentDidMount = () => {

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
      const _this = this;   
      db.transaction((tx) => {
            tx.executeSql("SELECT * FROM table_stops WHERE sync_status = 'offline'",
            [],
            (tx, results) => {
              if(results.rows.length > 0){
                this.setState({dataProcess1: true});
                setTimeout(function(){
                _this.getOfflineDataInfo();
              }, 1000);
              } else {
                 this.getDataInfo();
              }
              });
          });

       _retrieveData('user_avtar').then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
      });

       this.setState({barcode: ''});
       setTimeout(function(){
              _this.setState({dataProcess1: false});
            }, 18000);
        });
    
   

   
  };


  componentWillUnmount() {
    this._unsubscribe();
  }



  getDataInfo = () => {
     getData('rescue_delivery_list').then((res) => {
      if(res.type == 1) {
        this.setState({
          isloading:false,
          is_delivery: 1,
          completed:res.data.completed_stops,
          totalStops:res.data.total_stops,
          deliveryList:res.data.delivery_list,
          company_name:res.data.company_name,
          company_id:res.data.company_id,
          not_delivered_count:res.data.not_delivered_count,
          return_count:res.data.return_count,
          totalpack:res.data.TotalPackages,
          PendingStops:res.data.PendingStops,
          stopId:0,
          retail_drops:res.data.retail_drops,
          retail_drop_stops_count:res.data.retail_drop_stops_count,
          door_knocker_count:res.data.door_knocker_count,
          is_pickup:res.data.is_pickup,
        }); 

        _storeData('company_id',res.data.company_id).then();
        _storeData('completed_',res.data.completed_stops).then();
        _storeData('totalStops_',res.data.total_stops).then();
        _storeData('not_delivered_count_',res.data.not_delivered_count).then();
        _storeData('return_count_',res.data.return_count).then();
        _storeData('totalpack_',res.data.TotalPackages).then();
        _storeData('PendingStops_',res.data.PendingStops).then();
        _storeData('retail_drops_',res.data.retail_drops).then();
        _storeData('retail_drop_stops_count_',res.data.retail_drop_stops_count).then();
        _storeData('door_knocker_count_',res.data.door_knocker_count).then();
              res.data.delivery_list.map((res, i) => {
              db.transaction((tx) => {
              tx.executeSql(
                 'SELECT barcode,sync_status FROM table_stops where barcode = ?',
                [res.barcode],
                (tx, resultss) => {
                  let offdata = resultss.rows.item(0);
                  if(resultss.rows.length == 0) {
                       db.transaction(function (tx) {
                        tx.executeSql(
                          'INSERT INTO table_stops (id,sync_status,barcode,postal_code,province,city,customer_name, stop_id, customer_address, delivery_status,email_address,phone_number,address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                          [res.stop_id,'online',res.barcode,res.postal_code,res.province,res.city,res.customer_name, res.stop_id, res.customer_address,res.delivery_status,res.email_address,res.phone_number,res.address],
                          (tx, results) => {
                          if (results.rowsAffected > 0) {
                            console.log('Results', results.rowsAffected);
                          } else {
                            console.log("falied");
                            }
                          }
                        );
                      });
                  } 
                  else if(offdata.sync_status != 'offline') {
                      db.transaction((tx) => {
                            tx.executeSql(
                              'UPDATE table_stops set customer_address=?,delivery_status=?,stop_id=?,postal_code=?,province=?,city=?,customer_name=?,email_address=?,phone_number=?,address=? where barcode=?',
                              [res.customer_address,res.delivery_status,res.stop_id,res.postal_code,res.province,res.city,res.customer_name,res.email_address,res.phone_number,res.address,res.barcode],
                              (tx, results) => {
                                if (results.rowsAffected > 0) {
                                } else alert('Updation Failed');
                              },
                (error) => {
                        console.log(error);
                    }
                            );
                          });
                  }
                },
                (error) => {
                        console.log(error);
                    }
              );
            });
          });

         _retrieveData('startday')
        .then((res) => {
          if(res != null){
            if(res != 1 ){
              _showErrorMessage('Please Start Day First');
              this.props.navigation.navigate('StartDayReport');
            }
          }
        });


      } else {
        this.setState({isloading:false});
        _showErrorMessage(res.message);
      }
  }).catch(error => {
          this.setState({isloading:false});
          if(error.message == 'Network request failed') {
            this.getOfflineDataInfo();
          } else {
          _showErrorMessage(error.message);  
          }
    });

  this.setState({isloading:false});

  } 



  getOfflineDataInfo = () => {
    //this.setState({is_delivery:1});
    const _this = this;
        _retrieveData('completed_').then((res) => {
      if(res != null){
        _this.setState({completed:res});
      }
    });

      _retrieveData('totalStops_').then((res) => {
        if(res != null){
          _this.setState({totalStops:res});
        }
      });

      _retrieveData('not_delivered_count_').then((res) => {
        if(res != null){
          _this.setState({not_delivered_count:res});
        }
      });

      _retrieveData('return_count_').then((res) => {
        if(res != null){
          _this.setState({return_count:res});
        }
      });

      _retrieveData('totalpack_').then((res) => {
        if(res != null){
          _this.setState({totalpack:res});
        }
      });

      _retrieveData('PendingStops_').then((res) => {
        if(res != null){
          _this.setState({PendingStops:res});
        }
      });

      _retrieveData('door_knocker_count_').then((res) => {
        if(res != null){
          _this.setState({door_knocker_count:res});
        }
      });

      _retrieveData('retail_drops_').then((res) => {
        if(res != null){
          _this.setState({retail_drops:res});
        }
      });

      _retrieveData('retail_drop_stops_count_').then((res) => {
        if(res != null){
          _this.setState({retail_drop_stops_count:res});
        }
      });


      db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_stops ORDER BY id DESC",
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i)
            temp.push(results.rows.item(i));
          this.setState({deliveryList:temp});
        }
      );
    });
  }

   findStop = () => {
    this.setState({isloading: true});
    this.findStopOffline();
    //  checkNet().then((res) => {
    //   this.setState({isloading: false});
    //   if(res == 2) {
    //     return false;
    //   } else if (res == 1) {
    //     this.findStopOffline();
    //   } else {
    //     this.findStopOnline();
    //   }
    // });
   };


    findStopOffline = () => {
      this.setState({ isloading: false });
      const _this = this;
        db.transaction((tx) => {
      tx.executeSql(
         'SELECT * FROM table_stops where barcode = ?',
        [this.state.barcode],
        (tx, results) => {
          if(results.rows.length > 0) {
            let d = results.rows.item(0);
            _this.props.navigation.navigate('CustomerDetail', { stopid: d.stop_id,company_name:'CANPAR'});
          } else {
            this.findStopOnline();
            //_showErrorMessage('Parcel is not found for this barcode '+this.state.barcode);
          }
        }
      );
    });

      // _this.setState({isloading:true});
      // setTimeout(function(){
      //   var postdata = { barcode:_this.state.barcode };
         
      //       _this.setState({
      //         isloading:false,
      //         completed:res.data.completed_stops,
      //         totalStops:res.data.total_stops,
      //         deliveryList:res.data.delivery_list,
      //         company_name:res.data.company_name
      //       });
      //       _this.props.navigation.navigate('CustomerDetail', { stopid: res.data.stop_id,company_name:'ICS'});
          
      // }, 2000);
  }


   findStopOnline = () => {
    const _this = this;
    this.checkNetwork();
    _this.setState({isloading:true});
    setTimeout(function(){
      var postdata = { barcode:_this.state.barcode };
       searchParcel(postdata).then((res) => {
        if(res.type == 1) {
          _this.setState({
            isloading:false,
            completed:res.data.completed_stops,
            totalStops:res.data.total_stops,
            deliveryList:res.data.delivery_list,
            company_name:res.data.company_name
          });
          _this.props.navigation.navigate('CustomerDetail', { stopid: res.data.stop_id,company_name:_this.state.company_name});
        } else {
          _showErrorMessage(res.message);
          _this.setState({
            isloading:false,
            deliveryList:[]
          });
        }
    }).catch(error => {
          this.setState({isloading:false});
          _showErrorMessage(error.message);
    });
    }, 2000);
  }


findStopManuallyAddress = () => {
  if(this.GooglePlacesRef.getAddressText() == '' || this.GooglePlacesRef.getAddressText() == null){
    _showErrorMessage('Search Address field is requried');
    return false;
  } else {
      this.setState({ full_address: this.GooglePlacesRef.getAddressText()}, () => {
        this.findStopUseAddress();
      }, 500);
      
  }
}
   findStopUseAddress = () => {
    this.checkNetwork();
    if(this.state.full_address == '' || this.state.full_address == null){
      _showErrorMessage('The full Address field is required');
    } else {
    this.setState({isloading:true});
    var postdata = { full_address:this.state.full_address };
     searchParcelUseAddress(postdata).then((res) => {
      if(res.type == 1) {
        this.GooglePlacesRef.setAddressText('');
        this.setState({
          isloading:false,
          completed:res.data.completed_stops,
          totalStops:res.data.total_stops,
          deliveryList:res.data.delivery_list,
          company_name:res.data.company_name
        });
      } else {
        _showErrorMessage(res.message);
        this.setState({
          isloading:false,
          deliveryList:[]
        });
      }
  }).catch(error => {
          this.setState({isloading:false});
          _showErrorMessage(error.message);
    });

   }
  }

 


    /*Remove Image from modal*/
  removeImage(_state) {
    this.setState({ [_state]: false});
  }

  rtwOptions(option) {
    this.setState({rtwOptionModal: false});
    this.props.navigation.navigate(option);
  } 

  rtw() {
    if(this.state.is_pickup == 'yes') {
      this.setState({rtwOptionModal: true});
    } else {
      this.props.navigation.navigate('Rtw');
    }
  }

  scanCode() {
     this.setState({
          isShowScanner: true
      });
  }

  arrived = () => {
     if(this.state.stopId > 0){
       this.props.navigation.navigate('CustomerDetail', { stopid: this.state.stopId,company_name:this.state.company_name});
     } else {
      _showErrorMessage('Please select a stop');
     }
  }

  addStop = () => {
    this.props.navigation.navigate('AddStop', { company_id: this.state.company_id,company_name:this.state.company_name});
  }

  
  showEndDay = () => {
      db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_stops WHERE sync_status = 'offline'",
        [],
        (tx, results) => {
          if(results.rows.length > 0) {
            _showErrorMessage('Please wait local data is saving');
          } else {

            _retrieveData('PendingStops_').then((res) => {
              if(res != null && res > 0){
                  _showErrorMessage('You do not  do enday. because you have pending '+res+' stop.');
              } else {
                if(this.state.completed > 0 || this.state.not_delivered_count > 0 || this.state.PendingStops == 0) {
                  this.props.navigation.navigate('EndDayReport', { company_id: this.state.company_id,company_name:this.state.company_name});
                }
              }
            });

            
          }
        }
      );
    });
  }

  setCheckedItem = (stop_id) => {
    
    if(this.state.stopId == stop_id){
      this.setState({stopId:0});
       
    } else {
         this.setState({stopId:stop_id});
    }
  }

  scanParcel = () => {
    this.setState({
      isShowScanner: true
    });
  }

    onScannerSuccess = e => {
      const _this = this;
    const { data } = e;
      this.setState({
          isloading: true
        }, () => {
          // console.log(data);
            if (data) {
              this.setState({isShowScanner: false});
              // call api to get vehicle number from 
              var barcode = String(data);

              if(barcode.includes('*')){
                    this.setState({ isloading: false });
                     _showErrorMessage('Oops wrong barcode. Please scan barcode that start without  *');
              } else {
                  this.setState({ barcode: barcode });
                  _this.findStop();
                }
              
            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid QR Code',
                'This QR code is not Parcel code',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
  }

checkNetwork () {
  NetInfo.fetch().then(state => {
    if(state.isConnected == false) {
       this.setState({
        isloading: false,
      });
      _showErrorMessage('Your phone not connect with internet. Please try again');
      return false;
    } else {
     this.getNetworkBandwidth();
    }
  });
}

 getNetworkBandwidth = async (): Promise<void> => {
  try {
    const networkSpeed: NetworkBandwidthTestResults = await measureConnectionSpeed();
    if(networkSpeed.speed < 1){
    _showErrorMessage('Your internet speed is slow, Your net speed is '+networkSpeed.speed.toFixed(1)+' Mbps');
    
    } 
    } catch (err) {
      console.log(err);  
    }
  }

   refreshPage() {
    this.props.navigation.push('Delivery');
  }

  render() {
    const {
      container,
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
      spaceDivider1,
      nextText,
      nextButton,
      itemMainSub,
      text1
    } = styles;


     
    return (
      <Container>

          { (this.state.isShowScanner) ?
      (<View style={{ height: '100%'}}>
        <View style={container}>
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={{ height: 40, borderColor: '#00c2f3', borderWidth: 1, backgroundColor: '#00c2f3',marginTop: 30,marginBottom:25, marginLeft: 20, marginRight: 20, justifyContent: 'center'}}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems:'center'}} onPress={() => this.setState({ isShowScanner: false })}>
                <Icon type="FontAwesome" name='angle-left' style={{ color: '#fff',marginLeft: 20,fontWeight: 100}}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? -4 : 0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>SEARCH PARCEL</Text>
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
                showMarker={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                reactivateTimeout={7000}
            />
            </View>
      </View>
      </View>
      ):null
      }

      <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:0, fontSize: 22,padding:10,textAlign:'center',paddingLeft:'4%'}}>DELIVERY {this.state.company_name}</Text>
              
              <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
         { (!this.state.isShowScanner && this.state.is_delivery == 1) ?
      (<Content padder>

        <Modal animationType="slide" transparent={true} visible={this.state.rtwOptionModal}>
        <View style={styles1.centeredView}>
          <View style={styles1.modalView}>
            <View style={{alignSelf:'center',padding:10}}>
            <Text style={{fontSize:18, fontWeight:'bold'}}>RTW OPTIONS</Text>
            </View>
            <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignSelf:'center', padding:5}}>
              
              <Button 
                style={{ height: 30, width:'48%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.rtwOptions('Rtw')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>DELIVERY RTW</Text>
              </Button>
              <Button 
                style={{ height: 30, width:'48%', backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5,marginLeft:5}}
                onPress={() => this.rtwOptions('PickupRtw')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>PICKUP RTW</Text>
              </Button>
            </View>
            <View style={{ flexDirection: 'row',justifyContent: 'center',alignSelf:'center', padding:5}}>
              <Button 
                style={{ height: 30, width:'30%', backgroundColor: 'grey', justifyContent: 'center', borderRadius: 5}}
                onPress={() => this.setState({rtwOptionModal: false})}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>CANCEL</Text>
              </Button>
            </View>
            <View style={spaceDivider}></View>
          </View>
        </View>
      </Modal>

         
         

          <View>
          <View style={{ borderRadius: 6,alignItems: 'center',justifyContent:'center',marginTop:5}}>
            <Button small onPress={() => this.scanParcel()} style={{backgroundColor: '#cbf2fc',width:'95%',alignSelf:'center',alignItems:'center',justifyContent:'space-between'}}>
            <Text style={{marginLeft:10,fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>SCAN PARCEL</Text>
            <Icon name='scan' style={{color:'black'}} />
          </Button>
            
           </View>

          <View style={{ marginTop: 10, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View>    
              <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter Parcel Code Here</Label>
                  <Item>
                        <Input placeholder="Enter Parcel Code" value={this.state.barcode} onChangeText={(barcode) => this.setState({ barcode: barcode })}/>
                        <TouchableOpacity onPress={() => this.findStop()}>
                    <Icon  type="FontAwesome" name='search' style={{ color: '#00c2f3'}}/>
                  </TouchableOpacity>
                  </Item>
                </Item>
              </Form>  
          </View>
          <View style={{ marginTop: 10, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View> 
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
                     this.setState({ full_address: details.formatted_address});
                     this.findStopUseAddress();
                    
                  }}
                   query={{
                    key: 'gg',
                    language: 'en',
                    components: 'country:ca',
                    type: 'address'
                  }}
                />
                <TouchableOpacity onPress={() => this.findStopManuallyAddress()}>
                    <Icon  type="FontAwesome" name='search' style={{ color: '#00c2f3'}}/>
                </TouchableOpacity>
            </Item>
            </Item>  

         {this.state.deliveryList.map((res, i) => {
            return (
            <Card key={i+'_a'} style={{borderRadius:5}}>
              <CardItem key={i+'_b'} style={{backgroundColor:'#cbf2fc'}}>
                <Body key={i+'_c'}>
                  <View key={i+'_d'} style={{flexDirection:'row', alignItems:'center',}}>
 
                    {res.delivery_status == 'active' ? <CheckBox tintColors={{ true: 'green', false: 'green' }} key={i+'_e'} style={{color:'red',height: 18, width: (Platform.OS == 'ios') ?18:28}} value={this.state.stopId == res.stop_id?true:false} onValueChange={() => this.setCheckedItem(res.stop_id)}  tintColor="#ffffff" onTintColor="#000000" onFillColor="#000000"/>
                    :<CheckBox tintColors={{ true: '#000', false: '#fff' }} key={i+'_f'} style={{color:'red', height: 18, width: (Platform.OS == 'ios') ?18:28}} disabled={true} value={true} tintColor="#ffffff" onTintColor="#000000" onFillColor="#000000"/>}
                    <Text key={i+'_g'} style={{fontWeight:'bold', width:'50%',paddingLeft:4}}>
                    {res.customer_name}
                    </Text>
                  </View>
                  <View key={i+'_h'} style={{paddingLeft:30}}>
                    <Text key={i+'_i'} style={{fontWeight:'bold'}}>
                    {res.customer_address}
                    </Text>
                  </View>
                </Body>
              </CardItem>
            </Card>
            );
          })
        }

        {this.state.deliveryList.length == 0 ?(<View style={{justifyContent: 'center',alignItems: 'center'}}><Text style={{color:'#eb5729', fontSize:20, fontWeight:'bold'}}>No Data Found</Text></View>):null}
        <View style={{backgroundColor:'#00c2f3'}}>
         <View style={spaceDivider1}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
          <View style={{ flexDirection: 'row',marginLeft:5}}>
              <Text style={text1}>TOTAL STOPS:</Text>
              <Text style={[text1,{paddingLeft:5}]}>{this.state.totalStops}</Text>
            </View>

            <View style={{ flexDirection: 'row',marginRight:5}}>
            <Text style={[text1,{paddingLeft:5}]}>TOTAL PACKAGES:</Text>
            <Text style={[text1,{paddingLeft:5}]}>{this.state.totalpack}</Text>
            </View>

        </View>  
        <View style={spaceDivider1}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
          <View style={{ flexDirection: 'row',marginLeft:5}}>
              <Text style={text1}>DELIVERED:</Text>
              <Text style={[text1,{paddingLeft:5}]}>{this.state.completed}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems:'center',marginRight:5}}>
            <Text style={[text1,{paddingLeft:5}]}>NOT DELIVERED{'\n'}-Attempted:</Text>
            <Text style={[text1,{paddingLeft:10}]}>{this.state.not_delivered_count}</Text>
            </View>

        </View>


         <View style={spaceDivider1}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
          <View style={{ flexDirection: 'row',marginLeft:5}}>
              <Text style={text1}>RETURN:</Text>
              <Text style={[text1,{paddingLeft:5}]}>{this.state.return_count}</Text>
            </View>
             <View style={{ flexDirection: 'row',marginRight:5}}>
            <Text style={[text1,{paddingLeft:5}]}>PENDING STOPS:</Text>
            <Text style={[text1,{paddingLeft:10}]}>{this.state.PendingStops}</Text>
            </View>

        </View> 

        <View style={spaceDivider1}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
          <View style={{ flexDirection: 'row',marginLeft:5}}>
              <Text style={text1}>RETAIL DROPS:</Text>
              <Text style={[text1,{paddingLeft:5}]}>{this.state.retail_drops}</Text>
          </View>
           <View style={{ flexDirection: 'row',marginRight:5}}>
            <Text style={[text1,{paddingLeft:5}]}>RETAIL DROP STOPS:</Text>
            <Text style={[text1,{paddingLeft:10}]}>{this.state.retail_drop_stops_count}</Text>
            </View>
        </View> 


          <View style={spaceDivider1}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
          <View style={{ flexDirection: 'row',marginLeft:5}}>
              <Text style={text1}>DOOR KNOCKERS:</Text>
              <Text style={[text1,{paddingLeft:5}]}>{this.state.door_knocker_count}</Text>
          </View>
          
        </View>  
        </View>  

        <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12,color:"#00c2f3"}}>
        </View>

          <View style={{ flexDirection: 'row', marginTop: 10,justifyContent: 'space-between'}}>
             <Button style={{width:'49.5%', backgroundColor: '#054b8b', justifyContent: 'center',borderRadius:5}}
                onPress={() => this.arrived()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 17}}>ARRIVE</Text>
              </Button>

              <Button style={{width:'49.5%',marginLeft: 2, backgroundColor: '#054b8b', justifyContent: 'center',borderRadius:5}}
                onPress={() => this.props.navigation.navigate('RetailDrop')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 17 }}>RETAIL DROP</Text>
              </Button>
          </View>
          
           <View style={{ flexDirection: 'row',alignItems: 'center',marginTop: 15}}>
           <Button style={{width:'33%',marginLeft: 2, backgroundColor: '#054b8b', justifyContent: 'center',borderRadius:5}}
                onPress={() => this.rtw()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 15 }}>RTW</Text>
              </Button>
 <Button style={{width:'33%',marginLeft: 2,backgroundColor: '#054b8b',borderRadius:5,justifyContent: 'center'}}
                onPress={() => this.props.navigation.navigate('Correction')}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 15 }}>CORRECTION</Text>
               
              </Button>
              
             

               <Button style={{width:'33%',marginLeft: 2, backgroundColor: '#054b8b', justifyContent: 'center'}}
                onPress={() => this.showEndDay()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 17 }}>END DAY</Text>
              </Button>
          </View>

         
          </Content>):null}


        { (!this.state.isShowScanner && this.state.is_delivery == 0) ?
      (<Content padder>

          <View>
          
          <View style={{justifyContent: 'center',alignItems: 'center', marginTop: 25}}>
            
                <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 18, padding:10,backgroundColor: '#054b8b',borderRadius: 5}}>Please Create Route first</Text>
                <Button 
                    style={{ height: 40, width:'45%', backgroundColor: '#00c2f3',padding:20,marginTop: 25, justifyContent: 'center', alignSelf:'center', borderRadius: 5}}
                    onPress={() => this.props.navigation.navigate('LOAD')}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 18 }}>Back To Load</Text>
                  </Button>
              
          </View> 
          </View>
          </Content>):null}

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
  },
  spaceDivider: {
    height:10
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
export default connect(mapStateToProps,matchDispatchToProps)(Delivery);