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
		alignItems:'center',
		justifyContent: 'space-between'
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
		color: '#fff', 
		fontSize: 16, 
	},
	itemSection: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding:10,
		alignItems:'center'
	},
	itemValue: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#fff', 
	},
	checkbox1: {
		left:7,
	},

	checkbox: {
		left:0,
	},

	nextSection: {
		height: '5%',
		borderColor: '#00c2f3',
		borderWidth: 1,
		backgroundColor: '#fdeee9',
		marginTop: 5,
		marginBottom:25,
		marginLeft: 15,
		marginRight: 20
	},

	blockSection: {
		borderColor: '#00c2f3',
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
		marginLeft: 5,padding:5
	},
	itemValue1: {
		fontSize: 20,
		paddingLeft:8
	},
	mainContainer1: { 
	 	marginTop: '2%',
	 	paddingBottom:20,
	 	borderRadius: 15,
	 	backgroundColor: '#00c2f3', //'#fdeee9'
	 	marginTop: '2%',
	 	paddingBottom:20
	},
	pickerStyle: {
		height: 20, width: 100,fontWeight:'100',fontSize:16,color:"#FFFFFF"
	},
	pickerMain: {
		borderWidth:1,borderColor:'#00c2f3',width:'24%', padding:2,alignItems:'center',borderRadius: 5
	},
	roundIcon: {
		color: '#EB5729',
		fontWeight: '100',
		padding:10
	}
}); 

export default styles;
