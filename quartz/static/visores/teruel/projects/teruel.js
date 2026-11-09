const projectConfig = {

  id: "teruel",

  title: "La trufa en Teruel",

  description: "Superficie cultivada, población, edad y nivel de renta municipal.",

maps: {

  autonomousCommunities: {
    enabled: false,
    file: "maps/espana-ccaa.geojson"
  },

  provinces: {
    enabled: true,
    file: "maps/espana-provincias.geojson"
  },

  municipalities: {
    enabled: true,
    file: "maps/teruel-municipios.geojson"
  }

},

mapStyle: {

  background: {
    enabled: true,
    fill: "#f7f7f7"
  },

  autonomousCommunities: {
    fill: "none",
    stroke: "#999999",
    strokeWidth: 1.5
  },

  provinces: {
    fill: "#e5e5e5",
    stroke: "#ffffff",
    strokeWidth: 1
  },

  municipalities: {
    noDataFill: "#d9d9d9",
    stroke: "#ffffff",
    strokeWidth: 0.45
  }

},

  data: "data/poblacion_teruel_2025.csv",

  initialIndicator: "poblacion",

  indicators: {

    trufa: {
      label: "Trufa cultivada",
      enabled: false
    },

    poblacion: {
      field: "POBLACION",
      label: "Población",
      unit: "habitantes",
      color: "#0066A4",
      enabled: true,

      scale: {
        mode: "steps",
        breaks: [100, 250, 500, 1700],
        intensities: [0.15, 0.30, 0.60, 0.80, 1]
      }
    },

    edad: {
      label: "Edad media",
      enabled: false
    },

    renta: {
      label: "Renta media",
      enabled: false
    }
  },

  view: {
    width: 600,
    height: 800,

    fitExtent: [
      [55, 300],
      [545, 750]
    ],

    minZoom: 1,
    maxZoom: 8
  }

};