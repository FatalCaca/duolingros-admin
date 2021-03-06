import Vue from 'vue'
import Vuex from 'vuex'

import {security} from './security'
import {lesson} from './lesson'

Vue.use(Vuex)

export const store = new Vuex.Store({
    modules: {
        security,
        lesson,
    }
})
