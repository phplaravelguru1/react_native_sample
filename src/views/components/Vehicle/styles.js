/* eslint-disable prettier/prettier */
import { StyleSheet} from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#eeeeef',
		marginLeft:'4%',
		marginRight:'4%',
	},
	headerLogo: {
		height: 50,
		resizeMode: 'contain',
		top:'5%'
	},
	headerView: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	}, 
	backSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems:'center',
		borderColor: '#00c2f3',
		borderWidth: 1,
		backgroundColor: '#00c2f3',
		marginTop: '4%',
		//borderRadius: 6,
	},
	backButton: {
		flexDirection: 'row',
	},
	backText: {
		color:"#fff",
		fontWeight: '100',
		fontSize: 18,
		padding:15,
		textAlign:'center',
		paddingLeft:'2%'
	},
	mainContainer: { 
	 	borderRadius: 15,
	 	backgroundColor: '#00c2f3', //'#fdeee9'
	 	marginTop: '2%',
	 	paddingTop:10,
	 	paddingBottom:10
	},
	itemLabel: { 
		color: 'black', 
		fontSize: 18, 
		marginTop: 4, 
		marginLeft: 4,
	},
	itemSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginLeft: 5,
		marginRight: 5,
		//padding:5
	},
	itemValue: {
		fontSize: 18,
		paddingLeft:1,
		marginLeft:3
	},
	checkbox1: {
		left:7,
		width: 22,
    	height: 22,
    	color:"#fff",
    	
    	
	},
	checkboxIn: {
		left:7,
		width: 22,
    	height: 22
	},

	checkbox: {
		left:-5,
		width: 22,
    	height: 22,
    	
	},

	nextSection: {
		height: '5%',
		borderColor: '#F9CCBE',
		borderWidth: 1,
		backgroundColor: '#fdeee9',
		marginTop: 5,
		marginBottom:25,
		marginLeft: 15,
		marginRight: 20
	},

	blockSection: {
		borderColor: '#F9CCBE',
		borderWidth: 1,
		backgroundColor: '#fdeee9',
		borderRadius: 5,
	},
	blockText: {
		color:"black",
		fontSize: 18,
		paddingLeft:15,
		marginTop:10
	},
	itemMain: {
		flexDirection: 'row',
		//marginLeft: 5,
		padding:5,
		alignItems: 'center'
	},
	spaceDivider: {
		height: 20,
	},
	nextText: {
		color:"black",
		fontWeight: '100',
		fontSize: 18,
		padding:12,
		textAlign:'center',
	},

	backIcon: { 
		color: '#fff',
		fontWeight: '100',
		padding:10
	},
	nextIcon: { 
		color: 'black',
		fontWeight: '100',
		paddingRight:10,
		right:4
	},
	nextButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	itemMainSub: {
		//marginLeft: 5,
		padding:5
	},
	itemValue1: {
		fontSize: 20,
		paddingLeft:8,
		marginLeft:8,
		color:"#fff"
	},
	itemValueIn: {
		fontSize: 20,
		paddingLeft:8,
		marginLeft:8
	},
	insideButton: {
		height: 50,width:'49%', backgroundColor: 'white',borderRadius: 5
	},
	photo: {
		height: 50,borderRadius: 5
	},
	cameraIcon: {
		color:'black',right:7,fontSize:15
	},
	btnText: {
		fontSize: 16,right:20,fontWeight: '100'
	},
	picBtn: {
		height: 50,width:'22.5%',marginLeft:11, backgroundColor: 'white', borderRadius: 5
	}
});

export default styles;
