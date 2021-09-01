/* eslint-disable prettier/prettier */
import { StyleSheet} from 'react-native';

const styles = StyleSheet.create({
	spaceDivider: {
		height: 20,
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
	nextIcon: { 
		color: 'black',
		fontWeight: '100',
		paddingRight:10,
		right:4
	},
	backIcon: { 
		color: '#fff',
		fontWeight: '100',
		padding:10,
		left:2
	},
	label : {
		fontSize: 16,fontWeight:'bold',color:'#054b8b'
	},
	labelView : {
		flexDirection: 'row',justifyContent: 'space-between',paddingLeft:5,paddingRight:5
	},
	labelVal : {
		fontSize: 16,fontWeight:'bold',color:'#054b8b',flex: 1, flexWrap: 'wrap',alignSelf:'center',textAlign:'right'
	}
});

export default styles;
