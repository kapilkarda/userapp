import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Alert, Modal, ActivityIndicator } from 'react-native'
import { SimpleLineIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as actions from "../store/common/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Actions } from 'react-native-router-flux';
import api from '../api'
import Expo, { Facebook } from "expo"
import Cache from '../utils/cache'

class Test extends React.Component {

  constructor(props) {
    super(props)
    this.state={
      email:'',
      password:'',
      signedIn: false,
      name: "",
      photoUrl: "",
      isWaiting: false,
      isRefreshing:false,
    }
  }

  static navigationOptions = {
    title: 'FacebookLogin',
  };

  signIn = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId:
          "603386649315-9rbv8vmv2vvftetfbvlrbufcps1fajqf.apps.googleusercontent.com",
        iosClientId: "603386649315-vp4revvrcgrcjme51ebuhbkbspl048l9.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      })

      if (result.type === "success") {

         this.props.actions.register(result.user.name, result.user.email, 'password', result.user.photoUrl)
         this.props.actions.login(result.user.email, 'password')

      } else {
        console.log("cancelled")
      }
    } catch (e) {
      console.log("error", e)
    }
  }

  _testFacebookLogin = async (id, perms, behavior = 'web') => {
    try {
      const result = await Facebook.logInWithReadPermissionsAsync(id, {
        permissions: perms,
        behavior,
      });

      const { type, token } = result;

      if (type === 'success') {
        Alert.alert('Logged in!', JSON.stringify(result), [
          {
            text: 'OK!',
            onPress: () => {
              console.log('This is token', result.token);
            },
          },
        ]);
          let userInfoResponse = await fetch(
          `https://graph.facebook.com/me?access_token=${result.token}&fields=id,name,picture.type(large)`
        );
        const userInfo = await userInfoResponse.json();
        console.log('This is user Info --------------->', userInfo)

      }
    } catch (e) {
      Alert.alert('Error!', e.message, [{ text: 'OK', onPress: () => {} }]);
    }
  };

  login(){
    this.setState({isWaiting:true})
    api.login(this.state.email, this.state.password, (err,res)=>{
      if (err == null ){
        console.log('res', res)
        Cache.currentUser = res.member
        this.setState({isWaiting:false})
        this.setState({email:'', password:''})
        Actions.main()
      }
      this.setState({isWaiting:false})
    })
  }

  renderIndicator() {
    return (
      <Modal
        visible={this.state.isWaiting}
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator}>
            <ActivityIndicator size="large" />
          </View>
        </View>
      </Modal>
    );
  }

  render() {

    let permissions = ['public_profile', 'email', 'user_friends'];

    return (
      <View style={styles.container} >

        <View>
          <Image
            style={styles.image}
            source={require('../../assets/images/logo.jpg')}
          />
        </View>

        <Text style={styles.login}> Login</Text>
        
        <View style={{width:'90%'}}>
          <Text>Email</Text>
          <SimpleLineIcons style={styles.inputicon} name="user" size={20} color='#ddd' />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.input}
            placeholder='Type your email'
            onChangeText={(email) => this.setState({email})}
            value={this.state.email}
          />
        </View>

        <View style={{width:'90%', marginTop:10}}>
          <Text>Password</Text>
          <MaterialIcons style={styles.inputicon} name="lock-outline" size={22} color='#ddd' />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.input}
            secureTextEntry={true}
            placeholder='Type your password'
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
          />
        </View>

        <TouchableOpacity onPress={()=>this.login()}>
          <View style={styles.button}>
            <Text style={styles.text}>Login</Text>
          </View>
        </TouchableOpacity>

        <Text>Or Sign Up Using</Text>

        <View style={{flexDirection:'row', marginTop:40, justifyContent:'center'}}>

          <TouchableOpacity onPress={() => this._testFacebookLogin('1201211719949057', permissions, 'web')} style={[styles.icon]}>
            <FontAwesome name="facebook" size={25} color='#fff' />
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>this.signIn()} style={[styles.icon, {backgroundColor:'#ea3f39'}]}>
            <FontAwesome name="google" size={25} color='#fff' />
          </TouchableOpacity>
          
        </View>

        <Text style={{marginVertical:15}}>Have not account yet?</Text>

        <TouchableOpacity onPress={()=>Actions.signup()}>
          <Text style={{fontWeight:'500'}}>SIGN UP</Text>
        </TouchableOpacity>
        {this.renderIndicator()}
      </View>
    )
  }
}

export default connect(
  state => ({
    me:state.common.me,
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Test);


const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fff'
  },
  login:{
    fontSize:30,
    fontWeight:'600',
    marginVertical:20
  },
  image:{
    width:200,
    height:100
  },
  text:{
    fontSize:18,
    color:'#fff',
    fontWeight:'600',
    paddingHorizontal:120,
    paddingVertical:12
  },
  button:{  
    backgroundColor:'#16c6e1',
    borderRadius:40,
    marginVertical:22
  },
  button1:{
    backgroundColor:'blue',
    borderRadius:40,
    marginVertical:16
  },
  icon:{
    width:40,
    height:40,
    marginHorizontal:20,
    borderRadius:20,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#3d5b98'
  },
  inputicon:{
    position:'absolute',
    top:32,
    left:8
  },
  input: {
    fontSize: 14,
    color: '#111',
    paddingLeft:40,
    height: 44,
    alignSelf: "stretch",
    marginBottom: 3,
    borderBottomWidth:1,
    borderBottomColor:'#888'
  },
  indicatorContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  indicator: {
    width: 80,
    height: 80,
    borderRadius: 5,
    shadowColor: "black",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    backgroundColor: "white"
  },
});
