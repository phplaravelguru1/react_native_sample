import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert,TextInput} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_storeData,_retrieveData } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import { requestByTarget, saveVehicleInspection,getUser,getDataAwsRecog } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';

import { StackActions } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

import NetInfo from "@react-native-community/netinfo";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });

class Inspection extends Component {
constructor(props) { 
    super(props);

    db.transaction(function (txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='table_inspection'",
        [],
        function (tx, res) {
          console.log('itemeee:', res.rows.length);
          if (res.rows.length == 0) {
            txn.executeSql('DROP TABLE IF EXISTS table_inspection', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS table_inspection(id INTEGER PRIMARY KEY AUTOINCREMENT, sync_status VARCHAR(20), garbage VARCHAR(20),cleaning VARCHAR(20),accessories VARCHAR(20),fuel_tank VARCHAR(20),oil_change VARCHAR(20),tire_pressure VARCHAR(20),no_evidence_flood_damage VARCHAR(20),body_panel_inspection VARCHAR(20),bumper_fascia_inspection VARCHAR(20),doors_hood_roof_inspection VARCHAR(20),doors_hood_alignment VARCHAR(20),power VARCHAR(20),windshield VARCHAR(20),exterior VARCHAR(20),wiper_blade_inspection VARCHAR(20),brakes VARCHAR(20), right_image VARCHAR(255),rare_image VARCHAR(255),left_image VARCHAR(255),front_image VARCHAR(255),odometer_pic VARCHAR(255),fuel_receipt_pic VARCHAR(255),odometer_reading VARCHAR(10),fuel_in_liters VARCHAR(10),fuel_cost VARCHAR(10),inside_front VARCHAR(255),inside_back VARCHAR(255),type VARCHAR(10))',
              []
            );
          }
        }
      );
    });

    this.state = {
      showContent: false,
      checked: false,
      setChecked: false,
      image:'', 
      isloading: false, 
      otherData: [],
      garbage:'',
      cleaning: '',
      accessories: '',
      fuel_tank: '',
      oil_change: '',
      tire_pressure: '',
      brakes: '',
      no_evidence_flood_damage : false,
      body_panel_inspection : false,
      bumper_fascia_inspection : false,
      doors_hood_roof_inspection : false,
      doors_hood_alignment : false,
      power_sliding_door_operation : false,
      windshield_side_rear_window_glass_inspection : false,
      wiper_blade_inspection : false,
      showDoorBlock:true,
      showBumpersBlock:true,
      showGlassBlock:true,
      showExteriorBlock:true,
      driverName:'',
      front_image: false,
      rare_image: false,
      left_image: false,
      right_image: false,
      
      textimages:['right_image','rare_image','left_image','front_image'],
      showExteriorBlockError:false,
      showDoorBlockError:false,
      showBumpersBlockError:false,
      showGlassBlockError:false,
      location:'',
      exterior_lights_back_side_front : false,
      user_avtar:'',
      showMainBlockError:false,
      date:'',
      vehicle_number:'',
      odometer_pic: false,
      fuel_receipt_pic: false,
      odometer_reading: '',
      fuel_in_liters: '',
      fuel_cost: '',
      inside_front: false,
      inside_back: false,
      notes:null,
      garbage_pic:null,
      cleaning_pic:null,
      major_damage_pic:null,
      garbage_comment:null,
      cleaning_comment:null,
      damage_comment:null,
      imageScanAttempt:0,
      is_photo_btn:true
    };

    
  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }

  clearData = () => {
    Alert.alert(
            "Continue",
            "Are you sure reset inspection data?",
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Yes", onPress: () => {
                  
                  this.setState({
                    otherData: [],
                          garbage:'',
                          cleaning: '',
                          accessories: '',
                          fuel_tank: '',
                          oil_change: '',
                          tire_pressure: '',
                          brakes: '',
                          no_evidence_flood_damage : false,
                          body_panel_inspection : false,
                          bumper_fascia_inspection : false,
                          doors_hood_roof_inspection : false,
                          doors_hood_alignment : false,
                          power_sliding_door_operation : false,
                          windshield_side_rear_window_glass_inspection : false,
                          wiper_blade_inspection : false,
                          showDoorBlock:true,
                          showBumpersBlock:true,
                          showGlassBlock:true,
                          showExteriorBlock:true,
                          driverName:'',
                          front_image: false,
                          rare_image: false,
                          left_image: false,
                          right_image: false,
                          textimages:['right_image','rare_image','left_image','front_image'],
                          showExteriorBlockError:false,
                          showDoorBlockError:false,
                          showBumpersBlockError:false,
                          showGlassBlockError:false,
                          location:'',
                          exterior_lights_back_side_front : false,
                          user_avtar:'',
                          showMainBlockError:false,
                          date:'',
                          vehicle_number:'',
                          odometer_pic: false,
                          fuel_receipt_pic: false,
                          odometer_reading: '',
                          fuel_in_liters: '',
                          fuel_cost: '',
                  })
                    
                  } 
              }
            ],
            { cancelable: false }
          );
  }

  setChecked(_state,val) {

    if(this.state[_state] != val){
      this.setState({
        [_state]: val,
      });
    if(_state == 'garbage' || _state == 'cleaning' || _state == 'accessories' || _state == 'fuel_tank' || _state == 'oil_change' || _state == 'tire_pressure')
      {
          this.setState({showMainBlockError:false});
     } 

    if(_state == 'no_evidence_flood_damage' || _state == 'body_panel_inspection' || _state == 'bumper_fascia_inspection')
      {
          this.setState({showBumpersBlockError:false});
     }     

     if(_state == 'exterior_lights_back_side_front'){
          this.setState({showExteriorBlockError:false});
      }

  

    if(_state == 'power_sliding_door_operation' || _state == 'doors_hood_alignment' || _state == 'doors_hood_alignment'){
      this.setState({showDoorBlockError:false});
    }


    if(_state == 'wiper_blade_inspection' || _state == 'windshield_side_rear_window_glass_inspection'){
          this.setState({showGlassBlockError:false});
     }

   } else {
      this.setState({
        [_state]: '',
      });
    }
  }
onChangedReading(text){

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
      this.setState({ odometer_reading: newText });
    }
  
  
}
onChangedLitter(text){
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
      this.setState({ fuel_in_liters: newText });
    }
}
onChangedCost(text){
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
      this.setState({ fuel_cost: newText });
    }
}
    componentDidMount = () => {

      getUser()
          .then((res) => {
            this.setState({
              driverName: res.first_name+' '+res.last_name,
              date: res.date,
            });
        }); 

           _retrieveData('user_avtar')
        .then((res) => {
          if(res != null){
            this.setState({user_avtar:res});
          }
        });

      if(this.props?.route?.params?.vehicleInfo?.vehicle_number != '' && this.props?.route?.params?.vehicleInfo?.vehicle_number != undefined){

        _storeData('vehicle_plate_number', this.props?.route?.params?.vehicleInfo?.vehicle_number).then();
      } else {
       
        _retrieveData('vehicle_plate_number')
            .then((res) => {
              if(res){
                this.setState({
                  vehicle_number: res
                });
              }
            });
      }
      
  };
  openImagePicker = (_state) => {
      const _this = this;
      if(this.state.is_photo_btn) {
        _this.setState({ is_photo_btn: false }, () => {
            setTimeout(() => {
              const options = {
                title: 'VEHICLE PHOTO',
                mediaType: 'photo',
                maxWidth:300,
                maxHeight:300
              };
                ImagePicker.launchCamera(options, response => {
                  if (response.uri) {
                    _this.setState({ [_state]: response.uri});
                  }
                  _this.setState({is_photo_btn:true});
                });
          }, 400);
        });
      }
  };


openImagePicker1 = (_state) => {
   const _this = this;
  if(this.state.is_photo_btn) {
    _this.setState({ is_photo_btn: false }, () => {
        setTimeout(() => {
          const options = {
            title: 'VEHICLE PHOTO',
            mediaType: 'photo',
            maxWidth:300,
            maxHeight:300
          };
          ImagePicker.launchCamera(options, response => {
            if (response.uri) {
            _this.getDataAwsRecogApi(response.uri,_state);
            }
            _this.setState({is_photo_btn:true});
          });
      }, 400);
    });
  }
};

  getDataAwsRecogApi = (uri,_state) => {
    const _this = this;
    const formdata = new FormData();
        formdata.append('pic_type', 'vehicle');
        formdata.append('car_type', _state);
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
        this.setState({ [_state]: uri,isloading:false});
        _showSuccessMessage(res.message);
      } else {
        this.setState({ [_state]: null,isloading:false});
        _showErrorMessage(res.message);
      }
         }).catch(error => {
       if(error.message == 'timeout' && this.state.imageScanAttempt == 0) {
          this.setState({imageScanAttempt:1,isloading:false});
          _showErrorMessage('Request timeout please try again');
          return false;
        } else if(error.message == 'timeout' && this.state.imageScanAttempt == 1) {
          this.setState({ [_state]: uri,isloading:false});
        } else {
          this.setState({isloading:false});
          _showErrorMessage(error.message);
        }
    });

  };

takePhotoOdometer = () => {
  const options = {
    title: 'PLACE PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  ImagePicker.launchCamera(options, response => {
    if (response.uri) {
    
      this.setState({ odometer_pic: response.uri});
    }

  });
}
takePhotoFuel = () => {
  const options = {
    title: 'PLACE PHOTO',
    mediaType: 'photo',
    maxWidth:500,
    maxHeight:500
  };
  ImagePicker.launchCamera(options, response => {
    if (response.uri) {
    
      this.setState({ fuel_receipt_pic: response.uri});
    }

  });
}



      saveData = () => {
        
        const formdata = new FormData();
        const _this = this;
        
        formdata.append('garbage', this.state.garbage);
        formdata.append('cleaning', this.state.cleaning);
        formdata.append('accessories', this.state.accessories);
        formdata.append('fuel_tank', this.state.fuel_tank);
        formdata.append('oil_change', this.state.oil_change);
        formdata.append('tire_pressure', this.state.tire_pressure);
        formdata.append('no_evidence_flood_damage', this.state.no_evidence_flood_damage);
        formdata.append('body_panel_inspection', this.state.body_panel_inspection);
        formdata.append('bumper_fascia_inspection', this.state.bumper_fascia_inspection);
        formdata.append('doors_hood_roof_inspection', this.state.doors_hood_roof_inspection);
        formdata.append('doors_hood_alignment', this.state.doors_hood_alignment);
        formdata.append('power_sliding_door_operation', this.state.power_sliding_door_operation);
        formdata.append('windshield_side_rear_window_glass_inspection', this.state.windshield_side_rear_window_glass_inspection);
        formdata.append('exterior_lights_back_side_front', this.state.exterior_lights_back_side_front);
        formdata.append('wiper_blade_inspection', this.state.wiper_blade_inspection);
        formdata.append('brakes', this.state.brakes);
        formdata.append('fuel_in_liters', this.state.fuel_in_liters);
        formdata.append('fuel_cost', this.state.fuel_cost);
        formdata.append('notes', this.state.notes);
        
        

        //console.log("==op==");
        let error = 0;

        if(!this.state.garbage || !this.state.cleaning || !this.state.accessories || !this.state.fuel_tank || !this.state.oil_change || !this.state.tire_pressure){
        this.setState({showMainBlockError:true});
        error = 1;
            } else {
                this.setState({showMainBlockError:false});
            }

        if(!this.state.garbage){
            _showErrorMessage('Garbage field is required');
            return false;
        }

        if(this.state.garbage == 'yes') {
          if(this.state.garbage_comment == null || this.state.garbage_comment == '') {
            _showErrorMessage('Garbage comment is required');
            return false;
          }

        if(this.state.garbage_comment != null && this.state.garbage_comment.length < 30){
          _showErrorMessage('Minimum 30 characters required in garbage comment field. Please enter valid comment');
          return false;
        }

        formdata.append('garbage_comment', this.state.garbage_comment);
        
          let uri44 = this.state.garbage_pic;
            if(uri44) {
              let filename = uri44.substring(uri44.lastIndexOf('/') + 1, uri44.length)
              let image = {
                uri:  uri44,
                name: filename,
                type: "image/png",
              };
              console.log(image);
            formdata.append('garbage_pic', image);
            } else {
                _showErrorMessage('Garbage Photo is required');
                return false;
            } 
        }

         if(!this.state.cleaning){
            _showErrorMessage('Cleaning field is required');
            return false;
        }

        if(this.state.cleaning == 'no') {
          if(this.state.cleaning_comment == null || this.state.cleaning_comment == '') {
            _showErrorMessage('Cleaning comment is required');
            return false;
          }

          if(this.state.cleaning_comment != null && this.state.cleaning_comment.length < 30){
            _showErrorMessage('Minimum 30 characters required in cleaning comment field. Please enter valid comment');
            return false;
          }

          formdata.append('cleaning_comment', this.state.cleaning_comment);
        
          let uri55 = this.state.cleaning_pic;
            if(uri55) {
              let filename = uri55.substring(uri55.lastIndexOf('/') + 1, uri55.length)
              let image = {
                uri:  uri55,
                name: filename,
                type: "image/png",
              };
              console.log(image);
            formdata.append('cleaning_pic', image);
            } else {
                _showErrorMessage('Cleaning Photo is required');
                return false;
            }
        }

        if(!this.state.accessories){
            _showErrorMessage('Accessories field is required');
            return false;
        }

         if(!this.state.fuel_tank){
            _showErrorMessage('Fuel tank field is required');
            return false;
        }

        if(!this.state.oil_change){
            _showErrorMessage('Oil Change field is required');
            return false;
        }

        if(!this.state.tire_pressure){
            _showErrorMessage('Tire pressure field is required');
            return false;
        }

        if(!this.state.brakes){
            _showErrorMessage('Brakes field is required');
            return false;
        } 

         if(!this.state.no_evidence_flood_damage || !this.state.body_panel_inspection || !this.state.bumper_fascia_inspection){
          this.setState({showBumpersBlockError:true});
          error = 1;
          _showErrorMessage('All field of Body Panels is required');
          return false;
        } else {
          this.setState({showBumpersBlockError:false});
        }

          if(this.state.no_evidence_flood_damage == 'yes') {
            if(this.state.damage_comment == null || this.state.damage_comment == '') {
              _showErrorMessage('Major Damage comment is required');
              return false;
            }

            if(this.state.damage_comment != null && this.state.damage_comment.length < 30){
              _showErrorMessage('Minimum 40 characters required in major damage comment field. Please enter valid comment');
              return false;
            }

            formdata.append('damage_comment', this.state.damage_comment);
            let uri66 = this.state.major_damage_pic;
              if(uri66) {
                let filename = uri66.substring(uri66.lastIndexOf('/') + 1, uri66.length)
                let image = {
                  uri:  uri66,
                  name: filename,
                  type: "image/png",
                };
                console.log(image);
              formdata.append('major_damage_pic', image);
              } else {
                  _showErrorMessage('Major Damage Photo is required');
                  return false;
              }
          }

       

        if(!this.state.power_sliding_door_operation || !this.state.doors_hood_alignment || !this.state.doors_hood_roof_inspection){
          this.setState({showDoorBlockError:true});
          error = 1;
          _showErrorMessage('All field of Doors and Hood is required');
          return false;
        } else {
          this.setState({showDoorBlockError:false});
        }

      if(!this.state.wiper_blade_inspection || !this.state.windshield_side_rear_window_glass_inspection){
          this.setState({showGlassBlockError:true});
          _showErrorMessage('All field of Glass and Mirrors is required');
          return false;
          error = 1;
        } else {
          this.setState({showGlassBlockError:false});
        }


        if(!this.state.exterior_lights_back_side_front){
          this.setState({showExteriorBlockError:true});
          _showErrorMessage('Exterior Light field is required');
          return false;
          error = 1;
          
        } else {
          this.setState({showExteriorBlockError:false});
        }

        if(error == 1){
          //_showErrorMessage('All field is required');
          return false;
        }


        let uri1 = this.state.odometer_pic;
        if(uri1) {
          let filename = uri1.substring(uri1.lastIndexOf('/') + 1, uri1.length)
          let image = {
            uri:  uri1,
            name: filename,
            type: "image/png",
          }; 
         
        formdata.append('odometer_pic', image);
        } else {
          _showErrorMessage('Odometer Photo is required');
          return false;
        }

        if(!this.state.odometer_reading){
            _showErrorMessage('Odometer reading field is required');
            return false;
        }

        formdata.append('odometer_reading', this.state.odometer_reading);

        // if(this.state.fuel_in_liters == 0){
        //     _showErrorMessage('Please enter value greater than 0');
        //     return false;
        // }

        let uri2 = this.state.fuel_receipt_pic;
        if(uri2) {
          let filename = uri2.substring(uri2.lastIndexOf('/') + 1, uri2.length)
          let image = {
            uri:  uri2,
            name: filename,
            type: "image/png",
          };
          console.log(image);
        formdata.append('fuel_receipt_pic', image);
        }




       
        let picError = 0;
         this.state.textimages.map((_state,k) => {
              let uri = this.state[_state];
              if(uri) {
                let filename = uri.substring(uri.lastIndexOf('/') + 1, uri.length)
                let image = {
                  uri:  uri,
                  name: filename,
                  type: "image/png",
                };
              formdata.append(_state, image);

              } else {
                picError = 1;
                let v = _state.replace(/_\s?/g, " ");
                let l = v.replace('image', "photo");
                let n = l.charAt(0).toUpperCase() + l.slice(1);
                _showErrorMessage(n+' field is requried');
                
              }
              
            });

            let uri3 = this.state.inside_front;
            if(uri3) {
              let filename = uri3.substring(uri3.lastIndexOf('/') + 1, uri2.length)
              let image = {
                uri:  uri3,
                name: filename,
                type: "image/png",
              };
              console.log(image);
            formdata.append('inside_front_view_photo', image);
            } else {
                picError = 1;
                _showErrorMessage('Inside front view photo is requried');
            }

            let uri4 = this.state.inside_back;
            if(uri4) {
              let filename = uri4.substring(uri4.lastIndexOf('/') + 1, uri2.length)
              let image = {
                uri:  uri4,
                name: filename,
                type: "image/png",
              };
              console.log(image);
            formdata.append('inside_back_view_photo', image);
            } else {
                picError = 1;
                _showErrorMessage('Inside back view photo is requried');
            }

         if(picError == 1){
            return false;
         }

         if(this.state.notes != null && this.state.notes.length < 25){
          _showErrorMessage('Minimum 25 characters required in notes field. Please enter valid notes');
          return false;
        }



         this.setState({
          isloading: true,
        });

    saveVehicleInspection(formdata)
      .then((res) => {
        this.setState({
          isloading: false,
        });
        console.log(res);
        
          if(res.type == 1){
            _storeData('HomeSecreen','Company').then();
            _showSuccessMessage(res.message);
            _storeData('vehicle_plate_number', this.props?.route?.params?.vehicleInfo?.vehicle_number).then();
            setTimeout(function(){
                _this.props.navigation.navigate('Company')
            }, 1000);
          } else {
            _showErrorMessage(res.message);
          
          }
      }).catch(error => {
          this.setState({isloading:false});
          if(error.message == 'Network request failed1') {
            db.transaction(function (tx) {
            tx.executeSql(
               'INSERT INTO table_inspection (sync_status,garbage,cleaning,accessories,fuel_tank,oil_change,tire_pressure,no_evidence_flood_damage,body_panel_inspection,bumper_fascia_inspection,doors_hood_roof_inspection,doors_hood_alignment,power,windshield,exterior,wiper_blade_inspection,brakes,right_image,rare_image,left_image,front_image,fuel_cost,fuel_in_liters,odometer_reading,fuel_receipt_pic,odometer_pic,inside_front,inside_back,type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                ['offline',_this.state.garbage ,_this.state.cleaning ,_this.state.accessories ,_this.state.fuel_tank ,_this.state.oil_change ,_this.state.tire_pressure,_this.state.no_evidence_flood_damage ,_this.state.body_panel_inspection ,_this.state.bumper_fascia_inspection ,_this.state.doors_hood_roof_inspection ,_this.state.doors_hood_alignment ,_this.state.power_sliding_door_operation ,_this.state.windshield_side_rear_window_glass_inspection ,_this.state.exterior_lights_back_side_front ,_this.state.wiper_blade_inspection ,_this.state.brakes,_this.state.right_image,_this.state.rare_image,_this.state.left_image,_this.state.front_image,_this.state.fuel_cost,_this.state.fuel_in_liters,_this.state.odometer_reading,_this.state.fuel_receipt_pic,_this.state.odometer_pic,_this.state.inside_front,_this.state.inside_back,'start'],
                            (tx, results) => {
                              if (results.rowsAffected > 0) {
                                    _storeData('HomeSecreen','Company').then();
                                    _storeData('vehicle_plate_number', this.props?.route?.params?.vehicleInfo?.vehicle_number).then();

                                    setTimeout(function(){
                                        _this.props.navigation.navigate('Company')
                                    }, 1000);
                                
                                _showSuccessMessage('Inspection submitted successfully. Data is saved in offline');
                              } else alert('Registration Failed');
                                },(error) => {
                                      console.log(error);
                                  }
                              );
                        });
          } else {
            _showErrorMessage(error.message);
          }
    });
  };


    /*Remove Image from modal*/
  removeImage(_state) {
    this.setState({ [_state]: false});
  }

    removeOdometerImage() {
    this.setState({ odometer_pic: false});
  }
     removeFuelImage() {
    this.setState({ fuel_receipt_pic: false});
  }

  refreshPage() {
    this.props.navigation.push('Inspection');
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
      itemMainSub,
      insideButton,
      photo,
      cameraIcon,
      btnText,
      picBtn
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
      exterior_lights_back_side_front,
      garbage_pic,
      cleaning_pic,
      major_damage_pic} = this.state;
     
    return (
      <SafeAreaView>
      <ScrollView>
          
            <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              <TouchableOpacity style={[backButton,{alignItems:'center'}]} onPress={() => console.log()}>
                <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 18,padding:10,textAlign:'center',right:15,alignItems:'center'}}>START DAY VEHICLE INFORMATION</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:20,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
          <View style={container}>
            <View style={mainContainer}>
              <View style={itemSection}>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>DATE:</Text>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>{this.state.date}</Text>
              </View>
               <View style={itemSection}>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>VEHICLE NO:</Text>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>{this.props?.route?.params?.vehicleInfo?.vehicle_number || this.state.vehicle_number}</Text>
              </View>
              <View style={itemSection}>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>Driver Name:</Text>
                <Text style={{color: '#fff', fontSize: 18, marginTop: 4, marginLeft: 4}}>{this.state.driverName}</Text>
              </View>
              <View style={{  backgroundColor: 'white', borderRadius: 10, marginTop: 12, marginLeft: 8, marginRight: 8,borderColor: this.state.showMainBlockError?'red':'white',borderWidth: 1}}>

              <View style={itemMain}>
                 <Text style={[itemLabel,{width:'30%',marginTop:0}]}>Garbage:</Text>
                 <CheckBox value={garbage === 'yes'?true:false} onValueChange={() => this.setChecked('garbage','yes')} style={checkbox} />
                 <Text style={itemValue}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={garbage === 'no'?true:false} onValueChange={() => this.setChecked('garbage','no')} style={checkbox} />
                <Text style={itemValue}>No</Text>
                {garbage === 'yes'?(<TouchableOpacity style={{marginLeft:20}} onPress={() => this.openImagePicker('garbage_pic')}>
                <Icon type="FontAwesome" name='camera' style={{color:'#054b8b'}}/>
                </TouchableOpacity>):null}
               </View>

                {garbage === 'yes'?(<View style={{flexDirection: 'row',padding:5,alignItems: 'center',width:'100%'}}>
                  <TextInput multiline = {true} numberOfLines = {3} placeholder="Enter Garbage Comments"  style={{fontSize:14, paddingTop:5,justifyContent:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3',width:'90%'}} onChangeText={text => this.setState({garbage_comment:text})} value={this.state.garbage_comment}/>
                </View>):null}
                <View style={itemMain}>
                 <Text style={[itemLabel,{width:'30%',marginTop:0}]}>Cleaning:</Text>
                 <CheckBox value={cleaning === 'yes'?true:false} onValueChange={() => this.setChecked('cleaning','yes')} style={checkbox} />
                 <Text style={itemValue}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={cleaning === 'no'?true:false} onValueChange={() => this.setChecked('cleaning','no')} style={checkbox} />
                <Text style={itemValue}>No</Text>

                {cleaning === 'no'?(<TouchableOpacity style={{marginLeft:20}} onPress={() => this.openImagePicker('cleaning_pic')}>
                <Icon type="FontAwesome" name='camera' style={{color:'#054b8b'}}/>
                </TouchableOpacity>):null}
               </View>  

               {cleaning === 'no'?(<View style={{flexDirection: 'row',padding:5,alignItems: 'center',width:'100%'}}>
                  <TextInput multiline = {true} numberOfLines = {3} placeholder="Enter Cleaning Comments"  style={{fontSize:14, paddingTop:5,justifyContent:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3',width:'90%'}} onChangeText={text => this.setState({cleaning_comment:text})} value={this.state.cleaning_comment}/>
                </View>):null}

               <View style={itemMainSub}>
                 <Text style={itemLabel}>Accessories:</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4,}}>
                 <CheckBox value={accessories === 'yes'?true:false} onValueChange={() => this.setChecked('accessories','yes')} style={checkbox} />
                 <Text style={itemValue}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={accessories === 'no'?true:false} onValueChange={() => this.setChecked('accessories','no')} style={checkbox} />
                <Text style={itemValue}>No</Text>
                </View>
               </View>

               <View style={itemMainSub}>
                 <Text style={itemLabel}>Fuel Tank:</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4,}}>
                 <CheckBox value={fuel_tank === 'full'?true:false} onValueChange={() => this.setChecked('fuel_tank','full')} style={checkbox} />
                 <Text style={itemValue}>Full</Text>
                  <View style={{marginLeft: 12}}></View>
                <CheckBox value={fuel_tank === 'half'?true:false} onValueChange={() => this.setChecked('fuel_tank','half')} style={checkbox} />
                <Text style={itemValue}>Half</Text> 
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={fuel_tank === 'low'?true:false} onValueChange={() => this.setChecked('fuel_tank','low')} style={checkbox} />
                <Text style={itemValue}>Low</Text>
               </View>
               </View>

               <View style={itemMainSub}>
                 <Text style={itemLabel}>Oil Change:</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4,}}>
                 <CheckBox value={oil_change === 'ok'?true:false} onValueChange={() => this.setChecked('oil_change','ok')} style={checkbox} />
                 <Text style={itemValue}>Full</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={oil_change === 'half'?true:false} onValueChange={() => this.setChecked('oil_change','half')} style={checkbox} />
                <Text style={itemValue}>Half</Text> 
                <View style={{marginLeft: 12}}></View>
                <CheckBox value={oil_change === 'due_soon'?true:false} onValueChange={() => this.setChecked('oil_change','due_soon')} style={checkbox} />
                <Text style={itemValue}>Low</Text>
               </View>
               </View>


                <View style={itemMainSub}>
                 <Text style={itemLabel}>Tire Pressure:</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4,}}>
                 <CheckBox value={tire_pressure === 'ok'?true:false} onValueChange={() => this.setChecked('tire_pressure','ok')} style={checkbox} />
                 <Text style={itemValue}>Ok</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={tire_pressure === 'needs_to_be_filled'?true:false} onValueChange={() => this.setChecked('tire_pressure','needs_to_be_filled')} style={checkbox} />
                <Text style={itemValue}>Needs to be Filled</Text> 
               </View>
               </View>

                <View style={itemMainSub}>
                 <Text style={itemLabel}>Brakes:</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 4,}}>
                    <CheckBox value={brakes === 'ok'?true:false} onValueChange={() => this.setChecked('brakes','ok')} style={checkbox} />
                    <Text style={itemValue}>Ok</Text>
                    <View style={{marginLeft: 12}}></View>
                    <CheckBox value={brakes === 'repair_needed'?true:false} onValueChange={() => this.setChecked('brakes','repair_needed')} style={checkbox} />
                    <Text style={itemValue}>Repair Needed</Text> 
                  </View>
                </View>
              </View>
            </View>

            {garbage_pic ? (
<View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 10}}>
<Text style={{fontWeight: 'bold',fontSize: 30}}>Garbage Photo</Text>
<View style={{ flexBasis: '100%', height: 100, marginBottom: 10 }}>
  {garbage_pic ? (<Image style={{ height: 100,borderRadius:6 }} source={{ uri: garbage_pic }}/>):null}
  {garbage_pic ? (<TouchableOpacity onPress={() => this.removeImage('garbage_pic')}
                    style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
    <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
  </TouchableOpacity>):null}
</View>
</View>):null}

               {cleaning_pic ? (
<View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 10 }}>
<Text style={{fontWeight: 'bold',fontSize: 30}}>Cleaning Photo</Text>
<View style={{ flexBasis: '100%', height: 100, marginBottom: 10 }}>
  {cleaning_pic ? (<Image style={{ height: 100,borderRadius:6 }} source={{ uri: cleaning_pic }}/>):null}
  {cleaning_pic ? (<TouchableOpacity onPress={() => this.removeImage('cleaning_pic')}
                    style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
    <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
  </TouchableOpacity>):null}
</View>
</View>):null}

            <View style={{marginTop:10}}>
            <Text style={{fontWeight: 'bold',fontSize: 30}}>Vehicle exterior</Text>
          </View>

          <View style={spaceDivider}></View>

          <View style={{borderColor: this.state.showBumpersBlockError? 'red' :'#00c2f3',borderWidth: 1,backgroundColor: '#fff',borderRadius: 5, paddingBottom: 10}}>
              <TouchableOpacity style={nextButton} onPress={() => this.showNextPage('showBumpersBlock')}>
                <Text style={nextText}>BODY PANELS AND BUMPERS</Text>
                <Icon type="FontAwesome" name={this.state.showBumpersBlock ? 'angle-down' : 'angle-right'} style={nextIcon}/>
              </TouchableOpacity>
              { this.state.showBumpersBlock && 
              <View>
              <Text style={[blockText, {marginTop:0}]}>Any Major Damage ?</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                 <CheckBox value={no_evidence_flood_damage === 'yes'?true:false} onValueChange={() => this.setChecked('no_evidence_flood_damage','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={no_evidence_flood_damage === 'no'?true:false} onValueChange={() => this.setChecked('no_evidence_flood_damage','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
                {no_evidence_flood_damage === 'yes'?(<TouchableOpacity style={{marginLeft:20}} onPress={() => this.openImagePicker('major_damage_pic')}>
                <Icon type="FontAwesome" name='camera' style={{color:'#054b8b'}}/>
                </TouchableOpacity>):null}
              </View>

              {no_evidence_flood_damage === 'yes'?(<View style={{flexDirection: 'row',padding:5,alignItems: 'center',width:'100%'}}>
                  <TextInput multiline = {true} numberOfLines = {3} placeholder="Enter Damage Comment"  style={{fontSize:14, paddingTop:5,justifyContent:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3',width:'90%'}} onChangeText={text => this.setState({damage_comment:text})} value={this.state.damage_comment}/>
                </View>):null}

              <Text style={blockText}>Body Panel Inspection</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, marginTop: 2}}>
                 <CheckBox value={body_panel_inspection === 'yes'?true:false} onValueChange={() => this.setChecked('body_panel_inspection','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={body_panel_inspection === 'no'?true:false} onValueChange={() => this.setChecked('body_panel_inspection','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>

              <Text style={blockText}>Bumper/Fascia Inspection</Text>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={bumper_fascia_inspection === 'yes'?true:false} onValueChange={() => this.setChecked('bumper_fascia_inspection','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={bumper_fascia_inspection === 'no'?true:false} onValueChange={() => this.setChecked('bumper_fascia_inspection','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>
              </View>
            }
          </View>

          {major_damage_pic ? (
<View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 10 }}>
<Text style={{fontWeight: 'bold',fontSize: 30}}>Major Damage Photo</Text>
<View style={{ flexBasis: '100%', height: 100, marginBottom: 10 }}>
  {major_damage_pic ? (<Image style={{ height: 100,borderRadius:6 }} source={{ uri: major_damage_pic }}/>):null}
  {major_damage_pic ? (<TouchableOpacity onPress={() => this.removeImage('major_damage_pic')}
                    style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
    <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
  </TouchableOpacity>):null}
</View>
</View>):null}

          <View style={spaceDivider}></View>

          <View style={{borderColor: this.state.showDoorBlockError? 'red' :'#00c2f3',borderWidth: 1,backgroundColor: '#fff',borderRadius: 5, paddingBottom: 10}}>
              <TouchableOpacity style={nextButton} onPress={() => this.showNextPage('showDoorBlock')}>
                <Text style={nextText}>DOORS, HOOD, DECKLID, TAILGATE </Text>
                <Icon type="FontAwesome" name={this.state.showDoorBlock ? 'angle-down' : 'angle-right'} style={nextIcon}/>
              </TouchableOpacity>

              { this.state.showDoorBlock && 
              <View>
              <Text style={[blockText, {marginTop:0}]}>Doors, Hood and Roof Inspection</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={doors_hood_roof_inspection === 'yes'?true:false} onValueChange={() => this.setChecked('doors_hood_roof_inspection','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={doors_hood_roof_inspection === 'no'?true:false} onValueChange={() => this.setChecked('doors_hood_roof_inspection','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>



              <Text style={blockText}>Doors and Hood Alignment</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={doors_hood_alignment === 'yes'?true:false} onValueChange={() => this.setChecked('doors_hood_alignment','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={doors_hood_alignment === 'no'?true:false} onValueChange={() => this.setChecked('doors_hood_alignment','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>

              <Text style={blockText}>Power-Sliding Door Operation</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={power_sliding_door_operation === 'yes'?true:false} onValueChange={() => this.setChecked('power_sliding_door_operation','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={power_sliding_door_operation === 'no'?true:false} onValueChange={() => this.setChecked('power_sliding_door_operation','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>
              </View>
              }
              
          </View>
          <View style={spaceDivider}></View>

          <View style={{borderColor: this.state.showGlassBlockError? 'red' :'#00c2f3',borderWidth: 1,backgroundColor: '#fff',borderRadius: 5, paddingBottom: 10}}>
              <TouchableOpacity style={nextButton} onPress={() => this.showNextPage('showGlassBlock')}>
                <Text style={nextText}>GLASS AND OUTSIDE MIRRORS </Text>
                <Icon type="FontAwesome" name={this.state.showGlassBlock ? 'angle-down' : 'angle-right'} style={nextIcon}/>
              </TouchableOpacity>
               { this.state.showGlassBlock && 
              <View>
              <Text style={[blockText, {marginTop:0}]}>Windshield, Side and Rear-Window Glass Inspection</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={windshield_side_rear_window_glass_inspection === 'yes'?true:false} onValueChange={() => this.setChecked('windshield_side_rear_window_glass_inspection','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={windshield_side_rear_window_glass_inspection === 'no'?true:false} onValueChange={() => this.setChecked('windshield_side_rear_window_glass_inspection','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>
              

              <Text style={blockText}>Wiper Blade Inspection</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={wiper_blade_inspection === 'yes'?true:false} onValueChange={() => this.setChecked('wiper_blade_inspection','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={wiper_blade_inspection === 'no'?true:false} onValueChange={() => this.setChecked('wiper_blade_inspection','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>
              </View>
              </View>
            }
          </View>

          <View style={spaceDivider}></View>

          <View style={{borderColor: this.state.showExteriorBlockError? 'red' :'#00c2f3',borderWidth: 1,backgroundColor: '#fff',borderRadius: 5, paddingBottom: 10}}>
              <TouchableOpacity style={nextButton} onPress={() => this.showNextPage('showExteriorBlock')}>
                <Text style={nextText}>EXTERIOR LIGHTS</Text>
                <Icon type="FontAwesome" name={this.state.showExteriorBlock ? 'angle-down' : 'angle-right'} style={nextIcon}/>
              </TouchableOpacity>
               { this.state.showExteriorBlock && 
              <View>
              <Text style={[blockText, {marginTop:0}]}>Exterior Lights (Back/Side/Front)</Text>
               <View style={{ flexDirection: 'row',alignItems: 'center', marginLeft: 8,marginTop: 2}}>
                 <CheckBox value={exterior_lights_back_side_front === 'yes'?true:false} onValueChange={() => this.setChecked('exterior_lights_back_side_front','yes')} style={checkboxIn} />
                 <Text style={itemValueIn}>Yes</Text>
                 <View style={{marginLeft: 12}}></View>
                <CheckBox value={exterior_lights_back_side_front === 'no'?true:false} onValueChange={() => this.setChecked('exterior_lights_back_side_front','no')} style={checkboxIn} />
                <Text style={itemValueIn}>No</Text>

                
              </View>
          
              </View>
            }
          </View>

          <View style={spaceDivider}></View>

           <View style={{borderColor: this.state.showExteriorBlockError? '#00c2f3' :'#00c2f3',borderWidth: 1,backgroundColor: '#fff',borderRadius: 5, paddingBottom: 10}}>
              <TouchableOpacity style={nextButton} onPress={() => this.showNextPage('showExteriorBlock')}>
                <Text style={nextText}>Odometer & Fuel Information</Text>
                <Icon type="FontAwesome" name={this.state.showExteriorBlock ? 'angle-down' : 'angle-right'} style={nextIcon}/>
              </TouchableOpacity>
             
              <View>
                
                  <View style={{ flexDirection: 'row', marginTop: 15}}>
                    <Button style={{width:'100%', backgroundColor: '#00c2f3', justifyContent: 'center'}}
                      onPress={() => this.takePhotoOdometer()}>
                      <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14}}>Take Photo</Text>
                      <Icon name='camera' />
                    </Button>
                    
                  </View>
                  <View style={{marginTop: 15}}>

                    <Text style={{ textAlign: 'center', color: '#000', fontSize: 14}}>Photo Of Odometer Of Van</Text>
                  </View>
                  {this.state.odometer_pic ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20, marginLeft: 10 }}>
                    <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                      {this.state.odometer_pic ? (<Image style={{ height: 200 }} source={{ uri: this.state.odometer_pic }}/>):null}
                      {this.state.odometer_pic ? (<TouchableOpacity onPress={() => this.removeOdometerImage()}
                                        style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                        <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                      </TouchableOpacity>):null}
                    </View>
                  </View>):null}

                  <View style={{marginTop: 10}}>
                      <TextInput keyboardType={'numeric'} onChangeText={(text)=> this.onChangedReading(text)} placeholder={'Enter Odometer Reading'} value={this.state.odometer_reading} style={{fontSize:16, paddingLeft:10,justifyContent:"flex-start", borderColor: '#00c2f3',backgroundColor:'white', borderBottomWidth: 1,borderRadius: 5, height:50 }}  />
                  </View>
          
              </View>

              <View>
                
                  <View style={{ flexDirection: 'row', marginTop: 15}}>
                    <Button style={{width:'100%', backgroundColor: '#00c2f3', justifyContent: 'center'}}
                      onPress={() => this.takePhotoFuel()}>
                      <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14}}>Take Photo</Text>
                      <Icon name='camera' />
                    </Button>
                    
                  </View>
                  <View style={{marginTop: 15}}>

                    <Text style={{ textAlign: 'center', color: '#000', fontSize: 14}}>Photo Of Fuel Receipt</Text>
                  </View>

                  {this.state.fuel_receipt_pic ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20, marginLeft: 10 }}>
                    <View style={{ flexBasis: '100%', height: 200, marginBottom: 10 }}>
                      {this.state.fuel_receipt_pic ? (<Image style={{ height: 200 }} source={{ uri: this.state.fuel_receipt_pic }}/>):null}
                      {this.state.fuel_receipt_pic ? (<TouchableOpacity onPress={() => this.removeFuelImage()}
                                        style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                        <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                      </TouchableOpacity>):null}
                    </View>
                  </View>):null}

                  <View style={{marginTop: 10}}>
                      <TextInput keyboardType='numeric' onChangeText={(text)=> this.onChangedLitter(text)} placeholder={'Enter Fuel In Litres'} value={this.state.fuel_in_liters} style={{fontSize:16, paddingLeft:10,justifyContent:"flex-start", borderColor: '#00c2f3',backgroundColor:'white', borderBottomWidth: 1,borderRadius: 5, height:50 }} />
                  </View>

                  <View style={{marginTop: 10}}>
                      <TextInput  keyboardType='numeric' onChangeText={(text)=> this.onChangedCost(text)} placeholder={'Enter Fuel Cost'} value={this.state.fuel_cost} style={{fontSize:16, paddingLeft:10,justifyContent:"flex-start", borderColor: '#00c2f3',backgroundColor:'white', borderBottomWidth: 1,borderRadius: 5, height:50 }} />
                  </View>
          
              </View>
            
        </View>

          <View style={spaceDivider}></View>

          <View style={{ backgroundColor: '#00c2f3',borderColor: '#00c2f3',borderWidth: 1,borderRadius: 5}}>
            <Text style={{  fontSize: 22,padding:10,color:"#fff" }}>Upload Photo</Text>
            <Text style={{  fontSize: 16,padding:5,color:"#fff" }}>Front View, Rear View, Left View and Right View</Text>
              <View style={{ flexDirection: 'row',padding:13}}>
                <Button style={{ height: 50,width:'22.5%', backgroundColor: 'white'}}
                  onPress={() => this.openImagePicker1('front_image')}>
                  <Icon type="FontAwesome" name='camera' style={cameraIcon}/>
                  <Text style={btnText}>Front</Text>
                </Button>

                <Button style={picBtn}
                  onPress={() => this.openImagePicker1('left_image')}>
                  <Icon type="FontAwesome" name='camera' style={cameraIcon}/>
                  <Text style={btnText}>Left</Text>
                </Button>

                <Button style={picBtn}
                  onPress={() => this.openImagePicker1('rare_image')}>
                  <Icon type="FontAwesome" name='camera' style={cameraIcon}/>
                  <Text style={btnText}>Rear</Text>
                </Button>

                <Button style={picBtn}
                  onPress={() => this.openImagePicker1('right_image')}>
                  <Icon type="FontAwesome" name='camera' style={cameraIcon}/>
                  <Text style={btnText}>Right</Text>
                </Button>
              </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 20, marginLeft: 10 }}>
                  
                  <View style={{ flexBasis: '22%', height: 50, marginBottom: 10 }}>
                    {this.state.front_image ? (<Image style={photo} source={{ uri: this.state.front_image }}/>):null}
                    {this.state.front_image ? (<TouchableOpacity onPress={() => this.removeImage('front_image')}
                                      style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                      <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                    </TouchableOpacity>):null}
                  </View>
                
                  <View style={{ flexBasis: '22%', height: 50, marginBottom: 10, marginLeft:8 }}>
                    {this.state.left_image ? (<Image style={photo} source={{ uri: this.state.left_image }}/>):null}
                    {this.state.left_image ? (<TouchableOpacity onPress={() => this.removeImage('left_image')}
                                      style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                      <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                    </TouchableOpacity>):null}
                  </View>

                  <View style={{ flexBasis: '22%', height: 50, marginBottom: 10, marginLeft:8}}>
                    {this.state.rare_image ? (<Image style={photo} source={{ uri: this.state.rare_image }}/>):null}
                    {this.state.rare_image ? (<TouchableOpacity onPress={() => this.removeImage('rare_image')}
                                      style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                      <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                    </TouchableOpacity>):null}
                  </View>

                  <View style={{ flexBasis: '22%', height: 50, marginBottom: 10, marginLeft:8 }}>
                    {this.state.right_image ? (<Image style={photo} source={{ uri: this.state.right_image }}/>):null}
                    {this.state.right_image ? (<TouchableOpacity onPress={() => this.removeImage('right_image')}
                                      style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                      <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                    </TouchableOpacity>):null}
                  </View>
                </View>
                <View style={{borderColor: '#054b8b',borderWidth:1}}>
                </View>

              <Text style={{  fontSize: 16,padding:5,color:"#fff" }}>Inside Back View, Inside Front View</Text>
              <View style={{ flexDirection: 'row',padding:6}}>
                <Button style={insideButton}
                  onPress={() => this.openImagePicker('inside_back')}>
                  <Icon type="FontAwesome" name='camera' style={{color:'black',right:12,fontSize:15}}/>
                  <Text style={{fontSize: 16,right:22,fontWeight: '100',}}>Inside Back View</Text>
                </Button>

                
                <Button style={[insideButton,{marginLeft:5}]}
                  onPress={() => this.openImagePicker('inside_front')}>
                  <Icon type="FontAwesome" name='camera' style={{color:'black',right:9,fontSize:15}}/>
                  <Text style={{fontSize: 16,right:22,fontWeight: '100',}}>Inside Front View</Text>
                </Button>
              </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', flexGrow: 0, justifyContent: 'flex-start',marginTop: 10,padding:6 }}>
                  
                 <View style={{ flexBasis: '48%', height: 50, marginBottom: 10 }}>
                  {this.state.inside_back ? (<Image style={photo} source={{ uri: this.state.inside_back }}/>):null}
                  {this.state.inside_back ? (<TouchableOpacity onPress={() => this.removeImage('inside_back')}
                                    style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                    <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                  </TouchableOpacity>):null}
                </View>
                
                  <View style={{ flexBasis: '48%', height: 50, marginBottom: 10, marginLeft:8 }}>
                  {this.state.inside_front ? (<Image style={photo} source={{ uri: this.state.inside_front }}/>):null}
                  {this.state.inside_front ? (<TouchableOpacity onPress={() => this.removeImage('inside_front')}
                                    style={{ position: 'absolute', top: -5, right: -5, zIndex: 9 }}>
                    <Icon type="FontAwesome" name='times'  style={{ color: 'red'}}/>
                  </TouchableOpacity>):null}
                  </View>
                 
                </View>
          </View>

          <View style={{height:10}}></View>
            <View>
            <TextInput multiline = {true} numberOfLines = {3} placeholder="Notes"  style={{fontSize:14, paddingTop:5,justifyContent:"flex-start",backgroundColor:'white', borderWidth: 1,borderRadius: 5, height: 60,borderColor:'#00c2f3' }} onChangeText={text => this.setState({notes:text})} value={this.state.notes}/>
            </View>

          
          <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 10, marginRight: 20}}>
              <Button 
                    style={{ height: 50, width:'45%',marginTop: 20, backgroundColor: '#00c2f3', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.saveData()}>
                    <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Submit</Text>
                  </Button>
                  <Button 
                    style={{  height: 50, width:'45%', marginLeft: 35,borderColor: '#00c2f3', borderWidth: 1, marginTop: 20, backgroundColor: 'white', justifyContent: 'center', borderRadius: 5}}
                    onPress={() => this.clearData()} >
                    <Text style={{ textAlign: 'center', color: 'black', fontSize: 22 }}>Reset</Text>
                  </Button>
              </View>
          </View>
          <View style={spaceDivider}></View>
          <View style={spaceDivider}></View>

          </ScrollView>
        {this.state.isloading && (
              <Loader />
          )}
        </SafeAreaView>
    );
  }
}

export default Inspection;