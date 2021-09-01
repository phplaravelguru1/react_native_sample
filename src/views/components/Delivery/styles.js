/* eslint-disable prettier/prettier */
import { StyleSheet} from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#eeeeef',
		padding:15
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
		alignItems:'center',
		justifyContent: 'space-between',
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
		padding:10,
		textAlign:'center',
		paddingLeft:'4%'
	},
	mainContainer: { 
	 	marginTop: '2%',
	 	paddingBottom:20,
	},
	itemLabel: { 
		color: 'black', 
		fontSize: 19, 
		marginTop: 4, 
		marginLeft: 4,
	},
	itemSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginLeft: 20,
		marginRight: 20,
		//padding:5
	},
	itemValue: {
		fontSize: 19,
		paddingLeft:1
	},
	checkbox1: {
		left:7,
		height: 22,
		width: 22
	},

	checkbox: {
		left:-7,
		height: 22,
		width: 22
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
		paddingTop:10
	},
	
	itemMain: {
		flexDirection: 'row',marginLeft: 5,padding:5
	},
	spaceDivider: {
		height: 20,
	},
	spaceDivider1: {
    height:10
  	},
	nextText: {
		color:"black",
		fontWeight: '100',
		fontSize: 18,
		padding:15,
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
		padding:10,
		right:4
	},
	nextButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	itemMainSub: {
		marginLeft: 5,
		padding:5
	},
	itemValue1: {
		fontSize: 20,
		paddingLeft:8,
		marginLeft:8
	},

	itemSectionEndDay: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginRight: 10,
		alignItems:'center',
		textAlign:'center',
		padding:5
	},
	itemValueEndDay: {
		fontSize: 16,
		paddingLeft:1
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
	},
	mainContainer1: { 
	 	marginTop: '2%',
	 	paddingBottom:20,
	},
	mainContainer2: { 
	 	borderRadius: 15,
	 	backgroundColor: '#00c2f3', //'#fdeee9'
	 	marginTop: '2%',
	 	paddingTop:10,
	 	paddingBottom:10
	},
	text1:{
		color: 'white', fontSize: 16,fontWeight:'bold'
	},
	photoBtn:{
		backgroundColor: '#054b8b',width:'99%',alignSelf:'center',alignItems:'center',justifyContent:'center'
	}
});

export default styles;
