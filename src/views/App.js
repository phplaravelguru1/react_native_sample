import React, { Component } from 'react';
import { Toast, Root } from 'native-base';
import { View, Text, Image,Modal,Alert } from 'react-native';
import AppScreens from './Route';
import { NavigationContainer } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import geolocation from '@react-native-community/geolocation';
import allReducers from '../store/reducers/index.js';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import NetInfo from "@react-native-community/netinfo";
import { saveLocation,saveVehicleEnddayInspection,saveVehicleInspection,submitSettlement,updateDeliveryAddress,submitRtw,submitPickupRtw,save_retail_drop,saveDeliveryData,notDelivered,saveProductInfo,getUser,searchParcelAddress,save_load,saveOfflineData,saveDeliveryData2 } from 'api';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll,_storeData, _retrieveData,_retrieveUserToken,checkNetSpeed } from 'assets';
const store = createStore(allReducers);
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
navigator.geolocation = require('@react-native-community/geolocation');
let fetching = false;
class App extends React.Component {
  
  constructor(props){
    super(props);
    let fetching = false;
    this.state = {
      netInfo: 'Online',
      dataProcess: false,
      token:'',
      locationAlert:false,
      locationMsg:'Please on your location',
      cLat:''
    }
    }
  
  componentDidMount(){
    this.interval = setInterval(() => this.checkNet(), 8000);
    this.interval2 = setInterval(() => this.checkOfflineLoad(), 20000);
    this.interval3 = setInterval(() => this.checkInProcess(), 55000);
    this.interval4 = setInterval(() => this.checkLocationOn(), 5000);
    this.interval5 = setInterval(() => this.getCurrentPosition4(), 200000);

    _retrieveUserToken().then((token) => {
      this.setState({token:token});
    });
   
  }
  
  componentWillUnmount(){
    clearInterval(this.interval);
    clearInterval(this.interval2);
    clearInterval(this.interval3);
    clearInterval(this.interval4);
    clearInterval(this.interval5);
  }

  checkLocationOn () {
    this.getCurrentPosition3();
  }

    saveLocation1 = async (postdata) => {
      await saveLocation(postdata)
        .then((res) => {
          console.log(res);
        }).catch(error => {
            console.log(error);
        });
    }

    getCurrentPosition4() {
    if(!this.state.locationAlert) {
      Geolocation.getCurrentPosition(
    (position) => {
      this.setState({locationAlert:false});
      const currentLongitude = JSON.stringify(position.coords.longitude);
      const currentLatitude = JSON.stringify(position.coords.latitude);
      
      var postdata = { latitude: currentLatitude,longitude:currentLongitude };
      console.log(postdata);
      if(this.state.cLat == '' || this.state.cLat != currentLatitude) {
        this.setState({cLat:currentLatitude});
        console.log(this.state.cLat);
        this.saveLocation1(postdata);
      }
      
      
    },
    (error) => {
      
    },
    { enableHighAccuracy: true, timeout: 35000, maximumAge: 5000}
  );
    }
}




  getCurrentPosition3() {
  geolocation.getCurrentPosition(
    (position) => {
      this.setState({locationAlert:false});
    },
    (error) => {
      //console.log(error);
      if (error.code == 2) {
        this.setState({locationAlert:true,locationMsg:'Please On your location first then using the app'});
      } else if (error.code == 1) {
        this.setState({locationAlert:true,locationMsg:'Please allow location permission first then using the app'});
      } else {
        this.setState({locationAlert:false});
      }
    },
    { enableHighAccuracy: true, timeout: 2000,maximumAge: 7000 }
  );
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


  checkNet () {
    //console.log("hereeeee");
  NetInfo.fetch().then(state => {
    if(state.isConnected == false) {
      //_showErrorMessage('Offline');
      if(this.state.netInfo == 'Online') {
        _showErrorMessage('Now you are Offline');
      }
      this.setState({netInfo:'Offline'});
    } else {

      if(this.state.netInfo == 'Offline') {
        //this.checkOfflineLoad();
        _showSuccessMessage('Now you are Online');
      }
     //_showSuccessMessage('Online');
     this.setState({netInfo:'Online',netCheck:true});
  }
  })
}


checkRtw() {
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_rtw WHERE sync_status = 'offline' LIMIT 1",
        [],
        (tx, results) => {
          if(results.rows.length > 0){
            this.setState({dataProcess:true});
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            var res = results.rows.item(i);
            const formdata = new FormData();
          var barcod = res.barcode;
          var myArray = barcod.split(',');
          formdata.append('barcode', JSON.stringify(myArray));
          formdata.append('return_to_warehouse_id', res.w_id);
          formdata.append('return_to_warehouse_comment', res.comment);
          formdata.append('is_offline', 1);
          if(res.warehouse_pic != '' || res.warehouse_pic != null) {
            let uri = res.warehouse_pic;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('return_to_warehouse_pic', image);
          }
          if(res.type == 'delivery') {
          submitRtw(formdata).then((ress) => {
                db.transaction((tx) => {
            tx.executeSql(
              'UPDATE table_rtw set sync_status=? where id=?',
              ['online', res.id],
              (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('stops table update');
                  } else Alert.alert('Updation Failed 1');
                }
              );
          });
          });

      } else {
         submitPickupRtw(formdata).then((ress) => {
                db.transaction((tx) => {
            tx.executeSql(
              'UPDATE table_rtw set sync_status=? where id=?',
              ['online', res.id],
              (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('stops table update');
                  } else Alert.alert('Updation Failed 2');
                }
              );
          });
          });
      }
          }
        } else {
          this.setState({dataProcess:false});
        }
        }
      );
    });
}

checkRetailDrop() {
  console.log('enter in retail drop');
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_retaildrop WHERE sync_status = 'offline' LIMIT 1",
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
              var res = results.rows.item(i);
              const formdata = new FormData();

          var barcod = res.barcode;
          var myArray = barcod.split(',');
          formdata.append('barcode', JSON.stringify(myArray));
          formdata.append('id', res.rd_id);

          if(res.retail_drop_pic != '' || res.retail_drop_pic != null) {
            let uri = res.retail_drop_pic;
        let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
        let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('retail_drop_pic', image);
          }
          console.log("====save===to===phalann==");
          save_retail_drop(formdata).then((ress) => {
           // if(ress.type == 1) {
                db.transaction((tx) => {
            tx.executeSql(
              'UPDATE table_retaildrop set sync_status=? where id=?',
              ['online', res.id],
              (tx, results) => {
                console.log('Results', results.rowsAffected);
                if (results.rowsAffected > 0) {
                  console.log('stops table update');
                } else Alert.alert('Updation Failed 3');
              }
            );
        });
            // }
          });
        }
      });
    });
  }

updateProcessStatus (stop_id) {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE table_stops set process_status=? where stop_id=?',
      ['1', stop_id],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          console.log('process 1 table update xc');
        }
      }
    );
    });
}


updateProcessStatusUseBarocde (barcode) {
  console.log(barcode);
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE table_stops set process_status=? where barcode=?',
      ['1', barcode],
      (tx, results) => {
        console.log('Results', results.rowsAffected);
        if (results.rowsAffected > 0) {
          console.log('process 1 table update use barcode');
        }
      }
    );
    });
}

checkInProcess () {
  console.log("Come in check inprocess");
  db.transaction((tx) => {
      tx.executeSql(
        'UPDATE table_stops set process_status=? where process_status=?',
        [null, '1'],
        (tx, results) => {
          console.log('Results in process', results.rowsAffected);
          if (results.rowsAffected > 0) {
            console.log('inprocess table update');
          }
        }
      );
      });
}

checkOfflineLoad () {
 console.log("come offline loadddd ddd");
    const _this = this;
    if (fetching) return Promise.reject('Request in progress');
    console.log("==INN==");
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_stops WHERE sync_status = 'offline' AND process_status IS NULL LIMIT 1",
        [],
        (tx, results) => {
          console.log("table_loads="+results.rows.length);
          if(results.rows.length > 0){
            this.setState({dataProcess:true});
            console.log("enter in loads=");
            for (let i = 0; i < results.rows.length; ++i) {
              var res = results.rows.item(i);
              console.log('barr == '+res.barcode)
              console.log('lable == '+res.stop_id)
              console.log('ssttatus == '+res.delivery_status)

              // ======Save Load data=========
            if(res.stop_id == 0) {
              console.log("enter in Load");
              const formdata = new FormData();
              formdata.append('company_id', res.company_id);
              formdata.append('customer_name', res.customer_name);
              formdata.append('address', res.address);
              formdata.append('city', res.city);
              formdata.append('province', res.province);
              formdata.append('postal_code', res.postal_code);
              formdata.append('email_address', res.email_address);
              formdata.append('phone_number', res.phone_number);
              formdata.append('barcode', res.barcode);
              formdata.append('street_address', res.street_address);
              formdata.append('shipper_number', res.shipper_number);

              if(res.is_exception_case == 'yes'){
                formdata.append('is_exception_case', 'yes');
                let uri = res.exception_case_pics;
                if(uri) {
                  let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
                  let image = {
                    uri:  uri,
                    name: filename,
                    type: "image/png",
                  };
                formdata.append('exception_case_pics', image);
                }
              }  

                var d_status = 'active';
                var sync_statuss = 'online';
              if(res.delivery_status == 'not-delivered' || res.delivery_status == 'delivered') {
          d_status = res.delivery_status;
          sync_statuss = 'offline';
        }

                if (fetching) return Promise.reject('Request in progress');
                fetching = true;
                this.updateProcessStatusUseBarocde(res.barcode);
                return _retrieveUserToken().then((token) => {
                return fetch(config.API_URL+'scanparcel',{
                                    method: 'POST',
                                    headers: {
                                        'Authorization': 'Bearer ' + token,
                                        'Accept': 'application/json',
                                        'Content-Type': 'multipart/form-data'
                                    },
                                    body: formdata
                                  })
                  .then(response => Promise.all([response.json()]))
                  .then(([resss]) => {
                    console.log(resss);
                    console.log("Lost");
                  if(resss.type == 1) {
                   db.transaction((tx) => {
                    tx.executeSql(
                      'UPDATE table_stops set sync_status=?,customer_address=?,delivery_status=?,stop_id=?,address=? where id=?',
                      [sync_statuss, resss.data.full_address,d_status,resss.data.stop_id,res.street_address,res.id],
                      (tx, results) => {
                        console.log('Results ayyy', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          console.log('stops table update');
                          _this.setState({loadProcess:0});
                        } else Alert.alert('Updation Failed 4');
                      }
                    );
                  });
                } else {
                  _showErrorMessage('Parcel'+res.barcode+' is '+resss.message);
                     db.transaction((tx) => {
                    tx.executeSql(
                      'UPDATE table_stops set sync_status=? where id=?',
                      ['invalid', res.id],
                      (tx, results) => {
                        console.log('Results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          console.log('stops table update');
                          _this.setState({loadProcess:0});
                        } else Alert.alert('Updation Failed 5');
                      }
                    );
                  });
                }

      fetching = false;
      
    })
    .catch(err => {
      console.log("error catch search:", err.message);
      fetching = false;
      // Choose one, depends what you need.
      //return false; // If you want to ignore the error and do something in a chained .then()
      //return Promise.reject(err); // If you want to handle the error in a chained .catch()
    });
    });
            } 
            // ======End Save Load data=========
            // ======Check Update address call=====
            if(res.apt_number != null || res.apt_number == '') {

              console.log("Enter in update address");
              var postdata = { street_address:res.street_address, postal_code:res.postal_code,province:res.province,
  city:res.city,stop_id:res.stop_id,apt_number:res.apt_number};
          var dd_status = 'active';
                var syncc_statuss = 'online';
        if(res.delivery_status == 'not-delivered' || res.delivery_status == 'delivered') {
          dd_status = res.delivery_status;
          syncc_statuss = 'offline';
        }
        
        updateDeliveryAddress(postdata).then((ress) => {
          console.log(ress);
          // if(ress.type == 1) {
            db.transaction((tx) => {
                    tx.executeSql(
                      'UPDATE table_stops set sync_status=?,delivery_status=?,street_address=?,customer_address=? where id=?',
                      [syncc_statuss,dd_status,ress.street_address,ress.full_address,res.id],
                      (tx, results) => {
                        if (results.rowsAffected > 0) {
                          console.log('stops table update for stop address');
                        } else Alert.alert('Updation Failed 6');
                      }
                    );
                  });
          // }
        
        }); 

            }
            // ======END======Check Update address call=====
            // =========Satrt deliverd or not deliverd========

             if(res.delivery_status == 'not-delivered') {
              console.log("enter in Not deliverd");
                  const formdata = new FormData();
                  var temp = [];
                  temp.push(res.barcode);
                  formdata.append('comment', res.comment);
                  formdata.append('barcode', JSON.stringify(temp));
                  formdata.append('reason_id', res.reason_id);
                  formdata.append('gps_long', res.gps_long);
                  formdata.append('gps_lat', res.gps_lat);
                  formdata.append('is_offline', 1);
                  if(res.door_knocker_pic != '' && res.door_knocker_pic != null) {
                   
                    let uri = res.door_knocker_pic;
                let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
                let image = {
                    uri:  uri,
                    name: filename,
                    type: "image/png",
                  };
                formdata.append('door_knocker_pic', image);
                formdata.append('door_knocker_barcode', res.door_knocker_barcode);
                  }
                  console.log("====save===to===phalann==");

                  if (fetching) return Promise.reject('Request in progress');
                    fetching = true;
                    this.updateProcessStatus(res.stop_id);
                    return _retrieveUserToken().then((token) => {
                    return fetch(config.API_URL+'not_delivered',{
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    },
                    body: formdata
                  })
                    .then(response => Promise.all([response.json()]))
                    .then(([ress]) => {
                   if(ress.type == 1) {
                      db.transaction((tx) => {
                  tx.executeSql(
                    'UPDATE table_stops set sync_status=? where stop_id=?',
                    ['online', res.stop_id],
                    (tx, results) => {
                      console.log('Results', results.rowsAffected);
                      if (results.rowsAffected > 0) {
                        console.log('stops table update');
                      } else Alert.alert('Updation Failed 7');
                    }
                  );
                  });
                  } else {
                  db.transaction((tx) => {
                  tx.executeSql(
                    'UPDATE table_stops set sync_status=? where stop_id=?',
                    ['online', res.stop_id],
                    (tx, results) => {
                      console.log('Results', results.rowsAffected);
                      if (results.rowsAffected > 0) {
                        console.log('stops table update');
                      } else Alert.alert('Updation Failed 8');
                    }
                    );
                  });
                  }

                  fetching = false;

                  })
                  .catch(err => {
                  console.log("error catch search:", err.message);
                  fetching = false;
                  // Choose one, depends what you need.
                  //return false; // If you want to ignore the error and do something in a chained .then()
                  //return Promise.reject(err); // If you want to handle the error in a chained .catch()
                  });
                  });
                } else if (res.delivery_status == 'delivered') {
                    console.log("enter in deliverd="+res.stop_id);
                  const formdata = new FormData();
                    var temp = [];
                    temp.push(res.barcode);
                    formdata.append('barcode', JSON.stringify(temp));
                  formdata.append('sign_by', res.sign_by);
                  if(res.signature_img != null){
                    formdata.append('signature_img', res.signature_img);
                  }

                  formdata.append('description', res.comment);
                  formdata.append('reason_id', res.reason_id);
                  formdata.append('gps_long', res.gps_long);
                  formdata.append('gps_lat', res.gps_lat);
                  formdata.append('stop_id', res.stop_id);
                  formdata.append('left_with_person_name', res.person_name);
                  formdata.append('is_offline', 1);


                  let uri = res.place_img;
                  let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
                  let image = {
                      uri:  uri,
                      name: filename,
                      type: "image/png",
                  };
                  formdata.append('place_img', image);


                   if(res.building_img != '' && res.building_img != null) {
                      let uri2 = res.building_img;
                      let filename = uri2.substring(uri2.lastIndexOf('/') + 1, uri2.length)
                        let image = {
                          uri:  uri2,
                          name: filename,
                          type: "image/png",
                        };
                      formdata.append('building_img', image);
                    }

                    if(res.pod_photo_3 != '' && res.pod_photo_3 != null) {
                      let uri2 = res.pod_photo_3;
                      let filename = uri2.substring(uri2.lastIndexOf('/') + 1, uri2.length)
                        let image = {
                          uri:  uri2,
                          name: filename,
                          type: "image/png",
                        };
                      formdata.append('pod_photo_3', image);
                    }

                     if(res.pod_photo_4 != '' && res.pod_photo_4 != null) {
                      let uri2 = res.pod_photo_3;
                      let filename = uri2.substring(uri2.lastIndexOf('/') + 1, uri2.length)
                        let image = {
                          uri:  uri2,
                          name: filename,
                          type: "image/png",
                        };
                      formdata.append('pod_photo_4', image);
                    }

                       if(res.pod_photo_5 != '' && res.pod_photo_5 != null) {
                      let uri2 = res.pod_photo_3;
                      let filename = uri2.substring(uri2.lastIndexOf('/') + 1, uri2.length)
                        let image = {
                          uri:  uri2,
                          name: filename,
                          type: "image/png",
                        };
                      formdata.append('pod_photo_5', image);
                    }

                    if (fetching) return Promise.reject('Request in progress');
                      fetching = true;
                      this.updateProcessStatus(res.stop_id);
                      saveDeliveryData2(formdata).then((ress) => {
                        console.log(ress);
                         if(ress.type == 1) {
                          db.transaction((tx) => {
                      tx.executeSql(
                        'UPDATE table_stops set sync_status=? where stop_id=?',
                        ['online', res.stop_id],
                        (tx, results) => {
                          console.log('Results', results.rowsAffected);
                          if (results.rowsAffected > 0) {
                            console.log('stops table update');
                          }
                        }
                      );
                  });
                      } else {

                        console.log("enter in else parttt");
                  //         db.transaction((tx) => {
                  //     tx.executeSql(
                  //       'UPDATE table_stops set sync_status=? where stop_id=?',
                  //       ['online', res.stop_id],
                  //       (tx, results) => {
                  //         console.log('Results', results.rowsAffected);
                  //         if (results.rowsAffected > 0) {
                  //           console.log('stops table update');
                  //         }
                  //       }
                  //     );
                  // });
                      }

                    fetching = false;
                    
                  })
                  .catch(err => {
                    console.log(err);
                    console.log("error catch search:", err.message);
                    fetching = false;
                    // Choose one, depends what you need.
                    //return false; // If you want to ignore the error and do something in a chained .then()
                    //return Promise.reject(err); // If you want to handle the error in a chained .catch()
                  });

                }

            // =======END deliverd or not deliverd =========    
              
          }


          } else {
            console.log("out");
            this.setState({dataProcess:false});

            db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_stops WHERE sync_status = 'offline'",
        [],
        (tx, results) => {
          console.log("table_loads="+results.rows.length);
          if(results.rows.length == 0){
               this.checkRetailDrop();
               this.checkOfflinePickups();
               this.checkSettlement();
               this.checkInspection();
          }
        }

          );
    });


           
          }

        },
        (error) => {
                console.log("Load error");
                console.log(error);
            }
      );
    });
   
}


checkSettlement() {
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_settlement WHERE sync_status = 'offline'",
        [],
        (tx, results) => {
          var temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            var res = results.rows.item(i);
            const formdata = new FormData();
          var barcod = res.barcode;
          var myArray = barcod.split(',');
          formdata.append('barcode', JSON.stringify(myArray));
          formdata.append('released_to', res.released_to);
          formdata.append('description', res.description);

          if(res.settlement_pic != '' || res.settlement_pic != null) {
            let uri = res.settlement_pic;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('settlement_pic', image);
          }
          submitSettlement(formdata).then((ress) => {
           
                db.transaction((tx) => {
            tx.executeSql(
              'UPDATE table_settlement set sync_status=? where id=?',
              ['online', res.id],
              (tx, results) => {
                  if (results.rowsAffected > 0) {
                  } else Alert.alert('Updation Failed 9');
                },(error) => {
                        console.log(error);
                    }
              );
          });
          });
          }
        }
      );
    });
}


checkInspection() {
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_inspection WHERE sync_status = 'offline'",
        [],
        (tx, results) => {
          var temp = [];
          if(results.rows.length > 0){
            console.log(results.rows.length);
            var res = results.rows.item(0);
            const formdata = new FormData();
          formdata.append('garbage', res.garbage);
          formdata.append('cleaning', res.cleaning);
          formdata.append('accessories', res.accessories);
          formdata.append('fuel_tank', res.fuel_tank);
          formdata.append('oil_change', res.oil_change);
          formdata.append('tire_pressure', res.tire_pressure);
          formdata.append('no_evidence_flood_damage', res.no_evidence_flood_damage);
          formdata.append('body_panel_inspection', res.body_panel_inspection);
          formdata.append('bumper_fascia_inspection', res.bumper_fascia_inspection);
          formdata.append('doors_hood_roof_inspection', res.doors_hood_roof_inspection);
          formdata.append('doors_hood_alignment', res.doors_hood_alignment);
          formdata.append('power_sliding_door_operation', res.power);
          formdata.append('windshield_side_rear_window_glass_inspection', res.windshield);
          formdata.append('exterior_lights_back_side_front', res.exterior);
          formdata.append('wiper_blade_inspection', res.wiper_blade_inspection);
          formdata.append('brakes', res.brakes);
          formdata.append('fuel_in_liters', res.fuel_in_liters);
          formdata.append('fuel_cost', res.fuel_cost);
          formdata.append('odometer_reading', res.odometer_reading);

          
          if(res.right_image != '' && res.right_image != null) {
            let uri = res.right_image;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('right_image', image);
          }

          

           if(res.left_image != '' && res.left_image != null) {
            let uri = res.left_image;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('left_image', image);
          }

          

        if(res.front_image != '' && res.front_image != null) {
            let uri = res.front_image;
            let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
            let image = {
            uri:  uri,
            name: filename,
            type: "image/png",
          };
        formdata.append('front_image', image);
          }

          

          if(res.rare_image != '' && res.rare_image != null) {
              let uri = res.rare_image;
              let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
              let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
            formdata.append('rare_image', image);
          }


          

           if(res.odometer_pic != '' && res.odometer_pic != null) {
              let uri = res.odometer_pic;
              let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
              let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
            formdata.append('odometer_pic', image);
          }

           if(res.fuel_receipt_pic != '' && res.fuel_receipt_pic != null) {
              let uri = res.fuel_receipt_pic;
              let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
              let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
            formdata.append('fuel_receipt_pic', image);
          }


          

          if(res.inside_back != '' && res.inside_back != null) {
              let uri = res.inside_back;
              let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
              let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
            formdata.append('inside_back_view_photo', image);
          }

          

          if(res.inside_front != '' && res.inside_front != null) {
              let uri = res.inside_front;
              let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
              let image = {
              uri:  uri,
              name: filename,
              type: "image/png",
            };
            formdata.append('inside_front_view_photo', image);
          }
          console.log(formdata);

          if(res.type == 'start') {
            console.log(formdata);
          saveVehicleInspection(formdata).then((ress) => {
            console.log(ress);
                db.transaction((tx) => {
                  tx.executeSql(
                    'UPDATE table_inspection set sync_status=? where id=?',
                    ['online', res.id],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                          console.log("inspection sented")
                        } else Alert.alert('Updation Failed 10');
                      },(error) => {
                              console.log(error);
                          }
                    );
                });
          });
          } else {
            saveVehicleEnddayInspection(formdata).then((ress) => {
            console.log(ress);
                db.transaction((tx) => {
                  tx.executeSql(
                    'UPDATE table_inspection set sync_status=? where id=?',
                    ['online', res.id],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                          console.log("inspection sented")
                        } else Alert.alert('Updation Failed 11');
                      },(error) => {
                              console.log(error);
                          }
                    );
                });
          });
          }
          }
        }
      );
    });
}

checkOfflinePickups () {
    const _this = this;
    if (fetching) return Promise.reject('Request in progress');
  db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM table_pickups WHERE sync_status = 'offline' LIMIT 1",
        [],
        (tx, results) => {
          console.log('pp=='+results.rows.length);
          if(results.rows.length > 0) {
            this.setState({dataProcess:true});
            for (let i = 0; i < results.rows.length; ++i) {
              var res = results.rows.item(i);
              var postdata = { warehouse_id:res.warehouse_id,company_id:res.company_id, customer_name:res.customer_name,address:res.address,
               city:res.city,province:res.province,postal_code:res.postal_code,
               barcode: res.barcode, street_address:res.street_addresss };
               console.log(postdata);
               if (fetching) return Promise.reject('Request in progress');
                fetching = true;
                return _retrieveUserToken().then((token) => {
                return fetch(config.API_URL+'save_pickup_load',{
                    method: 'POST',
                    headers: {
                          'Authorization': 'Bearer ' + token,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                      },
                      body:  JSON.stringify(postdata)
                    })
                  .then(response => Promise.all([response.json()]))
                  .then(([resss]) => {
                    console.log(resss);
                  if(resss.type == 1) {
                   db.transaction((tx) => {
                    tx.executeSql(
                      'UPDATE table_pickups set sync_status=? where id=?',
                      ['online',res.id],
                      (tx, results) => {
                        console.log('Results ayyy', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          console.log('stops table update');
                          _this.setState({loadProcess:0});
                        } else Alert.alert('Updation Failed 12');
                      }
                    );
                  });
                } else {
                  _showErrorMessage(resss.message);
                     db.transaction((tx) => {
                    tx.executeSql(
                      'UPDATE table_pickups set sync_status=? where id=?',
                      ['online',res.id],
                      (tx, results) => {
                        console.log('Results', results.rowsAffected);
                        if (results.rowsAffected > 0) {
                          console.log('stops table update');
                          _this.setState({loadProcess:0});
                        } else Alert.alert('Updation Failed 13');
                      }
                    );
                  });
                }
                  fetching = false
                })
                .catch(err => {
                  console.log("error catch search:", err.message);
                  console.log(err);
                  fetching = false;
                });
              });
              
            }
          } else {
            this.checkRtw();
          }
        },(error) => {
                        this.checkRtw();
                    })
      })
}  
  
  render() {
    return (
      
       <Provider store={store}>
       <Modal animationType="slide" transparent={true} visible={this.state.locationAlert}>
         <View style={{justifyContent: "center",alignItems: "center",marginTop: 200}}>
          <View style={{width:'98%',
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
    borderColor:'red'}}>
            <View style={{alignSelf:'center',padding:5}}>
            <Text style={{fontSize:24, fontWeight:'bold',textAlign:'center',color:'red'}}>LOCATION ALERT</Text>
            </View>
            
            
            <View style={{ flexDirection: 'row',alignItems:'center'}}>
              <Text style={{fontStyle:'italic',fontSize: 16,fontWeight:'bold',marginTop:4,flexWrap: 'wrap',flex: 1,alignSelf:'center',textAlign:'center' }}>{this.state.locationMsg}</Text>
            </View>
             <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent:'center',marginTop:15}}>
              </View>
          </View>
        </View>
      </Modal>
       { (this.state.netInfo == "Offline") ? (<View style={{marginTop: (Platform.OS == 'ios') ? 35:0, alignItems:'center',textAlign:'center',justifyContent: 'center',backgroundColor:'red'}}>
    <Text style={{fontWeight:'bold',alignSelf:'center',color:'white'}}>{this.state.netInfo}</Text>
    </View>):null}
    { (this.state.netInfo == "Online" && this.state.dataProcess) ? (<View style={{marginTop: (Platform.OS == 'ios') ? 35:0,alignItems:'center',textAlign:'center',justifyContent: 'center',backgroundColor:'green'}}>
    <Text style={{fontWeight:'bold',alignSelf:'center',color:'white'}}>Please Wait.. Local Data is saving..</Text>
    </View>):null}
      <NavigationContainer>
        <Root>
          <AppScreens />
        </Root>
      </NavigationContainer>
       </Provider>
    );
  }
}
export default App;