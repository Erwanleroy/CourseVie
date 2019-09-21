import { createStackNavigator, createAppContainer } from 'react-navigation'
import Home from '../Home/page'

const SearchStackNavigator = createStackNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      title: 'Home'
    }
  },
})

export default createAppContainer(SearchStackNavigator)