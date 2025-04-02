import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const onboarding = () => {
  return (
    <View style={styles.view} >
      <Text style={styles.text} >onboarding</Text>
    </View>
  )
}

export default onboarding

const styles = StyleSheet.create({
  view:{
    backgroundColor: 'red',
  },
  text:{
    color: 'white'
  }
})