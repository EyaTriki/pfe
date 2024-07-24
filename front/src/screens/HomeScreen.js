import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React , {useState , useContext} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Carousel from 'react-native-snap-carousel';
import {tipsAndAdvices, healthTracker, sliderData} from '../model/data';
import BannerSlider from '../components/BannerSlider';
import {windowWidth} from '../utils/Dimensions';
import CustomSwitch from '../components/CustomSwitch';
import ListItem from '../components/ListItem';
import { AuthContext } from '../context/AuthContext';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomLoader from '../components/CustomLoader';

const HomeScreen = ({navigation}) => {
  const [swipeTab , setSwipeTab]= useState(1);
  const {userInfo}= useContext(AuthContext) ;

  
  useEffect(() => {
    requestUserPermission();
    if (userInfo && userInfo.user) {
      const userEmail = userInfo.user.email;
      getToken(userEmail);
      // Handle FCM messages
      const unsubscribe = messaging().onTokenRefresh(token => {
        console.log('FCM Token refreshed:', token);
        saveTokenToServer(token, userEmail);
      });

      return () => unsubscribe();
    }
  }, [userInfo]);  // Depend on userInfo

  if (!userInfo) {
    return <CustomLoader />;
  }
  
  const renderBanner = ({item, index}) => {
    return <BannerSlider data={item} />;
  };
  const onSelectSwitch=(value)=>{
    setSwipeTab(value)
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={{padding: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            marginTop: 5,
          }}>
            <TouchableOpacity onPress={()=>navigation.openDrawer()}>
            < Entypo name='menu' color='black' size={30} style={{width: 50, height: 50, marginTop:4}}/>
            </TouchableOpacity>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Roboto-Medium',
              marginTop: 5,
              marginLeft:-160            }}>
            Hello {userInfo.user.fullname} {userInfo.user.name}
          </Text>
          <TouchableOpacity onPress={()=>navigation.openDrawer()}>
          <ImageBackground
           source={
            userInfo.user.avatar ||userInfo.user.photo 
              ? {uri: userInfo.user.avatar ||userInfo.user.photo }
              : require('../assets/images/user-profile.jpg')
          }
            style={{width: 50, height: 50, marginTop:-3}}
            imageStyle={{borderRadius: 25}}
          />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            borderColor: '#C6C6C6',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}>
          <Feather
            name="search"
            size={20}
            color="#C6C6C6"
            style={{marginRight: 5, marginTop: 15}}
          />
          <TextInput
            style={{color: 'black'}}
            placeholderTextColor={'grey'}
            placeholder="Search"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 15,
          }}>
          <Text
            style={{color: 'black', fontSize: 18, fontFamily: 'Roboto-Medium'}}>
            Upcoming Features
          </Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={{color: '#0aada8'}}>See all</Text>
          </TouchableOpacity>
        </View>

        <Carousel
          ref={c => {
            this._carousel = c;
          }}
          data={sliderData}
          renderItem={renderBanner}
          sliderWidth={windowWidth - 40}
          itemWidth={300}
          loop={true}
        />
        <View style={{
          marginVertical:20
        }}>
          <CustomSwitch
            selectionMode={1}
            option1="Tips and Advices"
            option2="Health Tracker"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        {swipeTab == 1 &&
        tipsAndAdvices.map(item =>(
          <ListItem key={item.id}
          photo={item.poster} 
          title={item.title} 
          subTitle={item.subtitle}
          isFree={item.isFree}
          onPress={()=>navigation.navigate('SignDetails',
          {title:item.subtitle , id:item.id})}
          />
        )) }
        {swipeTab == 2 &&  healthTracker.map(item =>(
          <ListItem key={item.id}
          photo={item.poster} 
          title={item.title} 
          subTitle={item.subtitle}
          isFree={item.isFree}
          price={item.price}
          onPress={()=>navigation.navigate('SignDetails',
           {title:item.subtitle , id:item.id})}/>
          
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;