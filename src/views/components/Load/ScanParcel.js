import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeData, _storeUser, _retrieveData,checkNet } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import { saveProductInfo, getData, getUser,removeParcels } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { StackActions } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });

import NetInfo from "@react-native-community/netinfo";

class ScanParcel extends Component {
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
      barcodes:[],
      offlineBarcodes:[],
      onlineBarcodes:[],
      invalidBarcodes:[],
      totalCount:'',
      date:'',
      company_id:null,
      loadId:'',
      checkedItems:[],
      user_avtar:'',
      checkedQrCodes:[],
      company_name:'',
      is_rescue:'no'
    };


  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }




    componentDidMount = () => {

      this._unsubscribe = this.props.navigation.addListener('focus', () => {
       _retrieveData('is_rescue').then((res) => {
          if(res == 'yes'){
            this.setState({is_rescue:'yes'})
          }
        });

       this.setState({
            barcodes:[],
            offlineBarcodes:[],
            onlineBarcodes:[],
            invalidBarcodes:[],
            totalCount:0,
            checkedQrCodes:[],
            checkedItems:[]
          });
       const _this = this;
       
       
      checkNet().then((res) => {
        if(res == 2) {
          return false;
        } else if (res == 1) {
          this.setState({netInfo:'Offline'});
          setTimeout(function(){
          //_this.getParcelOffline();
          _this.getParcelOnline();
          _this.getParcelInvalid();
          }, 1000);
        } else {
          this.getParcel();
          this.getParcelOffline();
          this.getParcelInvalid();
        }
      });

      getUser()
          .then((res) => {
            this.setState({
              loadId: res.scanner_id,
              date: res.date,
              user_avtar: res.user_avtar,
            });
        });

          _retrieveData('companyId')
          .then((res) => {
            if(res != null){
              this.setState({company_id:res})
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
  };

 

    componentWillUnmount() {
    this._unsubscribe();
  }

    getParcelOffline = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM table_stops WHERE sync_status = 'offline' AND delivery_status = 'active'",
          [],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            this.setState({offlineBarcodes:temp});
          }
        );
      }); 
    }


       getParcelInvalid = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM table_stops WHERE sync_status = 'invalid'",
          [],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            this.setState({invalidBarcodes:temp});
          }
        );
      }); 
    }

     getParcelOnline = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM table_stops",
          [],
          (tx, results) => {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            this.setState({onlineBarcodes:temp});
          }
        );
      }); 
    }
   
   getParcel = () => {
    getData('listparcel').then((res) => {
        console.log("Testing agian");
        console.log(res);
        if(res.type == 1) {
          this.setState({
           barcodes:res.data.barcodes,
           totalCount:res.data.total_count
          });

          res.data.barcodes.map((res, i) => {
              db.transaction((tx) => {
              tx.executeSql(
                 'SELECT barcode FROM table_stops where barcode = ?',
                [res],
                (tx, resultss) => {
                  if(resultss.rows.length == 0) {
                       db.transaction(function (tx) {
                        tx.executeSql(
                          'INSERT INTO table_stops (barcode,sync_status) VALUES (?,?)',
                          [res,'online'],
                          (tx, results) => {
                          if (results.rowsAffected > 0) {
                            console.log('Results', results.rowsAffected);
                          } else {
                            console.log("falied");
                            }
                          }
                        );
                      });
                  } else {
                    console.log("here");
                  }
                }
              );
            });
          });
        } else {
          this.setState({
            barcodes:[],
            totalCount:0
          });

           this.props.navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [
                      { name: 'Company'}
                    ],
                  })
          );

          _storeData('HomeSecreen','Company').then();
        }
    });
   }


    /*Remove Image from modal*/
  removeImage(_state) {
    this.setState({ [_state]: false});
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

  checkedItem = (id,val) => {
    if(this.state.checkedItems.includes(id)){
      const allItems = this.state.checkedItems.filter((item, i) => item !== id);
      this.setState({ checkedItems: allItems });
      // this.setState({ checkedQRcodes: allItems });
    } else {
      let items = this.state.checkedItems;
      items.push(id);
      this.setState({ checkedItems: items });
    }
  }

  nextScan = () => {
    if(this.state.is_rescue == 'no') {
      this.props.navigation.navigate('LoadMain');
    } else {
      this.props.navigation.navigate('Rescue');
    }
  }

  cancel = () => {
    if(this.state.is_rescue == 'no') {
      this.props.navigation.navigate('LoadMain');
    } else {
      this.props.navigation.navigate('Rescue');
    }
  }

  complete = () => {
    _storeData('LoadSecreen','Route').then();
    _storeData('HomeSecreen','ScanParcel').then();
    this.props.navigation.navigate('Route');
  }



  removeItems = () => {

    if(this.state.checkedItems.length > 0){

      Alert.alert(
      "Remove",
      "Do you really want to Remove Checked Items?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Yes", onPress: () => {
                    this.state.checkedItems.map((res, i) => {
                    let items = this.state.checkedQrCodes;
                    items.push(this.state.barcodes[res]);
                    this.setState({ checkedQrCodes: items });

                    var postdata = { barcode: items };
                    this.setState({ isloading: true });

                        removeParcels(postdata).then((res) => {

                           items.map((ress, ii) => {
                            console.log(ress);
                        db.transaction((tx) => {
                            tx.executeSql(
                             'DELETE FROM table_stops where barcode = ?',
                            [ress],
                            (tx, resultss) => {
                                if (resultss.rowsAffected > 0) {
                                    console.log("deleteeddd");
                                }
                            });
                          });

                      }); 

                      console.log(res);
                    this.setState({ isloading: false });
                       if(res.type == 1) {
                             this.getParcel();
                            _showSuccessMessage(res.message);
                      } else {
                        _showErrorMessage(res.message);
                      }
                  }).catch(function (error) {
                    console.log(error);
                    this.setState({ isloading: false });
                    _showErrorMessage(error.message);
                       
                    });

                    
                  });
            } 
        }
      ],
      { cancelable: false }
    );
     
    } else {
      _showErrorMessage('Please select scanned items');
    }
    
  }

  refreshPage() {
    this.props.navigation.push('ScanParcel');
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

    return (
      <Container>
        <Content>
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

          {this.state.barcodes.length > 5 ?(<View>
           <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:5}}>
          </View>
          <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center', paddingTop:10, paddingBottom:8}}>

            <Text style={{ color: 'black', fontSize: 16,fontWeight:'bold' }}>Total Scans:</Text>
            <Text style={{ color: '#00c2f3', fontSize: 16,fontWeight:'bold' }}>{this.state.offlineBarcodes.length + this.state.totalCount + this.state.onlineBarcodes.length}</Text>

          <Button rounded Info
              style={{ backgroundColor: 'white',textAlign: 'center',alignItems:'center',height:30,borderColor:'#00c2f3',borderWidth: 2}}
              onPress={() => this.nextScan()}>
              <Text style={{ fontWeight:'200', color: '#00c2f3', fontSize: 16, paddingLeft:8, paddingRight:8,paddingBottom:4 }}>Next Scan +</Text>
          </Button>
        </View>
        </View>):null}

          <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:4}}>
          </View>

        <View style={{height:10}}></View>
        <View>
             <Text style={{ color: 'black', fontSize: 18,fontWeight:'bold' }}>SCANNED ITEMS LIST:</Text>
        </View>    
        {this.state.barcodes.map((res, i) => {
            return (
            <View key={i} style={{padding:3}}>
              <View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#AEACAB',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
                
                <TouchableOpacity style={backButton} onPress={() => this.checkedItem(i,res)}>
                  <Icon type="FontAwesome" name={this.state.checkedItems.includes(i)?'toggle-off':'toggle-on'} style={{ color: 'black',fontWeight: 100}}/>
                </TouchableOpacity>
                
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res}</Text>
                <Icon type="FontAwesome" name='check-circle' style={{ color: 'green'}}/>
              </View>
            </View>
            );
          })
        }
        {this.state.offlineBarcodes.map((res, i) => {
            return (
            <View key={i} style={{padding:3}}>
              <View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#AEACAB',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
                
                <TouchableOpacity style={backButton} onPress={() => this.deleteInvalidParcel(res.barcode)}>
                  <Icon type="FontAwesome" name={'trash'} style={{ color: 'black',fontWeight: 100}}/>
                </TouchableOpacity>
                
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res.barcode}</Text>
                <Icon type="FontAwesome" name='check-circle' style={{ color: 'green'}}/>
              </View>
            </View>
            );
          })
        }

         {this.state.onlineBarcodes.map((res, i) => {
            return (
            <View key={i} style={{padding:3}}>
              {res.sync_status == 'offline'?(<View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#F9CCBE',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
               <TouchableOpacity style={backButton} onPress={() => this.deleteInvalidParcel(res.barcode)}>
                  <Icon type="FontAwesome" name={'trash'} style={{ color: 'black',fontWeight: 100}}/>
                </TouchableOpacity>
                
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res.barcode}</Text>
                <Icon type="FontAwesome" name='check-circle' style={{ color: 'green'}}/>
              </View>):(<View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#AEACAB',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
                 <TouchableOpacity style={backButton} onPress={() => this.checkedItem(i,res)}>
                  <Icon type="FontAwesome" name={this.state.checkedItems.includes(i)?'toggle-off':'toggle-on'} style={{ color: 'black',fontWeight: 100}}/>
                </TouchableOpacity>
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res.barcode}</Text>
                <Icon type="FontAwesome" name='check-circle' style={{ color: 'green'}}/>
              </View>)}
            </View>
            );
          })
        }

        {this.state.invalidBarcodes.map((res, i) => {
            return (
            <View key={i} style={{padding:3}}>
              <View key={i} style={{padding:7,flexDirection:'row',backgroundColor:'#F9CCBE',borderRadius: 5, justifyContent: 'space-between',alignItems:'center'}}>
                
                <TouchableOpacity style={backButton} onPress={() => this.deleteInvalidParcel(res.barcode)}>
                  <Icon type="FontAwesome" name={'trash'} style={{ color: 'black',fontWeight: 100}}/>
                </TouchableOpacity>
                
                <Text style={{alignSelf: 'stretch', width:'60%', paddingTop:4}}>{res.barcode} (InValid)</Text>
                <Icon type="FontAwesome" name='times-circle' style={{ color: 'trd'}}/>
              </View>
            </View>
            );
          })
        }

        <View style={spaceDivider}></View>
        <View style={{ flexDirection: 'row',justifyContent: 'space-between',alignItems:'center'}}>
            <Text style={{ color: 'black', fontSize: 18,fontWeight:'bold' }}>Total Scans:</Text>
            <Text style={{ color: '#00c2f3', fontSize: 18,fontWeight:'bold' }}>{this.state.offlineBarcodes.length + this.state.totalCount + this.state.onlineBarcodes.length}</Text>

          <Button rounded Info
              style={{  height:30,backgroundColor: 'white',borderColor:'#00c2f3',borderWidth: 2, alignItems:'center'}}
              onPress={() => this.nextScan()}>
              <Text style={{ textAlign: 'center', fontWeight:'200', color: '#00c2f3', fontSize: 16, paddingLeft:8, paddingRight:8,paddingBottom:4 }}>Next Scan +</Text>
          </Button>
        </View>  

        <View style={{borderColor: '#00c2f3',borderWidth: 1, marginTop:12}}>
        </View>

          <View style={{ flexDirection: 'row', marginTop: 25}}>
             <Button style={{width:'33%', backgroundColor: '#00c2f3', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.complete()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22}}>Complete</Text>
              </Button>

              <Button style={{width:'33%',marginLeft: 2, backgroundColor: '#054b8b', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.removeItems()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Remove</Text>
              </Button>

              <Button style={{width:'33%',marginLeft: 2, backgroundColor: 'grey', justifyContent: 'center',borderRadius:6}}
                onPress={() => this.cancel()}>
                <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Cancel</Text>
              </Button>
          </View>
          </View>
          <View style={spaceDivider}></View>
          <View style={spaceDivider}></View>
          </Content>
          {this.state.isloading && (
              <Loader />
          )}
        </Container>
        );
}
}

export default ScanParcel;