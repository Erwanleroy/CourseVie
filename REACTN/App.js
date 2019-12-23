import React from 'react';
import { StyleSheet, Button, ProgressBarAndroid, View, ScrollView } from 'react-native';
import TextInput from 'react-native-material-textinput'
import { ListItem } from 'react-native-elements'
import { Dialog } from 'react-native-simple-dialogs';
import { AsyncStorage } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // single product
      newProduct: "",
      // all products
      totalList: [],
      totalIdList: [],
      loading: false,
      listTouched: [],
      pass: "",
      dialogVisible: true,
      passOk: false,
    }
  }

  componentDidMount = async () => {
    rememberedPass = await AsyncStorage.getItem("passwourd")
    if (rememberedPass !== null) {
      this.setState({ pass: rememberedPass }, () => { this.sendPass() })
    }
  }

  // i prefer to use a state to edit the list coz it refresh the page
  // in real time and in background it update the db
  addProduct = async () => {
    // local lsit refreshed
    this.state.totalList.push(this.state.newProduct)
    // add the product to the db with the api
    fetch('https://apizer.000webhostapp.com/testApi.php?a=2&v=' + this.state.newProduct);
    // empty input
    this.setState({ newProduct: "" })
    this.getData()
  }

  getData = () => {
    this.setState({ loading: true })
    fetch("https://apizer.000webhostapp.com/testApi.php?a=1&v=")
      .then(function (a) {
        return a.json()
      })
      .then(json => {
        tmpValue = ""
        tmpArray = []
        tmpIdArray = []
        // console.log(json)
        json.map((value) => {
          tmpArray.push(value["Product"])
          tmpIdArray.push(value["ID"])
        })
        this.setState({
          totalList: tmpArray,
          totalIdList: tmpIdArray,
          loading: false
        })
      })
  }

  sendPass = () => {
    lowerPass = this.state.pass
    lowerPass = lowerPass.toLowerCase()
    fetch("https://apizer.000webhostapp.com/testApi.php?a=4&v=" + lowerPass)
      .then(function (a) {
        return a.json()
      })
      .then(async json => {
        if (json == true) {
          await AsyncStorage.setItem("passwourd", this.state.pass)
          this.setState({
            passOk: true,
            dialogVisible: false,
          })
          this.getData()
        }
      })
  }

  deleteData = Id => {
    // this.setState({ totalList: this.state.totalList.slice(0, Id) + this.state.totalList.slice(Id + 1) })
    fetch("https://apizer.000webhostapp.com/testApi.php?a=3&v=" + this.state.totalIdList[Id])
      .then(() => { this.getData() })
  }

  touchedItem = Id => {
    if (this.state.listTouched.includes(Id)) {
      // this magic from => https://stackoverflow.com/a/44433050
      this.state.listTouched.splice(this.state.listTouched.indexOf(Id), 1);
    } else {
      this.state.listTouched.push(Id)
    }
    this.getData()
  }

  multipleDelete = () => {
    this.state.listTouched.map((value) => {
      this.deleteData(value)
    })
    this.setState({ listTouched: [] })
  }

  render() {
    return (
      // i dont know why but the scroll view only on the list dont work
      <ScrollView>
        <Dialog
          visible={this.state.dialogVisible}
          title="Mot de passe"
        // onTouchOutside={() => this.setState({ dialogVisible: false })} 
        >
          <View>
            <TextInput
              value={this.state.pass}
              color="#FFF"
              label="Mot de passe"
              onChangeText={pass => this.setState({ pass })}
            />
            <Button
              title="OK"
              color="red"
              onPress={this.sendPass}
            />
          </View>
        </Dialog>
        <View style={styles.input}>
          <View
            style={styles.textInput}
          >
            {/* new product input */}
            <TextInput
              textColor="red"
              value={this.state.newProduct}
              label="Produit a ajouter"
              onChangeText={newProduct => this.setState({ newProduct })}
            />
          </View>
          <View
            style={styles.addButton}
          >
            {/* add product */}
            <Button
              color="chartreuse"
              onPress={this.addProduct}
              title="Add"
              disabled={!this.state.passOk}
            />
          </View>
        </View>
        {/* button to replace by a component mount */}
        <Button
          disabled={!this.state.passOk}
          title="Rafraichir la liste"
          onPress={this.getData}
        />

        {this.state.totalList[0] ? (
          <View>
            {/* print list of course mdr */}
            {this.state.totalList.map((value, index) => {
              // last item of the list dont get the divider
              if (index !== this.state.totalList.length - 1) {
                if (this.state.listTouched.includes(index)) {
                  // touched
                  return (
                    <ListItem
                      title={value}
                      titleStyle={{ textDecorationLine: "line-through" }}
                      key={index}
                      onPress={() => { this.touchedItem(index) }}
                      bottomDivider
                      onLongPress={() => this.deleteData(index)}
                    />
                  )
                } else {
                  // not touched
                  return (
                    <ListItem
                      title={value}
                      key={index}
                      bottomDivider
                      onPress={() => { this.touchedItem(index) }}
                      onLongPress={() => this.deleteData(index)}
                    />
                  )
                }
                // last item => no divider
              } else {
                if (this.state.listTouched.includes(index)) {
                  // touched
                  return (
                    <ListItem
                      titleStyle={{ textDecorationLine: "line-through" }}
                      onLongPress={() => this.deleteData(index)}
                      onPress={() => { this.touchedItem(index) }}
                      title={value}
                      key={index}
                    />
                  )
                } else {
                  // not touched
                  return (
                    <ListItem
                      onLongPress={() => this.deleteData(index)}
                      title={value}
                      key={index}
                      onPress={() => { this.touchedItem(index) }}
                    />
                  )
                }
              }
            })}
          </View>
        ) : null}
        {/* tant que la page nest pas charge */}
        {this.state.loading ? (
          <ProgressBarAndroid
            styleAttr="Horizontal"
          />
        ) : null}
        {this.state.listTouched.length !== 0 ? (
          <View
            style={styles.buttonRemove}
          >
            <Button
              color="orange"
              title="Suppr"
              onPress={this.multipleDelete}
            />
          </View>
        ) : null}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    marginTop: 100,
    marginBottom: 50,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  textInput: {
    width: "65%",
  },
  addButton: {
    width: "25%",
    marginTop: 10,
  },
  buttonRemove: {
    position: "absolute",
    right: 0,
    top: 50,
    width: "30%",
  },
});
