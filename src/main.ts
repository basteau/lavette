import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import ui from "@nuxt/ui/vue-plugin";
import App from "./App.vue";
import { allFontFaces } from "./fonts";
import "./styles.css";
const fontStyle = document.createElement("style");
fontStyle.id = "lavette-fonts";
fontStyle.textContent = allFontFaces();
document.head.append(fontStyle);
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: "/", component: App }],
});
createApp(App).use(router).use(ui).mount("#app");
