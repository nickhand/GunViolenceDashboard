import Vue from 'vue'
import App from './App.vue'
import store from './store'
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

// make FA does not watch SVG elements
if (window.FontAwesome) window.FontAwesome.config.observeMutations = false;
Vue.config.productionTip = false;

// Fix leaflet icons
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png")
});


// load and set the HTML template we are using
let audit_content = $("#main");
audit_content.html(`<div id="app"></div>`);

// remove the report button
$(".entry-header .btn")
  .first()
  .remove();

// add help message
let helpMessage = `<p class='help-message'>
  Comments or feedback? Please contact
  <a href="mailto:controller.policy@phila.gov">controller.policy@phila.gov</a>.
  </p>`;
$(".back-link").after(helpMessage);

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
