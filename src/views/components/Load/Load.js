import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData, _retrieveData } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import CheckBox from '@react-native-community/checkbox';
import { saveProductInfo,getUser } from 'api';
import CustomHeader from '../../CustomHeader';
import geolocation from '@react-native-community/geolocation';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { CommonActions } from '@react-navigation/native';

class Load extends Component {
constructor(props) {
    super(props);

    this.state = {
      isloading: false,
      isShowScanner:false,
      barcodes:[],
      customer_name:'',
      address:'',
      city:'',
      province:'',
      postal_code:'',
      email_address:'',
      phone_number:'',
      company_id:1,
      company_name:null,
      loadId:'',
      user_avtar:'',
      date:''
    };


  }

  showNextPage = (_state) => {
    this.setState({
            [_state]: this.state[_state]
        });
  }




    componentDidMount = () => {
       const _this = this;
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
          _retrieveData('LoadSecreen')
            .then((res1) => {
              
              var res = 'LoadMain';
              if(res == 'ScanParcel2'){
                _storeData('LoadSecreen','ScanParcel').then();
                //_this.props.navigation.navigate('LoadMain');

                 this.props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { name: 'LoadMain'}
                    ],
                  })
                );

              } else {
                //_this.props.navigation.navigate(res);

                 this.props.navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      { name: res}
                    ],
                  })
                );

              }
          });

    });  
          
  };



    componentWillUnmount() {
    this._unsubscribe();
  }



   


  

  render() {

    return (
      <View>
      </View>
    );
  }
}

export default Load;