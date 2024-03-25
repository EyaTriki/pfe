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
import {freeGames, paidGames, sliderData} from '../model/data';
import BannerSlider from '../components/BannerSlider';
import {windowWidth} from '../utils/Dimensions';
import CustomSwitch from '../components/CustomSwitch';
import ListItem from '../components/ListItem';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({navigation}) => {
  const [gamesTab , setGamesTab]= useState(1);
  const {userInfo}= useContext(AuthContext) ;
  const renderBanner = ({item, index}) => {
    return <BannerSlider data={item} />;
  };
  const onSelectSwitch=(value)=>{
    setGamesTab(value)
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
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              fontFamily: 'Roboto-Medium',
              marginTop: 10,
            }}>
            Hello {userInfo.user.fullname}
          </Text>
          <TouchableOpacity onPress={()=>navigation.openDrawer()}>
          <ImageBackground
            source={require('../assets/images/user-profile.jpg')}
            style={{width: 50, height: 50}}
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
            paddingHorizontal: 10,
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
            Upcoming Games
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
            option1="Free to play"
            option2="Paid games"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        {gamesTab == 1 &&
        freeGames.map(item =>(
          <ListItem key={item.id}
          photo={item.poster} 
          title={item.title} 
          subTitle={item.subtitle}
          isFree={item.isFree}
          onPress={()=>navigation.navigate('GameDetails',
          {title:item.title , id:item.id})}
          />
        )) }
        {gamesTab == 2 &&  paidGames.map(item =>(
          <ListItem key={item.id}
          photo={item.poster} 
          title={item.title} 
          subTitle={item.subtitle}
          isFree={item.isFree}
          price={item.price}
          onPress={()=>navigation.navigate('GameDetails',
           {title:item.title , id:item.id})}/>
          
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;