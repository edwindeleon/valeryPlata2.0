import { AppRegistry } from 'react-native'
// RN 0.56 Release version crashes
// import App from './src/App'
// AppRegistry.registerComponent('MyApp', () => App)

// Workaround: RN 0.56 Release version crashes
// Sources:
//      https://github.com/facebook/react-native/issues/19827
//      https://github.com/facebook/react-native/issues/20150


import applyDecoratedDescriptor from '@babel/runtime/helpers/es6/applyDecoratedDescriptor'
import initializerDefineProperty from '@babel/runtime/helpers/es6/initializerDefineProperty'

Object.assign(babelHelpers, {applyDecoratedDescriptor, initializerDefineProperty})

// Your main app code is in /src/index.js
AppRegistry.registerComponent('valeryPlata', () => require('./src').default)

