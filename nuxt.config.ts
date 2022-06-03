import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    buildModules: ['@nuxtjs/tailwindcss','@nuxtjs/google-fonts'],
  css: ["~/assets/css/main.scss"],
  head: {
      title:"Cosmos-peg Handshake"
    },
    googleFonts: {
        // download:true,
  families: {
    Roboto: true,
    'Josefin+Sans': true,
            Lato: [100, 300],
    Inter:true,
    Raleway: {
      wght: [100, 400],
      ital: [100]
    },
  }
    },
    ssr: false,
    target: 'static'
})
