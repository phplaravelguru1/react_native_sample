import React, {Component } from 'react';
import { View, Text, Image,StyleSheet,TouchableOpacity,ScrollView,Alert,SafeAreaView} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label,Button, Toast, Icon, ListItem, CheckBox, Body,Switch } from 'native-base';
import { image, config, _showErrorMessage, _showSuccessMessage, Loader, _storeUser,_getAll, _storeData, _retrieveData } from 'assets';
import styles from './styles';
import ImagePicker from 'react-native-image-picker';
import {getUser, submitHelperInformation,postData } from 'api';
import CustomHeader from '../../CustomHeader';
import { flashon, flashoff } from '../../../store/actions/index.js';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { WebView } from 'react-native-webview';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
class QrCode extends Component {
constructor(props) {
    super(props);
 
    this.state = {
      isloading: false,
      helper_first_name:'',
      helper_last_name:'',
      is_exception_case:false,
      uniform_pics:'',
      radiocheck:1,
      is_verify:false,
      full_name:null,
      profile_photo:null,
      SecurityCode:null,
      isShowScanner: false
    };
  }
  
    componentDidMount = () => {
      this._unsubscribe = this.props.navigation.addListener('focus', () => {
           getUser().then((res) => {
            this.setState({
              SecurityCode: res.SecurityCode
            });
          }); 
       }); 
    };
 
  componentWillUnmount() {
    this._unsubscribe();
  }  
    
  removeImage(_state) {
    this.setState({ [_state]: false});
  }

  
 

    checkCode = () => {
    this.setState({ isloading: true });
    var postdata = { 'security_code':this.state.barcodes,'verify_by':'helper'};
     console.log(postdata);
     postData(postdata,'verify_security_code').then((res) => {
      console.log(res);
      if(res.type == 1) {
            this.setState({isloading: false,is_verify:true,profile_photo:res.data.profile_photo,full_name:res.data.full_name });
          _showSuccessMessage(res.message);
      } else {
         this.setState({ is_verify:false,isloading: false});
        _showErrorMessage(res.message);
      }
    });
  }


   refreshPage() {
    this.props.navigation.push('QrCode');
  }

    onScannerSuccess = e => {
    const { data } = e;
      this.setState({
          barcodes: '',
          isloading: true
        }, () => {
            if (data) {
              
              this.setState({ isloading: true });
              var postdata = { 'security_code':String(data),'verify_by':'helper'};
                postData(postdata,'verify_security_code').then((res) => {
              
                if(res.type == 1) {
                      this.setState({barcodes:String(data),isloading: false,is_verify:true,profile_photo:res.data.profile_photo,full_name:res.data.full_name,isShowScanner: false });
                    _showSuccessMessage(res.message);
                } else {
                   this.setState({ is_verify:false,isloading: false,isShowScanner: false});
                  _showErrorMessage(res.message);
                }
              });

            } else {
                this.setState({ isloading: false });
                  Alert.alert(
                'Invalid QR Code',
                'This QR code is not Trans8 code.',
                [
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
              );
            }
        })
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

    const {isShowScanner,is_verify,profile_photo,full_name,SecurityCode} = this.state;
     
    return (
      <Container>
        <Content>
          <CustomHeader {...this.props} url={this.state.user_avtar} />
          <View style={backSection}>
              {isShowScanner?(<TouchableOpacity style={backButton} onPress={() => this.setState({isShowScanner:false})}>
              <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 20,padding:10,textAlign:'center',paddingLeft:'4%'}}>QR CODE</Text>
              </TouchableOpacity>):<TouchableOpacity style={backButton} onPress={() => this.props.navigation.push('OfflineUserStartDay')}>
              <Icon type="FontAwesome" name='angle-left' style={backIcon}/>
                <Text style={{color:"#fff",fontWeight:'bold',marginTop:(Platform.OS == 'ios') ? 5 : 0, fontSize: 20,padding:10,textAlign:'center',paddingLeft:'4%'}}>QR CODE</Text>
              </TouchableOpacity>}
               <TouchableOpacity onPress={() => this.refreshPage()}>
            <Icon style={{color:'#fff',right:8,fontWeight:200}} name='sync' />
          </TouchableOpacity>
          </View>
          { (this.state.isShowScanner) &&
              <View>
                <View style={{flexDirection:'row', justifyContent:'space-between',marginLeft: 20, marginRight: 20}}>
                  <Text style={{color:'black',fontSize:18,}}>Flash Light</Text>
                  <Switch onValueChange={ (value) => {value == true?this.props.flashon():this.props.flashoff()}} 
                    value={this.props.flashstatus == 'torch'?true:false} /> 
                </View>
                <View>
                <QRCodeScanner
              cameraStyle={{ height: 280, marginTop: 10, width: 300, alignSelf: 'center', justifyContent: 'center', overflow: 'hidden' }}
              onRead={ (e) => this.onScannerSuccess(e) }
                reactivate={true}
                showMarker={true}
                flashMode={this.props.flashstatus == 'torch'?RNCamera.Constants.FlashMode.torch:RNCamera.Constants.FlashMode.off}
                reactivateTimeout={7000}
            />
              </View>
              </View>
              }
              { (!this.state.isShowScanner) &&
              <View>
              <View style={{borderWidth:0.5,borderColor:'black',marginTop:10}}></View>
      <Text style={{fontWeight:'bold',fontSize:18,alignSelf:'center',justifyContent:'center',marginTop:5}}>YOUR QR CODE</Text>
      <WebView style={{height:200,width:200,justifyContent:'center',alignSelf:'center'}} source={{ uri: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl='+SecurityCode+'' }} />
              <Text style={{ textAlign: 'center', fontSize: 18, fontWeight:'bold'}}>{SecurityCode}</Text>
              
              <View style={{ borderRadius: 15,alignItems: 'center',justifyContent:'center',marginTop:15}}>
                <Button small onPress={() => this.setState({isShowScanner:true})}  style={{backgroundColor: '#00c2f3',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
                <Text style={{color:'#fff',fontWeight:'bold', fontSize: 14,textAlign:'center',alignSelf:'center'}}>SCAN DRIVER QR CODE</Text>
                <Icon name='scan' />
                </Button>
              </View>
              <View style={{ marginTop: 3, alignItems:'center'}}>
                 <Text style={{ textAlign: 'center', fontSize: 14}}>OR</Text>
              </View>    
              <Form>
                  <Item stackedLabel>
                    <Label error={true} style={{ fontWeight: 'bold' }}>Enter 6 Digit DRIVER Code</Label>
                  <Item>
                        <Input disabled={is_verify?true:false} placeholder="Enter 6 Digit Driver Code" value={this.state.barcodes} onChangeText={(barcodes) => this.setState({ barcodes: barcodes })}/>
                        
                    {is_verify?(<Icon type="FontAwesome" name='check' style={{ color: 'green'}} />):<TouchableOpacity onPress={() => this.checkCode()}><Text style={{ textAlign: 'center', color:'#054b8b', fontSize: 14}}>VERIFY</Text></TouchableOpacity>}
                  
                  </Item>
                </Item>
              </Form>
              {is_verify?(<View>
                <Text style={{fontWeight:'bold',fontSize:18,alignSelf:'center',justifyContent:'center',marginTop:5}}>YOUR DRIVER DETAILS</Text>
                <View style={{alignItems:'center',justifyContent:'center',alignSelf:'center'}}>
                  <Image
                  style={{ marginTop:10,height: 70,width: 70,borderRadius: 40,borderColor:'grey',borderWidth:1}}
                  source={{ uri: profile_photo }}
                />
                        <Text style={{alignSelf:'center',marginTop:10,fontSize:18,fontWeight:'bold'}}>{full_name}</Text>
                </View>
                </View>):null}
              </View>
            }
          </Content>
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
export default connect(mapStateToProps,matchDispatchToProps)(QrCode);