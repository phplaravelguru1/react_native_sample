import React, { Component } from 'react';
import { View, Text, TouchableOpacity} from 'react-native';
import { Container, Content, Form, Item, Input, Label,Button, Icon } from 'native-base';
import { _showErrorMessage, _showSuccessMessage, Loader } from 'assets';
import axios from 'axios';
import { SignUpForm } from 'api';

class SignUp extends Component {
  constructor(props){
    super(props); 
    this.state = {
      first_name: null,
      last_name: null,
      email_address: null,
      phone_number: null,
      password: null,     
      password_confirmation: null,     
      isloading: false,
    } 
}

SignupForm = () => {
  let first_name = this.state.first_name;
  let last_name = this.state.last_name;
  let email_address = this.state.email_address;
  let phone_number = this.state.phone_number;
  let password = this.state.password;
  let password_confirmation = this.state.password_confirmation;
  var postdata = { password_confirmation:password_confirmation,password:password,phone_number:phone_number,first_name:first_name, last_name:last_name,email_address:email_address};

  if(first_name == '' || first_name == null){
    _showErrorMessage('First Name field is requried');
    return false;
  }

  if(last_name == '' || last_name == null){
    _showErrorMessage('Last Name field is requried');
    return false;
  }

  if(email_address == '' || email_address == null){
    _showErrorMessage('Email field is requried');
    return false;
  }

  if(password == '' || password == null){
    _showErrorMessage('Password field is requried');
    return false;
  }

  if(password_confirmation == '' || password_confirmation == null){
    _showErrorMessage('Confirm password field is requried');
    return false;
  }

  if(password_confirmation != password){
    _showErrorMessage('Confirm password not match');
    return false;
  }

  this.setState({ isloading: true });
  SignUpForm(postdata).then((res) => {
    console.log(res);
    if(res.type == 1) {
      this.setState({ password_confirmation:null,password:null,phone_number:null,first_name:null, last_name:null,email_address:null,isloading: false });
      _showSuccessMessage(res.message);
      this.props.navigation.navigate('Login');
    } else {
      this.setState({ isloading: false });
      _showErrorMessage(res.message);
    }
  }).catch(function (error) {
    this.setState({ isloading: false });
    _showErrorMessage(error.message);
  });
};

render() {
  return (
      <Container style={{backgroundColor: '#fff'}}>
        <Content padder>
          <View style={{ marginTop: 2, flex: 1,paddingBottom:10}}>
            <Text style={{color: '#00c2f3',fontSize:23, fontWeight:'bold', alignSelf:'center'}}>Sign Up</Text>
            <Form>
            <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>First Name</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='user' style={{ color: '#00c2f3'}}/>
                  <Input placeholder="Enter First Name" value={this.state.first_name} onChangeText={(first_name) => this.setState({ first_name: first_name })}/>
                </Item>
              </Item>
              <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Last Name</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='user' style={{ color: '#00c2f3'}}/>
                  <Input placeholder="Enter Last Name" value={this.state.last_name} onChangeText={(last_name) => this.setState({ last_name: last_name })}/>
                </Item>
              </Item>
              <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Email</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='envelope' style={{ color: '#00c2f3'}}/>
                  <Input placeholder="Enter Email" value={this.state.email_address} onChangeText={(email_address) => this.setState({ email_address: email_address })}/>
                </Item>
              </Item>
               <Item stackedLabel>
                <Label style={{ fontWeight: 'bold' }}>Phone</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='phone' style={{ color: '#00c2f3'}}/>
                  <Input maxLength={10} placeholder="Enter Phone" keyboardType = 'numeric' value={this.state.phone_number} onChangeText={(phone_number) => this.setState({ phone_number: phone_number })}/>
                </Item>
              </Item>
              <Item stackedLabel last>
                <Label style={{ fontWeight: 'bold' }}>Password</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='lock' style={{ color: '#00c2f3'}} />
                  <Input onChangeText={(password) => this.setState({ password: password })} secureTextEntry={true} placeholder="....."/>
                </Item>
              </Item>
              <Item stackedLabel last>
                <Label style={{ fontWeight: 'bold' }}>Confirm Password</Label>
                <Item style={{ borderBottomColor: '#00c2f3'}}>
                  <Icon type="FontAwesome" name='lock' style={{ color: '#00c2f3'}} />
                  <Input onChangeText={(password) => this.setState({ password_confirmation: password })} secureTextEntry={true} placeholder="....."/>
                </Item>
              </Item>
            </Form>
            <Button block style={{ width: "85%", height: 50, marginLeft: 25, marginRight: 20, marginTop: 20, backgroundColor: '#00c2f3', alignSelf: 'center', justifyContent: 'center', zIndex: 1 }} onPress={() =>this.SignupForm()}>
              <Text style={{ textAlign: 'center', color: '#fff', fontSize: 22 }}>Sign Up</Text>
            </Button>
            <TouchableOpacity style={{alignSelf: 'center', top:16, paddingBottom:10}} onPress={() => { this.props.navigation.replace('Login') }}>
              <Text style={{fontSize: 16,color:'#00c2f3'}}>Already have an account? Login here</Text>
            </TouchableOpacity>
          </View>
        </Content>
        {this.state.isloading && (
            <Loader />
        )}
      </Container>
  );
}
}

export default SignUp;
