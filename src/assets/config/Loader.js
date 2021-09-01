import React, { Component } from 'react';
import {  StyleSheet,  ActivityIndicator}  from 'react-native';

export class Loader extends Component {	
	render() {
		return (
			<ActivityIndicator color='#fc9f04' style={styless.indicator} size={'large'} />
		);
	}
}

const styless = StyleSheet.create({
	indicator: {
  		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		//backgroundColor:"#F5FCFF88",
		backgroundColor:"#000",
		opacity:0.6,
		zIndex:99999		
  	}
});